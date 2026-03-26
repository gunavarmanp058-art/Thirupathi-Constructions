const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const AuthController = {
    register: async (req, res, next) => {
        try {
            
            const { name, email, password, role, company_name, phone, address } = req.body;

            if (phone && !/^[0-9]{10}$/.test(phone)) {
                return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
            }

            if (!/^[A-Za-z\s]{3,}$/.test(name)) {
                return res.status(400).json({ message: 'Name must be at least 3 characters and contain only letters.' });
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ message: 'Password must be 8+ characters with uppercase, lowercase, number & special character.' });
            }

            // BLOCK all ADMIN registrations - Single Admin Only
            if (role === 'ADMIN') {
                return res.status(403).json({ message: 'New admin registration is disabled.' });
            }
            const finalRole = 'CLIENT';
            const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
            if (existing.length > 0) {
                return res.status(400).json({ message: 'Email already registered' });
            }

            const hash = await bcrypt.hash(password, 10);

            // Start transaction
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                const [userResult] = await connection.query(
                    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
                    [name, email, hash, finalRole]
                );
                const userId = userResult.insertId;

                if (finalRole === 'CLIENT') {
                    await connection.query(
                        "INSERT INTO clients (user_id, company_name, phone, address) VALUES (?, ?, ?, ?)",
                        [userId, company_name || null, phone || null, address || null]
                    );
                }

                await connection.commit();
                res.status(201).json({ message: 'User registered successfully as ' + finalRole });
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }
        } catch (err) { next(err); }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

            let user;
            if (users.length === 0) {
                // SPECIAL CHECK for the requested Single Admin Account
                if (email === 'thiruppathi400@gmail.com' && password === 'Thirupathi@400') {
                    user = { id: 1, name: 'Main Admin', email: 'thiruppathi400@gmail.com', role: 'ADMIN' };
                } else {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
            } else {
                user = users[0];
                const isMatch = await bcrypt.compare(password, user.password_hash);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
            }

            let clientId = null;
            if (user.role === 'CLIENT') {
                const [clients] = await pool.query("SELECT id FROM clients WHERE user_id = ?", [user.id]);
                if (clients.length > 0) clientId = clients[0].id;
            }

            const token = jwt.sign(
                { userId: user.id, role: user.role, clientId },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            const { password_hash, ...profile } = user;
            res.json({
                message: 'Login successful',
                data: { token, profile: { ...profile, clientId } }
            });
        } catch (err) { next(err); }
    },

    getMe: async (req, res, next) => {
        try {
            const [users] = await pool.query("SELECT id, name, email, role FROM users WHERE id = ?", [req.user.userId]);
            if (users.length === 0) return res.status(404).json({ message: 'User not found' });
            res.json({ message: 'User profile fetched', data: users[0] });
        } catch (err) { next(err); }
    }
};

module.exports = AuthController;
