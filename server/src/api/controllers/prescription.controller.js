const db = require('../../config/db.config');
const { buildPrescriptionPDF } = require('../../services/pdf.service');

// @route   POST api/prescriptions
// @desc    Create a new prescription
// @access  Private (Professional only)
exports.createPrescription = async (req, res) => {
    const { patientId, medicationName, dosage, instructions } = req.body;
    const professionalId = req.userId;

    if (!patientId || !medicationName || !dosage) {
        return res.status(400).json({ message: 'Patient, medication, and dosage are required.' });
    }

    try {
        const query = `
            INSERT INTO prescriptions (professional_id, patient_id, medication_name, dosage, instructions)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const { rows } = await db.query(query, [professionalId, patientId, medicationName, dosage, instructions]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/prescriptions
// @desc    Get all prescriptions for the logged-in user
// @access  Private
exports.getPrescriptions = async (req, res) => {
    const userId = req.userId;
    const userRole = req.userRole;
    
    try {
        let query;
        if (userRole === 'patient') {
            query = `
                SELECT pr.*, u.first_name as professional_first_name, u.last_name as professional_last_name
                FROM prescriptions pr
                JOIN users u ON pr.professional_id = u.user_id
                WHERE pr.patient_id = $1 ORDER BY pr.issued_date DESC;
            `;
        } else if (userRole === 'professional') {
            query = `
                SELECT pr.*, u.first_name as patient_first_name, u.last_name as patient_last_name
                FROM prescriptions pr
                JOIN users u ON pr.patient_id = u.user_id
                WHERE pr.professional_id = $1 ORDER BY pr.issued_date DESC;
            `;
        } else {
             return res.status(403).json({ message: 'Invalid user role.' });
        }
        
        const { rows } = await db.query(query, [userId]);
        res.json(rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/prescriptions/:id/download
// @desc    Download a specific prescription as a PDF
// @access  Private
exports.downloadPrescription = async (req, res) => {
    const { id } = req.params; // prescription_id
    const userId = req.userId;

    try {
        // 1. Fetch prescription data along with patient and professional details
        const query = `
            SELECT 
                pr.*,
                prof_user.first_name as professional_first_name,
                prof_user.last_name as professional_last_name,
                p_user.first_name as patient_first_name,
                p_user.last_name as patient_last_name,
                p.date_of_birth,
                prof.specialty
            FROM prescriptions pr
            JOIN users prof_user ON pr.professional_id = prof_user.user_id
            JOIN users p_user ON pr.patient_id = p_user.user_id
            JOIN patients p ON pr.patient_id = p.patient_user_id
            JOIN professionals prof ON pr.professional_id = prof.professional_user_id
            WHERE pr.prescription_id = $1 AND (pr.patient_id = $2 OR pr.professional_id = $2);
        `;
        const { rows } = await db.query(query, [id, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Prescription not found or you are not authorized.' });
        }

        const prescriptionData = rows[0];

        // 2. Generate PDF
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment;filename=ordonnance-${id}.pdf`,
        });

        buildPrescriptionPDF(
            (chunk) => stream.write(chunk),
            () => stream.end(),
            prescriptionData
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/prescriptions/patient/:id
// @desc    Get all prescriptions for a specific patient (for professionals)
// @access  Private (Professional only)
exports.getPrescriptionsForPatient = async (req, res) => {
    const professionalId = req.userId;
    const userRole = req.userRole;
    const patientId = req.params.id;
    if (userRole !== 'professional') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const query = `
            SELECT pr.*, u.first_name as professional_first_name, u.last_name as professional_last_name
            FROM prescriptions pr
            JOIN users u ON pr.professional_id = u.user_id
            WHERE pr.patient_id = $1
            ORDER BY pr.issued_date DESC;
        `;
        const { rows } = await db.query(query, [patientId]);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}; 