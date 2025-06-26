const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// We should also add a middleware to ensure only professionals can create prescriptions
router.post('/', [verifyToken], prescriptionController.createPrescription);
router.get('/', [verifyToken], prescriptionController.getPrescriptions);
router.get('/:id/download', [verifyToken], prescriptionController.downloadPrescription);
router.get('/patient/:id', [verifyToken], prescriptionController.getPrescriptionsForPatient);

module.exports = router; 