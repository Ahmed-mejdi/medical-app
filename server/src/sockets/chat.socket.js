// This file will contain the socket.io logic for the real-time chat.
// It will handle events like sending and receiving messages.

const db = require('../config/db.config');
const jwt = require('jsonwebtoken');

module.exports = function(io) {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
      socket.user = decoded; // Attach user payload (id, role) to the socket
      next();
    });
  });

  // Liste des utilisateurs en ligne (user_id)
  const onlineUsers = new Set();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}, UserID: ${socket.user.id}`);

    // Join a room for the specific user to receive private messages
    socket.join(socket.user.id.toString());

    // Ajouter l'utilisateur à la liste des connectés
    onlineUsers.add(socket.user.id);
    io.emit('onlineUsers', Array.from(onlineUsers));

    // Listen for a user sending a message
    socket.on('sendMessage', async (data) => {
      const { receiverId, content } = data;
      const senderId = socket.user.id;

      if (!receiverId || !content) {
        // Optionally emit an error back to the sender
        socket.emit('chatError', { message: 'Receiver and content are required.' });
        return;
      }

      try {
        // 1. Find or create the conversation
        let conversationResult = await db.query(
          `SELECT conversation_id FROM conversations 
           WHERE (professional_id = $1 AND patient_id = $2) OR (professional_id = $2 AND patient_id = $1)`,
          [senderId, receiverId]
        );

        let conversationId;
        if (conversationResult.rows.length === 0) {
          // Determine who is the professional and who is the patient
          const senderRole = socket.user.role;
          const professionalId = senderRole === 'professional' ? senderId : receiverId;
          const patientId = senderRole === 'patient' ? senderId : receiverId;
          
          const newConversation = await db.query(
            'INSERT INTO conversations (professional_id, patient_id) VALUES ($1, $2) RETURNING conversation_id',
            [professionalId, patientId]
          );
          conversationId = newConversation.rows[0].conversation_id;
        } else {
          conversationId = conversationResult.rows[0].conversation_id;
        }

        // 2. Save the message to the database
        const messageResult = await db.query(
          `INSERT INTO messages (conversation_id, sender_id, receiver_id, content) 
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [conversationId, senderId, receiverId, content]
        );
        const savedMessage = messageResult.rows[0];

        // 3. Emit the message to the receiver and the sender
        io.to(receiverId.toString()).emit('receiveMessage', savedMessage);
        io.to(senderId.toString()).emit('receiveMessage', savedMessage);

      } catch (error) {
        console.error('Socket sendMessage error:', error);
        socket.emit('chatError', { message: 'Failed to send message.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Retirer l'utilisateur de la liste des connectés
      onlineUsers.delete(socket.user.id);
      io.emit('onlineUsers', Array.from(onlineUsers));
    });
  });
}; 