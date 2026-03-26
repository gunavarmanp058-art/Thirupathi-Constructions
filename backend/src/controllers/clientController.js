const pool = require('../config/db');
const { predictMachineHealth, analyzeProjectProgress, analyzeImageProgress, analyzeInfrastructure } = require('../services/aiService');

const ClientController = {
    getDashboard: async (req, res, next) => {
        try {
            const clientId = req.user.clientId;
            const [projects] = await pool.query("SELECT COUNT(*) as count FROM projects WHERE client_id = ?", [clientId]);
            const [tickets] = await pool.query("SELECT COUNT(*) as count FROM tickets WHERE client_id = ? AND status != 'RESOLVED'", [clientId]);

            const [machines] = await pool.query(`
                SELECT COUNT(DISTINCT ma.machine_id) as count 
                FROM machine_assignments ma
                JOIN projects p ON ma.project_id = p.id
                WHERE p.client_id = ?
            `, [clientId]);

            res.json({
                message: 'Client dashboard stats fetched',
                data: {
                    assignedProjects: projects[0].count,
                    openTickets: tickets[0].count,
                    assignedMachines: machines[0].count
                }
            });
        } catch (err) { next(err); }
    },

    getMessages: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const [rows] = await pool.query(
                `SELECT id, sender_id as senderId, receiver_id as receiverId, message, timestamp
                 FROM messages
                 WHERE sender_id = ? OR receiver_id = ?
                 ORDER BY timestamp ASC`,
                [userId, userId]
            );

            res.json({ message: 'Chat history fetched', data: rows });
        } catch (err) { next(err); }
    },

    getProjects: async (req, res, next) => {
        try {
            const [rows] = await pool.query(`
                SELECT p.*, 
                COALESCE((SELECT ROUND(AVG(actual_percent), 2) FROM project_progress WHERE project_id = p.id), 0) as progress
                FROM projects p 
                WHERE p.client_id = ?
            `, [req.user.clientId]);
            res.json({ message: 'Assigned projects fetched', data: rows });
        } catch (err) { next(err); }
    },

    createProject: async (req, res, next) => {
        try {
            const { name, type, status, planned_start, planned_end, expected_end, location } = req.body;
            const client_id = req.user.clientId;
            const [result] = await pool.query(
                "INSERT INTO projects (name, type, client_id, status, planned_start, planned_end, expected_end, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [name, type, client_id, status || 'PLANNED', planned_start, planned_end, expected_end, location]
            );
            res.status(201).json({ message: 'Project created', data: { id: result.insertId } });
        } catch (err) { next(err); }
    },

    getProjectById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.query("SELECT * FROM projects WHERE id = ? AND client_id = ?", [id, req.user.clientId]);
            if (rows.length === 0) return res.status(403).json({ message: 'Access denied or project not found' });
            res.json({ message: 'Project details fetched', data: rows[0] });
        } catch (err) { next(err); }
    },

    getProjectProgress: async (req, res, next) => {
        try {
            const { id } = req.params;
            const [proj] = await pool.query("SELECT id FROM projects WHERE id = ? AND client_id = ?", [id, req.user.clientId]);
            if (proj.length === 0) return res.status(403).json({ message: 'Access denied' });

            const [progress] = await pool.query("SELECT * FROM project_progress WHERE project_id = ? ORDER BY week_date ASC", [id]);
            const aiResult = await analyzeProjectProgress(progress);

            res.json({
                message: 'Project progress fetched',
                data: { timeline: progress, aiAnalysis: aiResult }
            });
        } catch (err) { next(err); }
    },

    addProgress: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { week_date, notes } = req.body;
            const media_url = req.file ? `/uploads/${req.file.filename}` : null;

            const [projRows] = await pool.query(
                "SELECT id, type, planned_start, expected_end FROM projects WHERE id = ? AND client_id = ?",
                [id, req.user.clientId]
            );
            if (projRows.length === 0) return res.status(403).json({ message: 'Access denied' });

            const projectType = projRows[0].type || 'ROAD';

            let computedActual = 0;
            const [lastProgress] = await pool.query(
                "SELECT actual_percent FROM project_progress WHERE project_id = ? ORDER BY week_date DESC LIMIT 1",
                [id]
            );
            if (lastProgress.length > 0) {
                computedActual = parseFloat(lastProgress[0].actual_percent) || 0;
            }

            let imageAnalysis = null;
            let infraAnalysis = null;
            if (media_url) {
                const filePath = `./${media_url.replace(/^\//, '')}`;
                
                // Concurrent analysis for speed
                const [progRes, infraRes] = await Promise.all([
                    analyzeImageProgress(filePath),
                    analyzeInfrastructure(filePath, projectType)
                ]);
                
                imageAnalysis = progRes;
                infraAnalysis = infraRes;

                const estimate = imageAnalysis?.progress_estimate;
                if (typeof estimate === 'number') {
                    computedActual = Math.max(computedActual, Math.min(100, Math.round(estimate)));
                }
            }

            await pool.query(
                "INSERT INTO project_progress (project_id, week_date, actual_percent, notes, media_url, ai_analysis) VALUES (?, ?, ?, ?, ?, ?)",
                [id, week_date, computedActual, notes, media_url, JSON.stringify(infraAnalysis)]
            );

            const [[{ avg_progress }]] = await pool.query(
                "SELECT AVG(actual_percent) as avg_progress FROM project_progress WHERE project_id = ?",
                [id]
            );
 
            const newStatus = parseFloat(avg_progress) >= 100 ? 'COMPLETED' : 'ONGOING';
            await pool.query("UPDATE projects SET status = ? WHERE id = ?", [newStatus, id]);

            res.status(201).json({
                message: 'Progress added',
                data: { actual_percent: computedActual, status: newStatus, imageAnalysis }
            });
        } catch (err) { next(err); }
    },

    getMachines: async (req, res, next) => {
        try {
            const [rows] = await pool.query(`
                SELECT DISTINCT m.* 
                FROM machines m
                JOIN machine_assignments ma ON m.id = ma.machine_id
                WHERE ma.client_id = ?
            `, [req.user.clientId]);
            res.json({ message: 'Assigned machines fetched', data: rows });
        } catch (err) { next(err); }
    },

    getMachineAI: async (req, res, next) => {
        try {
            const { machineId } = req.params;
            const [logs] = await pool.query("SELECT * FROM machine_logs WHERE machine_id = ? ORDER BY log_date DESC LIMIT 1", [machineId]);
            if (logs.length === 0) return res.status(404).json({ message: 'No logs found' });

            const log = logs[0];
            const aiResult = await predictMachineHealth(
                log.working_hours,
                log.fuel_used,
                log.last_maintenance_date,
                log.breakdown_count
            );
            res.json({ message: 'Machine AI fetched', data: aiResult });
        } catch (err) { next(err); }
    },

    createTicket: async (req, res, next) => {
        try {
            const { project_id, message, priority } = req.body;
            await pool.query(
                "INSERT INTO tickets (client_id, project_id, message, priority) VALUES (?, ?, ?, ?)",
                [req.user.clientId, project_id || null, message, priority || 'MEDIUM']
            );
            res.status(201).json({ message: 'Ticket created', data: null });
        } catch (err) { next(err); }
    },

    getTickets: async (req, res, next) => {
        try {
            const [rows] = await pool.query("SELECT * FROM tickets WHERE client_id = ?", [req.user.clientId]);
            res.json({ message: 'Tickets fetched', data: rows });
        } catch (err) { next(err); }
    },

    getAIReports: async (req, res, next) => {
        try {
            const [projects] = await pool.query("SELECT * FROM projects WHERE client_id = ?", [req.user.clientId]);
            const reports = await Promise.all(projects.map(async (project) => {
                const [progress] = await pool.query("SELECT * FROM project_progress WHERE project_id = ? ORDER BY week_date ASC", [project.id]);
                const aiResult = await analyzeProjectProgress(progress);
                
                let insight = aiResult.health === 'High Risk' ? `High risk of delay.` : `Project is steady.`;
                
                return {
                    id: project.id,
                    name: project.name,
                    health: aiResult.health,
                    progress: progress.length > 0 ? (progress.reduce((sum, item) => sum + (parseFloat(item.actual_percent) || 0), 0) / progress.length) : 0,
                    aiInsight: insight
                };
            }));
            res.json({ message: 'AI Reports generated', data: reports });
        } catch (err) { next(err); }
    },

    requestMachinery: async (req, res, next) => {
        try {
            const clientId = req.user.clientId;
            const { machine_id, project_id, full_name, email, phone, message } = req.body;
            if (!/^[0-9]{10}$/.test(phone)) return res.status(400).json({ message: 'Invalid phone' });

            await pool.query(
                "INSERT INTO machinery_booking_requests (client_id, machine_id, project_id, full_name, email, phone, message) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [clientId, machine_id, project_id || null, full_name, email, phone, message]
            );
            res.status(201).json({ message: 'Request submitted' });
        } catch (err) { next(err); }
    },

    getBookingRequests: async (req, res, next) => {
        try {
            const [rows] = await pool.query(
                `SELECT mbr.*, m.name as machine_name, m.model as machine_model FROM machinery_booking_requests mbr JOIN machines m ON mbr.machine_id = m.id WHERE mbr.client_id = ? ORDER BY mbr.created_at DESC`,
                [req.user.clientId]
            );
            res.json({ message: 'Requests fetched', data: rows });
        } catch (err) { next(err); }
    },

    returnMachine: async (req, res, next) => {
        try {
            const { id } = req.params;
            const clientId = req.user.clientId;
            const { log_date, working_hours, fuel_used, breakdown_count, last_maintenance_date } = req.body;
            const media_url = req.file ? `/uploads/${req.file.filename}` : null;

            const [assignments] = await pool.query(
                "SELECT * FROM machine_assignments WHERE machine_id = ? AND client_id = ?",
                [id, clientId]
            );
            if (assignments.length === 0) return res.status(403).json({ message: 'Unauthorized' });

            const aiResult = await predictMachineHealth(working_hours, fuel_used, last_maintenance_date, breakdown_count);
            
            await pool.query(
                "INSERT INTO machine_logs (machine_id, log_date, working_hours, fuel_used, breakdown_count, last_maintenance_date, media_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [id, log_date, working_hours, fuel_used, breakdown_count, last_maintenance_date, media_url]
            );

            let newStatus = (aiResult.condition === 'Critical' || aiResult.condition === 'Needs Maintenance') ? 'MAINTENANCE' : 'AVAILABLE';
            await pool.query("UPDATE machines SET status = ? WHERE id = ?", [newStatus, id]);
            await pool.query("DELETE FROM machine_assignments WHERE machine_id = ? AND client_id = ?", [id, clientId]);

            res.json({ message: 'Machine returned', data: { status: newStatus, aiAnalysis: aiResult } });
        } catch (err) { next(err); }
    }
};

module.exports = ClientController;
