require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware (Lab-06)
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Import MVC Route Handlers
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const seatingRoutes = require('./routes/seatingRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'synapse-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount RESTful API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/seating', seatingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/inventory', inventoryRoutes);

// API Overview Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Synapse Lab & Asset Management API',
    description: 'RESTful API for CSE Department Workstation and Inventory Tracking',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      rooms: '/api/rooms',
      seating: '/api/seating',
      tickets: '/api/tickets',
      inventory: '/api/inventory',
    },
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message,
  });
});

// Start Server and Connect Database
const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`⚡ Synapse backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
  return server;
};

// Start if executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
