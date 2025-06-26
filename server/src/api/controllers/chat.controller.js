const pool = require('../../config/db.config');

// @route   GET api/chat/conversations
// @desc    Get all conversations for the logged-in user
// @access  Private
exports.getConversations = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        let query;
        if (userRole === 'professional') {
            query = `
                SELECT c.conversation_id, u.user_id as other_user_id, u.first_name as other_user_first_name, u.last_name as other_user_last_name
                FROM conversations c
                JOIN users u ON c.patient_id = u.user_id
                WHERE c.professional_id = $1 AND c.archived = FALSE
            `;
        } else {
            query = `
                SELECT c.conversation_id, u.user_id as other_user_id, u.first_name as other_user_first_name, u.last_name as other_user_last_name
                FROM conversations c
                JOIN users u ON c.professional_id = u.user_id
                WHERE c.patient_id = $1 AND c.archived = FALSE
            `;
        }
        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/chat/conversations/:id
// @desc    Get all messages for a specific conversation
// @access  Private
exports.getMessages = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.id;

    try {
        // Security check: Ensure user is part of the conversation
        const securityCheck = await pool.query(
            'SELECT 1 FROM conversations WHERE conversation_id = $1 AND (patient_id = $2 OR professional_id = $2)',
            [conversationId, userId]
        );

        if (securityCheck.rows.length === 0) {
            return res.status(403).json({ msg: 'Not authorized to view this conversation' });
        }

        const { rows } = await pool.query(
            'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY sent_at ASC',
            [conversationId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createConversation = async (req, res) => {
  const { recipientId } = req.body;
  const initiatorId = req.user.id;
  const initiatorRole = req.user.role;

  if (!recipientId) {
    return res.status(400).json({ msg: 'Recipient ID is required' });
  }

  try {
    const professionalId = initiatorRole === 'professional' ? initiatorId : recipientId;
    const patientId = initiatorRole === 'patient' ? initiatorId : recipientId;

    // Check if a conversation already exists
    const existingConvo = await pool.query(
      'SELECT conversation_id FROM conversations WHERE professional_id = $1 AND patient_id = $2',
      [professionalId, patientId]
    );

    if (existingConvo.rows.length > 0) {
      return res.status(200).json(existingConvo.rows[0]);
    }

    // Create a new conversation
    const newConvo = await pool.query(
      'INSERT INTO conversations (professional_id, patient_id) VALUES ($1, $2) RETURNING conversation_id',
      [professionalId, patientId]
    );

    // Also create the link in the mapping table
    await pool.query(
      'INSERT INTO professional_patient_map (professional_id, patient_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [professionalId, patientId]
    );

    res.status(201).json(newConvo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PATCH /api/chat/conversations/:id/archive
exports.archiveConversation = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    // Vérifier que l'utilisateur fait partie de la conversation
    const check = await pool.query(
      'SELECT * FROM conversations WHERE conversation_id = $1 AND (professional_id = $2 OR patient_id = $2)',
      [id, userId]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ msg: 'Not authorized to archive this conversation' });
    }
    await pool.query('UPDATE conversations SET archived = TRUE WHERE conversation_id = $1', [id]);
    res.json({ msg: 'Conversation archived' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GROUP CHAT ENDPOINTS
const db = require('../../config/db.config');

// POST /api/chat/groups
exports.createGroup = async (req, res) => {
  const { name, memberIds } = req.body;
  const creatorId = req.user.id;
  if (!name || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ msg: 'Name and members are required' });
  }
  try {
    const groupRes = await db.query(
      'INSERT INTO group_conversations (name, creator_id) VALUES ($1, $2) RETURNING group_id',
      [name, creatorId]
    );
    const groupId = groupRes.rows[0].group_id;
    // Ajouter le créateur et les membres
    const allMembers = Array.from(new Set([creatorId, ...memberIds]));
    await Promise.all(
      allMembers.map(uid =>
        db.query('INSERT INTO group_conversation_members (group_id, user_id) VALUES ($1, $2)', [groupId, uid])
      )
    );
    res.status(201).json({ group_id: groupId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET /api/chat/groups
exports.getGroups = async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await db.query(
      `SELECT g.group_id, g.name, g.creator_id, g.created_at
       FROM group_conversations g
       JOIN group_conversation_members m ON g.group_id = m.group_id
       WHERE m.user_id = $1`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET /api/chat/groups/:id/messages
exports.getGroupMessages = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  try {
    // Vérifier que l'utilisateur est membre
    const check = await db.query(
      'SELECT 1 FROM group_conversation_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const { rows } = await db.query(
      'SELECT * FROM group_messages WHERE group_id = $1 ORDER BY sent_at ASC',
      [groupId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/chat/groups/:id/messages
exports.sendGroupMessage = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  const { content } = req.body;
  if (!content) return res.status(400).json({ msg: 'Content required' });
  try {
    // Vérifier que l'utilisateur est membre
    const check = await db.query(
      'SELECT 1 FROM group_conversation_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const { rows } = await db.query(
      'INSERT INTO group_messages (group_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [groupId, userId, content]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 