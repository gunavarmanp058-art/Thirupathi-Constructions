const pool = require('../config/db');
const MailService = require('../services/mailService');

const PublicController = {
    getCompletedProjects: async (req, res, next) => {
        try {
            const [rows] = await pool.query(`
                SELECT p.*, 
                COALESCE((SELECT ROUND(AVG(actual_percent), 2) FROM project_progress WHERE project_id = p.id), 0) as progress
                FROM projects p 
                WHERE p.status = 'COMPLETED' 
                ORDER BY p.created_at DESC
            `);
            res.json({ message: 'Completed projects fetched', data: rows });
        } catch (err) { next(err); }
    },

    getOngoingProjects: async (req, res, next) => {
        try {
            const [rows] = await pool.query(`
                SELECT p.*, 
                COALESCE((SELECT ROUND(AVG(actual_percent), 2) FROM project_progress WHERE project_id = p.id), 0) as progress
                FROM projects p 
                WHERE p.status IN ('ONGOING', 'PLANNED') 
                ORDER BY p.created_at DESC
            `);
            res.json({ message: 'Ongoing projects fetched', data: rows });
        } catch (err) { next(err); }
    },

    getMachineGallery: async (req, res, next) => {
        try {
            const [rows] = await pool.query("SELECT id, name, type, model, image_url, status FROM machines");
            res.json({ message: 'Machinery gallery fetched', data: rows });
        } catch (err) { next(err); }
    },

    submitEnquiry: async (req, res, next) => {
        try {
            const { name, email, phone, organization, enquiryType, enquiry_type, message, machine_id } = req.body;

            if (phone && !/^[0-9]{10}$/.test(phone)) {
                return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ message: 'Please enter a valid email address.' });
            }

            if (!/^[A-Za-z\s]{3,}$/.test(name)) {
                return res.status(400).json({ message: 'Name must be at least 3 characters and contain only letters.' });
            }

            const type = enquiryType || enquiry_type || 'General Enquiry';
            const [result] = await pool.query(
                "INSERT INTO enquiries (name, email, phone, organization, enquiry_type, message, machine_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [name, email, phone, organization || null, type, message, machine_id || null]
            );

            // Emit real-time notification to admin
            const io = req.app.get('io');
            if (io) {
                io.to('admin-room').emit('new-enquiry', {
                    id: result.insertId,
                    name,
                    email,
                    phone,
                    organization: organization || null,
                    enquiry_type: type,
                    message,
                    created_at: new Date().toISOString()
                });
            }

            // Optional: Send email notification to company admin
            await MailService.sendEnquiryNotification({ 
                name, email, phone, organization, enquiry_type: type, message 
            });

            res.status(201).json({ message: 'Enquiry submitted successfully' });
        } catch (err) { next(err); }
    }
};

module.exports = PublicController;
