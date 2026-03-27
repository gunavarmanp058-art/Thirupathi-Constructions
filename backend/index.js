const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Server initialization completed.
// Triggering restart.
// Create HTTP server and attach socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Make io accessible throughout the app
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Admin joins a dedicated room to receive notifications
    socket.on('join-admin', () => {
        socket.join('admin-room');
        console.log(`[Socket] Admin joined admin-room: ${socket.id}`);
    });

    // Join chat room
    socket.on('join-chat', (userId, role) => {
        socket.join(`chat-${userId}`);
        socket.userId = userId;
        socket.userRole = role;
        
        // If user is admin, also join admin room to receive client messages
        if (role === 'ADMIN') {
            socket.join('admin-room');
            console.log(`[Socket] Admin ${userId} joined admin-room: ${socket.id}`);
        }
        
        console.log(`[Socket] User ${userId} (${role}) joined chat: ${socket.id}`);
    });

    // Send message
    socket.on('send-message', async (data) => {
        const { message, receiverId } = data;
        const senderId = socket.userId;

        if (!senderId) return;

        console.log(`[Socket] Message from ${senderId}: ${message}, to: ${receiverId || 'admin'}`);

        try {
            // Save message to DB
            await pool.query(
                "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
                [senderId, receiverId || null, message]
            );
            console.log('[Socket] Message saved to DB');
        } catch (err) {
            console.error('[Socket] Error saving message to DB:', err.message);
            // Continue with socket emission even if DB fails
        }

        // Emit to receiver or admin room
        if (receiverId) {
            console.log(`[Socket] Emitting to chat-${receiverId}`);
            io.to(`chat-${receiverId}`).emit('receive-message', {
                senderId,
                message,
                timestamp: new Date()
            });
        } else {
            console.log('[Socket] Emitting to admin-room');
            // Broadcast to all admins
            io.to('admin-room').emit('receive-message', {
                senderId,
                message,
                timestamp: new Date()
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

const seedAdmin = async () => {
    try {
        const [adminRows] = await pool.query("SELECT * FROM users WHERE role = 'ADMIN' LIMIT 1");
        if (adminRows.length === 0) {
            console.log('Seeding initial Admin user...');
            const hash = await bcrypt.hash('admin123', 10);
            await pool.query(
                "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
                ['System Admin', 'admin@tnconstruction.in', hash, 'ADMIN']
            );
            console.log('Admin account ready (admin@tnconstruction.in / admin123)');
        }
    } catch (err) {
        console.error('Error seeding admin:', err.message);
    }
};

const initDb = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (!fs.existsSync(schemaPath)) {
            console.log('No schema.sql found, skipping initialization.');
            return;
        }

        const schema = fs.readFileSync(schemaPath, 'utf8');
        // Split by semicolon and filter out empty strings and USE/CREATE DATABASE commands
        const queries = schema
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0 && !q.startsWith('USE') && !q.startsWith('CREATE DATABASE'));

        console.log(`Starting Database Initialization (${queries.length} queries)...`);
        
        for (const query of queries) {
            try {
                await pool.query(query);
            } catch (err) {
                // Ignore "IF NOT EXISTS" related errors if they happen, but log others
                if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
                    console.warn(`Query Warning: ${err.message}`);
                }
            }
        }
        console.log('✅ Database Schema initialized/verified.');
    } catch (err) {
        console.error('Error during database initialization:', err.message);
    }
};

const startServer = async () => {
    try {
        console.log(`[Startup] Attempting to connect to database at ${process.env.MYSQLHOST || process.env.DB_HOST || 'localhost'}...`);
        
        await pool.query('SELECT 1');
        console.log('✅ Database connected successfully');

        // Auto-initialize schema
        await initDb();

        if (process.env.AUTO_SEED_ADMIN === 'true') {
            await seedAdmin();
        }

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('⚠️  WARNING: Could not connect to database on startup.');
        console.error('Error Details:', err.message);
        
        console.log('---------------------------------------------------------');
        console.log('🚀 SERVER STARTING ANYWAY (Graceful Mode)');
        console.log('Note: API calls requiring a database will fail until DB_HOST is configured.');
        console.log('---------------------------------------------------------');

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} (Database Offline)`);
        });
    }
};

startServer();
