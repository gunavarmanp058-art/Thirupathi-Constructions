const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/dashboard-stats', AdminController.getDashboardStats);
router.get('/analytics', AdminController.getAnalytics);
router.get('/messages', AdminController.getMessages);

// Users (Admins and Clients)
router.post('/users', AdminController.createUser);
router.get('/users', AdminController.getAllUsers);
router.get('/clients', AdminController.getAllClients);

// Projects
router.post('/projects', AdminController.createProject);
router.get('/projects', AdminController.getAllProjects);
router.put('/projects/:id', AdminController.updateProject);
router.delete('/projects/:id', AdminController.deleteProject);
router.post('/projects/:id/assign-client', AdminController.assignClient);

// Progress
router.post('/projects/:id/progress', upload.single('media'), AdminController.addProgress);

// Machines
router.post('/machines', upload.single('image'), AdminController.createMachine);
router.get('/machines', AdminController.getAllMachines);
router.put('/machines/:id', upload.single('image'), AdminController.updateMachine);
router.delete('/machines/:id', AdminController.deleteMachine);
router.post('/machines/:id/assign', AdminController.assignMachine);
router.post('/machines/:id/logs', upload.single('media'), AdminController.addMachineLog);
router.post('/machines/:id/return', upload.single('media'), AdminController.processMachineReturn);

// Machinery Booking Requests
router.get('/booking-requests', AdminController.getBookingRequests);
router.post('/booking-requests/:id/accept', AdminController.acceptBookingRequest);
router.post('/booking-requests/:id/reject', AdminController.rejectBookingRequest);

// Tickets
router.get('/tickets', AdminController.getAllTickets);
router.get('/enquiries', AdminController.getAllEnquiries);
router.put('/enquiries/:id', AdminController.updateEnquiryStatus);
router.put('/tickets/:id', AdminController.updateTicketStatus);

module.exports = router;
