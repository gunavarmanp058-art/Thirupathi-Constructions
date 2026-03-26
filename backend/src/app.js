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

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'TN Construction API is running' });
});

// Error Handler
app.use(errorHandler);

module.exports = app;
