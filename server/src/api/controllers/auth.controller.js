const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db.config');

exports.register = async (req, res) => {
  const { email, password, role, firstName, lastName } = req.body;

  if (!email || !password || !role || !firstName || !lastName) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (role !== 'patient' && role !== 'professional') {
      return res.status(400).json({ message: 'Invalid role specified.' });
  }

  try {
    // Check if user already exists
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Use a transaction to ensure both inserts succeed or fail together
    await db.query('BEGIN');

    // Insert new user into the users table
    const newUserResult = await db.query(
      'INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, email, role',
      [email, passwordHash, role, firstName, lastName]
    );
    const newUser = newUserResult.rows[0];

    // Insert into role-specific table
    if (role === 'patient') {
        await db.query('INSERT INTO patients (patient_user_id) VALUES ($1)', [newUser.user_id]);
    } else if (role === 'professional') {
        // For now, we insert with minimal data. We can add specialty/license later.
        await db.query('INSERT INTO professionals (professional_user_id) VALUES ($1)', [newUser.user_id]);
    }

    await db.query('COMMIT');

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = userResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Create JWT
    const payload = {
      id: user.user_id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
}; 