const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const authJwt = require('../middlewares/auth.middleware');

// Route for patients to get a list of all professionals
router.get('/professionals', authJwt.verifyToken, patientController.getAllProfessionals);

// Route for professionals to get their list of patients
router.get('/', authJwt.verifyToken, patientController.getAllPatients);

// Route to get a specific patient's details
router.get('/:id', authJwt.verifyToken, patientController.getPatientById);

module.exports = router; 