require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Import routes
const authRoutes = require('./api/routes/auth.routes');
const patientRoutes = require('./api/routes/patient.routes');
const appointmentRoutes = require('./api/routes/appointment.routes');
const chatRoutes = require('./api/routes/chat.routes');
const prescriptionRoutes = require('./api/routes/prescription.routes');
const userRoutes = require('./api/routes/user.routes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('<h1>MediConnect API</h1><p>Welcome to the MediConnect API.</p>');
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize chat sockets and pass the io instance
require('./sockets/chat.socket')(io);

const PORT = process.env.PORT || 5000;

const runningServer = server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const gracefulShutdown = (signal) => {
  console.info(`${signal} signal received: closing HTTP server`);
  runningServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { app, server };