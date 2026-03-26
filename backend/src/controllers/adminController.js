const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const aiService = require('../services/aiService');
const fs = require('fs');

const AdminController = {
    getDashboardStats: async (req, res, next) => {
        try {
            const [[{ total_projects }]] = await pool.query("SELECT COUNT(*) as total_projects FROM projects");
            const [[{ active_projects }]] = await pool.query("SELECT COUNT(*) as active_projects FROM projects WHERE status = 'ONGOING'");
            const [[{ total_machines }]] = await pool.query("SELECT COUNT(*) as total_machines FROM machines");
            const [[{ total_clients }]] = await pool.query("SELECT COUNT(*) as total_clients FROM clients");
            const [[{ total_enquiries }]] = await pool.query("SELECT COUNT(*) as total_enquiries FROM enquiries");

            // AI Alerts Summary (Simplified logic for dashboard)
            const [highUsageMachines] = await pool.query("SELECT COUNT(*) as count FROM machine_logs ml JOIN machines m ON ml.machine_id = m.id WHERE ml.working_hours > 200 AND m.status != 'MAINTENANCE'");
            const [atRiskProjects] = await pool.query("SELECT COUNT(*) as count FROM projects WHERE status = 'ONGOING' AND id IN (SELECT project_id FROM project_progress WHERE actual_percent < planned_percent * 0.9)");

            const [recentProjects] = await pool.query(`
                SELECT p.*, c.company_name as client_name 
                FROM projects p 
                LEFT JOIN clients c ON p.client_id = c.id 
                ORDER BY p.created_at DESC LIMIT 5
            `);

            const [recentEnquiries] = await pool.query("SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 5");

            res.json({
                message: 'Admin dashboard stats fetched',
                data: {
                    stats: {
                        totalProjects: total_projects,
                        activeProjects: active_projects,
                        totalMachines: total_machines,
                        totalClients: total_clients,
                        totalEnquiries: total_enquiries,
                        aiAlerts: (highUsageMachines[0]?.count || 0) + (atRiskProjects[0]?.count || 0)
                    },
                    recentProjects,
                    recentEnquiries
                }
            });
        } catch (err) { next(err); }
    },

    getMessages: async (req, res, next) => {
        try {
            const adminId = req.user.userId;
            const clientId = parseInt(req.query.clientId, 10);

            if (clientId) {
                const [rows] = await pool.query(
                    `SELECT id, sender_id as senderId, receiver_id as receiverId, message, timestamp
                     FROM messages
                     WHERE (sender_id = ? AND (receiver_id = ? OR receiver_id IS NULL))
                        OR (sender_id = ? AND receiver_id = ?)
                     ORDER BY timestamp ASC`,
                    [clientId, adminId, adminId, clientId]
                );
                return res.json({ message: 'Conversation fetched', data: rows });
            }

            // If no client specified, return recent messages sent by clients (receiver_id IS NULL)
            const [rows] = await pool.query(
                `SELECT id, sender_id as senderId, receiver_id as receiverId, message, timestamp
                 FROM messages
                 WHERE receiver_id IS NULL
                 ORDER BY timestamp DESC
                 LIMIT 50`
            );

            res.json({ message: 'Recent client messages fetched', data: rows });
        } catch (err) { next(err); }
    },

    // Clients
    createUser: async (req, res, next) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const { name, email, password, role, company_name, phone, address } = req.body;
            const finalRole = role === 'ADMIN' ? 'ADMIN' : 'CLIENT';

            if (finalRole === 'CLIENT' && phone && !/^[0-9]{10}$/.test(phone)) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({ message: 'Password must be 8+ characters with uppercase, lowercase, number & special character.' });
            }

            const hash = await bcrypt.hash(password, 10);

            const [userResult] = await conn.query(
                "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
                [name, email, hash, finalRole]
            );

            const userId = userResult.insertId;
            if (finalRole === 'CLIENT') {
                await conn.query(
                    "INSERT INTO clients (user_id, company_name, phone, address) VALUES (?, ?, ?, ?)",
                    [userId, company_name || null, phone || null, address || null]
                );
            }

            await conn.commit();
            res.status(201).json({ message: 'User created successfully', data: { userId } });
        } catch (err) {
            await conn.rollback();
            next(err);
        } finally { conn.release(); }
    },

    getAllUsers: async (req, res, next) => {
        try {
            const [rows] = await pool.query(`
                SELECT u.id as user_id, u.name, u.email, u.role, c.id as client_id, c.company_name, c.phone, c.address 
                FROM users u 
                LEFT JOIN clients c ON u.id = c.user_id
                ORDER BY u.created_at DESC
            `);
            res.json({ message: 'All users fetched', data: rows });
        } catch (err) { next(err); }
    },

    getAllClients: async (req, res, next) => {
        try {
            const [rows] = await pool.query(`
                SELECT c.id as client_id, c.company_name, u.name as contact_person
                FROM clients c
                JOIN users u ON c.user_id = u.id
            `);
            res.json({ message: 'All clients fetched', data: rows });
        } catch (err) { next(err); }
    },

    // Projects
    createProject: async (req, res, next) => {
        try {
            const { name, type, client_id, status, planned_start, planned_end, expected_end, location } = req.body;

            // Convert empty string to null for integer column
            const finalClientId = client_id === "" ? null : client_id;

            const [result] = await pool.query(
                "INSERT INTO projects (name, type, client_id, status, planned_start, planned_end, expected_end, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [name, type, finalClientId, status, planned_start, planned_end, expected_end, location]
            );
            res.status(201).json({ message: 'Project created', data: { id: result.insertId } });
        } catch (err) { next(err); }
    },

    getAllProjects: async (req, res, next) => {
        try {
            const [rows] = await pool.query(`
                SELECT p.*, c.company_name as client_name,
                COALESCE((SELECT ROUND(AVG(actual_percent), 2) FROM project_progress WHERE project_id = p.id), 0) as progress
                FROM projects p 
                LEFT JOIN clients c ON p.client_id = c.id
                ORDER BY p.created_at DESC
            `);
            res.json({ message: 'All projects fetched', data: rows });
        } catch (err) { next(err); }
    },

    updateProject: async (req, res, next) => {
        try {
            const { id } = req.params;
            const updates = { ...req.body };

            // Convert empty string to null for integer column
            if (updates.client_id === "") {
                updates.client_id = null;
            }

            const query = "UPDATE projects SET ? WHERE id = ?";
            await pool.query(query, [updates, id]);
            res.json({ message: 'Project updated', data: null });
        } catch (err) { next(err); }
    },

    deleteProject: async (req, res, next) => {
        try {
            const { id } = req.params;
            await pool.query("DELETE FROM projects WHERE id = ?", [id]);
            res.json({ message: 'Project deleted successfully' });
        } catch (err) { next(err); }
    },

    assignClient: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { client_id } = req.body;
            await pool.query("UPDATE projects SET client_id = ? WHERE id = ?", [client_id, id]);
            res.json({ message: 'Client assigned to project', data: null });
        } catch (err) { next(err); }
    },

    // Weekly Progress
    addProgress: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { week_date, planned_percent, actual_percent, notes } = req.body;
            const media_url = req.file ? `/uploads/${req.file.filename}` : null;

            let finalActual = parseFloat(actual_percent) || 0;

            // Fetch project type for specialized analysis
            const [projRows] = await pool.query("SELECT type FROM projects WHERE id = ?", [id]);
            const projectType = projRows[0]?.type || 'ROAD';

            // Perform AI analyses concurrently
            let imageAnalysis = null;
            let infraAnalysis = null;
            if (media_url) {
                const filePath = `./${media_url.replace(/^\//, '')}`;
                const [progRes, infraRes] = await Promise.all([
                    aiService.analyzeImageProgress(filePath),
                    aiService.analyzeInfrastructure(filePath)
                ]);
                
                imageAnalysis = progRes;
                infraAnalysis = infraRes;

                // STRICT ENFORCEMENT: Only road and pipeline allowed
                if (infraAnalysis && infraAnalysis.detected === 'None') {
                    // Delete the uploaded file if it's invalid infrastructure
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    
                    return res.status(400).json({ 
                        message: 'Upload Rejected: No road or pipeline construction detected in the provided media.',
                        details: infraAnalysis.message 
                    });
                }

                const estimate = imageAnalysis?.progress_estimate;
                if (typeof estimate === 'number') {
                    finalActual = Math.round(estimate);
                }
            }

            await pool.query(
                "INSERT INTO project_progress (project_id, week_date, planned_percent, actual_percent, notes, media_url, ai_analysis) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [id, week_date, planned_percent || 0, finalActual, notes, media_url, JSON.stringify(infraAnalysis)]
            );

            // Fetch new total progress average to update project status
            const [[{ avg_progress }]] = await pool.query(
                "SELECT AVG(actual_percent) as avg_progress FROM project_progress WHERE project_id = ?",
                [id]
            );
 
            // Update project status based on total average
            const newStatus = parseFloat(avg_progress) >= 100 ? 'COMPLETED' : 'ONGOING';
            await pool.query("UPDATE projects SET status = ? WHERE id = ?", [newStatus, id]);

            res.status(201).json({ 
                message: 'Progress added', 
                data: { 
                    actual_percent: finalActual,
                    imageAnalysis,
                    infraAnalysis 
                } 
            });
        } catch (err) { next(err); }
    },

    // Machines
    createMachine: async (req, res, next) => {
        try {
            const { name, type, model } = req.body;
            const image_url = req.file ? `/uploads/${req.file.filename}` : null;
            const [result] = await pool.query(
                "INSERT INTO machines (name, type, model, image_url) VALUES (?, ?, ?, ?)",
                [name, type, model, image_url]
            );
            res.status(201).json({ message: 'Machine added', data: { id: result.insertId } });
        } catch (err) { next(err); }
    },

    updateMachine: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { name, type, model, status } = req.body;
            let query = "UPDATE machines SET name = ?, type = ?, model = ?, status = ? WHERE id = ?";
            let params = [name, type, model, status, id];

            if (req.file) {
                const image_url = `/uploads/${req.file.filename}`;
                query = "UPDATE machines SET name = ?, type = ?, model = ?, status = ?, image_url = ? WHERE id = ?";
                params = [name, type, model, status, image_url, id];
            }

            await pool.query(query, params);
            res.json({ message: 'Machine updated' });
        } catch (err) { next(err); }
    },

    getAllMachines: async (req, res, next) => {
        try {
            const [rows] = await pool.query(`
                SELECT m.*, 
                (SELECT working_hours FROM machine_logs WHERE machine_id = m.id ORDER BY log_date DESC LIMIT 1) as total_hours,
                (SELECT fuel_used FROM machine_logs WHERE machine_id = m.id ORDER BY log_date DESC LIMIT 1) as latest_fuel,
                (SELECT last_maintenance_date FROM machine_logs WHERE machine_id = m.id ORDER BY log_date DESC LIMIT 1) as last_maintenance,
                (SELECT breakdown_count FROM machine_logs WHERE machine_id = m.id ORDER BY log_date DESC LIMIT 1) as breakdown_count
                FROM machines m 
                ORDER BY m.created_at DESC
            `);

            const machinesWithAI = await Promise.all(rows.map(async (m) => {
                let aiResult;
                if (m.total_hours !== null) {
                    aiResult = await aiService.predictMachineHealth(
                        m.total_hours,
                        m.latest_fuel || 0,
                        m.last_maintenance,
                        m.breakdown_count || 0
                    );
                } else {
                    aiResult = { condition: 'Good', recommendation: 'New equipment. No maintenance required yet.', source: 'Sentinel v2.4' };
                }
                return { ...m, ai: aiResult };
            }));

            res.json({ message: 'All machines fetched', data: machinesWithAI });
        } catch (err) { next(err); }
    },

    assignMachine: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { project_id, from_date, to_date } = req.body;
            
            // Get client_id from project if possible
            let clientId = null;
            if (project_id) {
                const [proj] = await pool.query("SELECT client_id FROM projects WHERE id = ?", [project_id]);
                if (proj.length > 0) clientId = proj[0].client_id;
            }

            await pool.query(
                "INSERT INTO machine_assignments (machine_id, client_id, project_id, from_date, to_date) VALUES (?, ?, ?, ?, ?)",
                [id, clientId, project_id, from_date, to_date || null]
            );
            await pool.query("UPDATE machines SET status = 'ASSIGNED' WHERE id = ?", [id]);
            res.status(201).json({ message: 'Machine assigned to project', data: null });
        } catch (err) { next(err); }
    },

    addMachineLog: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { log_date, working_hours, fuel_used, breakdown_count, last_maintenance_date } = req.body;
            const media_url = req.file ? `/uploads/${req.file.filename}` : null;
            
            // AI Prediction based on log data
            const aiResult = await aiService.predictMachineHealth(
                working_hours,
                fuel_used,
                last_maintenance_date,
                breakdown_count
            );

            // Insert log
            await pool.query(
                "INSERT INTO machine_logs (machine_id, log_date, working_hours, fuel_used, breakdown_count, last_maintenance_date, media_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [id, log_date, working_hours, fuel_used, breakdown_count, last_maintenance_date, media_url]
            );

            // Auto-update status to MAINTENANCE if AI suggests it
            if (aiResult.condition === 'Critical' || aiResult.condition === 'Needs Maintenance') {
                await pool.query("UPDATE machines SET status = 'MAINTENANCE' WHERE id = ?", [id]);
            }

            res.status(201).json({ 
                message: 'Machine log added and health analyzed', 
                data: { aiResult } 
            });
        } catch (err) { next(err); }
    },

    processMachineReturn: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { log_date, working_hours, fuel_used, breakdown_count, last_maintenance_date } = req.body;
            const media_url = req.file ? `/uploads/${req.file.filename}` : null;
            
            // 1. Perform AI Analysis
            const aiResult = await aiService.predictMachineHealth(
                working_hours,
                fuel_used,
                last_maintenance_date,
                breakdown_count
            );

            // 2. Insert log
            await pool.query(
                "INSERT INTO machine_logs (machine_id, log_date, working_hours, fuel_used, breakdown_count, last_maintenance_date, media_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [id, log_date, working_hours, fuel_used, breakdown_count, last_maintenance_date, media_url]
            );

            // 3. Update status: If bad condition -> MAINTENANCE, else -> AVAILABLE
            let newStatus = 'AVAILABLE';
            if (aiResult.condition === 'Critical' || aiResult.condition === 'Needs Maintenance') {
                newStatus = 'MAINTENANCE';
            }

            await pool.query("UPDATE machines SET status = ? WHERE id = ?", [newStatus, id]);
            
            // 4. Remove assignments
            await pool.query("DELETE FROM machine_assignments WHERE machine_id = ?", [id]);

            res.json({ 
                message: 'Machine returned and processed', 
                data: { status: newStatus, aiAnalysis: aiResult } 
            });
        } catch (err) { next(err); }
    },

    deleteMachine: async (req, res, next) => {
        try {
            const { id } = req.params;
            await pool.query("DELETE FROM machines WHERE id = ?", [id]);
            res.json({ message: 'Machine deleted successfully' });
        } catch (err) { next(err); }
    },

    // Tickets
    getAllTickets: async (req, res, next) => {
        try {
            const [rows] = await pool.query("SELECT * FROM tickets");
            res.json({ message: 'All tickets fetched', data: rows });
        } catch (err) { next(err); }
    },

    getAnalytics: async (req, res, next) => {
        try {

            // Get all projects with their latest progress
            const [projects] = await pool.query("SELECT * FROM projects");
            const projectPredictions = await Promise.all(projects.map(async (p) => {
                const [progress] = await pool.query(
                    "SELECT planned_percent, actual_percent FROM project_progress WHERE project_id = ? ORDER BY week_date ASC",
                    [p.id]
                );
                const aiResult = await aiService.analyzeProjectProgress(progress);
                const totalProgress = progress.length > 0 
                    ? progress.reduce((sum, item) => sum + (parseFloat(item.actual_percent) || 0), 0) / progress.length 
                    : 0;
                return {
                    ...p,
                    ai: aiResult,
                    progress: Math.round(totalProgress * 100) / 100
                };
            }));

            // Get all machines with their latest logs
            const [machines] = await pool.query("SELECT * FROM machines");
            const machinePredictions = await Promise.all(machines.map(async (m) => {
                const [[latestLog]] = await pool.query(
                    "SELECT working_hours, fuel_used, last_maintenance_date, breakdown_count FROM machine_logs WHERE machine_id = ? ORDER BY log_date DESC LIMIT 1",
                    [m.id]
                );

                let aiResult;
                if (latestLog) {
                    aiResult = await aiService.predictMachineHealth(
                        latestLog.working_hours,
                        latestLog.fuel_used,
                        latestLog.last_maintenance_date,
                        latestLog.breakdown_count
                    );
                } else {
                    aiResult = { condition: 'Unknown', recommendation: 'No logs available for analysis.', source: 'None' };
                }

                return {
                    ...m,
                    ai: aiResult,
                    logs: latestLog || {}
                };
            }));

            res.json({
                message: 'Analytics data fetched',
                data: {
                    projects: projectPredictions,
                    machines: machinePredictions
                }
            });
        } catch (err) { next(err); }
    },

    updateTicketStatus: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await pool.query("UPDATE tickets SET status = ? WHERE id = ?", [status, id]);
            res.json({ message: 'Ticket status updated', data: null });
        } catch (err) { next(err); }
    },

    getAllEnquiries: async (req, res, next) => {
        try {
            const [rows] = await pool.query("SELECT * FROM enquiries ORDER BY created_at DESC");
            res.json({ message: 'Enquiries fetched', data: rows });
        } catch (err) { next(err); }
    },

    updateEnquiryStatus: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await pool.query("UPDATE enquiries SET status = ? WHERE id = ?", [status, id]);
            res.json({ message: 'Enquiry status updated', data: null });
        } catch (err) { next(err); }
    },

    getBookingRequests: async (req, res, next) => {
        try {
            const [rows] = await pool.query(
                `SELECT mbr.*, m.name as machine_name, m.type as machine_type, m.model as machine_model,
                        c.company_name, u.name as client_name
                 FROM machinery_booking_requests mbr
                 JOIN machines m ON mbr.machine_id = m.id
                 JOIN clients c ON mbr.client_id = c.id
                 JOIN users u ON c.user_id = u.id
                 ORDER BY mbr.created_at DESC`
            );

            res.json({ message: 'All booking requests fetched', data: rows });
        } catch (err) { next(err); }
    },

    acceptBookingRequest: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { from_date, to_date } = req.body;
            const adminId = req.user.userId;

            // Get booking request details
            const [bookingReqs] = await pool.query(
                "SELECT mbr.*, c.id as client_id FROM machinery_booking_requests mbr JOIN clients c ON mbr.client_id = c.id WHERE mbr.id = ?",
                [id]
            );

            if (bookingReqs.length === 0) {
                return res.status(404).json({ message: 'Booking request not found' });
            }

            const booking = bookingReqs[0];
            const finalFromDate = from_date || new Date().toISOString().split('T')[0];
            const finalToDate = to_date || null;

            // Update booking request status
            await pool.query(
                "UPDATE machinery_booking_requests SET status = 'ACCEPTED', reviewed_at = NOW(), reviewed_by = ? WHERE id = ?",
                [adminId, id]
            );

            // Assign machine to project OR client (for general rentals)
            let assignmentQuery, assignmentParams;
            
            if (booking.project_id) {
                // Project-based assignment
                assignmentQuery = "INSERT INTO machine_assignments (machine_id, client_id, project_id, from_date, to_date) VALUES (?, ?, ?, ?, ?)";
                assignmentParams = [booking.machine_id, booking.client_id, booking.project_id, finalFromDate, finalToDate];
            } else {
                // General rental - assign to client only
                assignmentQuery = "INSERT INTO machine_assignments (machine_id, client_id, from_date, to_date) VALUES (?, ?, ?, ?)";
                assignmentParams = [booking.machine_id, booking.client_id, finalFromDate, finalToDate];
            }
            
            await pool.query(assignmentQuery, assignmentParams);

            // Update machine status to ASSIGNED
            await pool.query("UPDATE machines SET status = 'ASSIGNED' WHERE id = ?", [booking.machine_id]);

            // Reject all other pending requests for this machine
            await pool.query(
                "UPDATE machinery_booking_requests SET status = 'REJECTED', reviewed_at = NOW(), reviewed_by = ? WHERE machine_id = ? AND id != ? AND status = 'PENDING'",
                [adminId, booking.machine_id, id]
            );

            res.json({ 
                message: 'Booking request accepted and machine assigned', 
                data: { requestId: id, status: 'ACCEPTED' } 
            });
        } catch (err) { 
            console.error("Accept Booking Request Error:", err);
            next(err); 
        }
    },

    rejectBookingRequest: async (req, res, next) => {
        try {
            const { id } = req.params;
            const adminId = req.user.userId;

            await pool.query(
                "UPDATE machinery_booking_requests SET status = 'REJECTED', reviewed_at = NOW(), reviewed_by = ? WHERE id = ?",
                [adminId, id]
            );

            res.json({ 
                message: 'Booking request rejected', 
                data: { requestId: id, status: 'REJECTED' } 
            });
        } catch (err) { next(err); }
    }
};

module.exports = AdminController;
