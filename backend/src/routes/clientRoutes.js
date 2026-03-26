const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/clientController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(requireAuth);
router.use(requireRole('CLIENT'));

router.get('/dashboard', ClientController.getDashboard);
router.get('/messages', ClientController.getMessages);
router.get('/projects', ClientController.getProjects);
router.post('/projects', ClientController.createProject);
router.get('/projects/:id', ClientController.getProjectById);
router.get('/projects/:id/progress', ClientController.getProjectProgress);
router.post('/projects/:id/progress', upload.single('media'), ClientController.addProgress);
router.get('/machines', ClientController.getMachines);
router.get('/ai/machine/:machineId', ClientController.getMachineAI);
router.post('/booking-requests', ClientController.requestMachinery);
router.get('/booking-requests', ClientController.getBookingRequests);
router.post('/tickets', ClientController.createTicket);
router.get('/tickets', ClientController.getTickets);
router.get('/ai-reports', ClientController.getAIReports);
router.post('/machines/:id/return', upload.single('media'), ClientController.returnMachine);

module.exports = router;
