const pool = require('../../config/db.config');

// @route   GET api/patients
// @desc    Get all of a professional's patients
// @access  Private (for professionals)
exports.getAllPatients = async (req, res) => {
  const { limit } = req.query;

  try {
    // Check if user is a professional
    if (req.user.role !== 'professional') {
      return res.status(403).json({ msg: 'Access denied. Only professionals can view patients.' });
    }
    
    let query = `
      SELECT u.user_id, u.first_name, u.last_name, u.email, p.date_of_birth 
      FROM users u
      JOIN patients p ON u.user_id = p.patient_user_id
      WHERE u.role = 'patient'
      ORDER BY u.user_id DESC
    `;

    const queryParams = [];
    if (limit) {
      query += ` LIMIT $1`;
      queryParams.push(limit);
    }

    const patients = await pool.query(query, queryParams);
    
    res.json(patients.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/patients/:id
// @desc    Get patient by ID
// @access  Private (Professional only linked to the patient)
exports.getPatientById = async (req, res) => {
    const { id } = req.params; // patient_id
    const professionalId = req.user.id;

    try {
        if (req.user.role !== 'professional') {
          return res.status(403).json({ msg: 'Not authorized to view this patient' });
        }
        
        // Fetch patient details
        const patientQuery = `
            SELECT u.user_id, u.first_name, u.last_name, u.email, p.date_of_birth, p.address, p.phone_number
            FROM users u
            JOIN patients p ON u.user_id = p.patient_user_id
            WHERE u.user_id = $1;
        `;
        const patientResult = await pool.query(patientQuery, [id]);

        if (patientResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Patient not found' });
        }
        
        res.json(patientResult.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/patients/professionals
// @desc    Get all professionals
// @access  Private
exports.getAllProfessionals = async (req, res) => {
  try {
    const professionals = await pool.query(
      "SELECT user_id, first_name, last_name FROM users WHERE role = 'professional' ORDER BY last_name, first_name"
    );
    res.json(professionals.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 