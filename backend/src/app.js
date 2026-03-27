const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorMiddleware');

const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads as static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Roots
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

// --- FE-BE CONNECTION: Serving Frontend Static Files ---
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Fallback all other routes to index.html (for React Router)
app.get('*', (req, res, next) => {
    // Only serve index.html if it's not an API call
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error Handler
app.use(errorHandler);

module.exports = app;
