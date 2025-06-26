const db = require('../../config/db.config');

exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT user_id, first_name, last_name, email, role FROM users ORDER BY user_id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE user_id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, role, password } = req.body;
    const result = await db.query(
      'INSERT INTO users (first_name, last_name, email, role, password) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, first_name, last_name, email, role',
      [first_name, last_name, email, role, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, role } = req.body;
    const result = await db.query(
      'UPDATE users SET first_name = $1, last_name = $2, email = $3, role = $4 WHERE user_id = $5 RETURNING user_id, first_name, last_name, email, role',
      [first_name, last_name, email, role, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT user_id, first_name, last_name, email, role FROM users WHERE user_id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}; 