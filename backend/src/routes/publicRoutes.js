const express = require('express');
const router = express.Router();
const PublicController = require('../controllers/publicController');

router.get('/projects/completed', PublicController.getCompletedProjects);
router.get('/projects/ongoing', PublicController.getOngoingProjects);
router.get('/machines/gallery', PublicController.getMachineGallery);
router.get('/machines', PublicController.getMachineGallery);
router.post('/enquiry', PublicController.submitEnquiry);

module.exports = router;
