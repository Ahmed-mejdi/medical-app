const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authJwt = require('../middlewares/auth.middleware');

// @route   GET api/appointments
// @desc    Get all appointments for the logged-in user
// @access  Private
router.get('/', authJwt.verifyToken, appointmentController.getMyAppointments);

// @route   GET api/appointments/today
// @desc    Get today's appointments for a professional
// @access  Private
router.get('/today', authJwt.verifyToken, appointmentController.getTodaysAppointments);

// @route   POST api/appointments
// @desc    Create a new appointment
// @access  Private
router.post('/', authJwt.verifyToken, appointmentController.createAppointment);

module.exports = router; 