const pool = require('../../config/db.config');

// @route   GET api/appointments
// @desc    Get all appointments for the logged-in user (patient or professional)
// @access  Private
exports.getMyAppointments = async (req, res) => {
    const userId = req.userId;
    const userRole = req.userRole; // We need to add this to the auth middleware

    try {
        let query;
        if (userRole === 'patient') {
            query = `
                SELECT a.*, u_prof.first_name as professional_first_name, u_prof.last_name as professional_last_name
                FROM appointments a
                JOIN users u_prof ON a.professional_id = u_prof.user_id
                WHERE a.patient_id = $1
                ORDER BY a.appointment_date DESC;
            `;
        } else if (userRole === 'professional') {
            query = `
                SELECT a.*, u_pat.first_name as patient_first_name, u_pat.last_name as patient_last_name
                FROM appointments a
                JOIN users u_pat ON a.patient_id = u_pat.user_id
                WHERE a.professional_id = $1
                ORDER BY a.appointment_date DESC;
            `;
        } else {
            return res.status(403).json({ message: 'Invalid user role.' });
        }

        const { rows } = await pool.query(query, [userId]);
        res.json(rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST api/appointments
// @desc    Create a new appointment
// @access  Private
exports.createAppointment = async (req, res) => {
    let { professionalId, patientId, appointmentDate, reason } = req.body;
    const requesterId = req.userId;
    const requesterRole = req.userRole;

    // Basic validation
    if (!professionalId || !patientId || !appointmentDate) {
        return res.status(400).json({ message: 'Professional, patient, and date are required.' });
    }

    // Convert IDs from body to integers to ensure type safety
    professionalId = parseInt(professionalId, 10);
    patientId = parseInt(patientId, 10);

    // Security check: ensure the requester is part of the appointment
    if (requesterRole === 'patient' && requesterId !== patientId) {
        return res.status(403).json({ message: 'Patients can only book appointments for themselves.' });
    }
     if (requesterRole === 'professional' && requesterId !== professionalId) {
        return res.status(403).json({ message: 'Professionals can only book appointments for themselves.' });
    }

    try {
        const query = `
            INSERT INTO appointments (professional_id, patient_id, appointment_date, reason)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [professionalId, patientId, appointmentDate, reason]);
        res.status(201).json(rows[0]);

    } catch (err) {
        console.error(err.message);
        // Could be a foreign key violation if IDs are wrong
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/appointments/today
// @desc    Get all appointments for the current day for a professional
// @access  Private
exports.getTodaysAppointments = async (req, res) => {
  if (req.user.role !== 'professional') {
    return res.status(403).json({ msg: 'Access denied. Only professionals can view this.' });
  }

  try {
    const professionalId = req.user.id;
    const query = `
      SELECT 
        a.appointment_id, 
        a.appointment_date, 
        a.reason,
        p_user.first_name as patient_first_name,
        p_user.last_name as patient_last_name
      FROM appointments a
      JOIN users p_user ON a.patient_id = p_user.user_id
      WHERE a.professional_id = $1 AND a.appointment_date::date = CURRENT_DATE
      ORDER BY a.appointment_date ASC
    `;
    const { rows } = await pool.query(query, [professionalId]);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 