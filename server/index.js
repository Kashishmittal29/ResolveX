/**
 * ==========================================
 * ResolveX - Backend Server
 * NodeJS + Express + MySQL + Sequelize + Socket.io + GraphQL
 * ==========================================
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { sequelize } from './config/database.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// REST API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ==========================================
// SOCKET.IO - Real-time Functionality
// ==========================================
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Join room for notifications
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`📦 Socket ${socket.id} joined room: ${room}`);
  });

  // Handle new complaint submission
  socket.on('new_complaint', (data) => {
    io.emit('complaint_received', {
      id: Date.now(),
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Handle status updates
  socket.on('status_update', (data) => {
    io.emit('status_changed', {
      ...data,
      updatedAt: new Date().toISOString()
    });
  });

  // Handle chat messages
  socket.on('send_message', (data) => {
    io.emit('receive_message', {
      id: Date.now(),
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.emit('user_typing', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ==========================================
// GRAPHQL - Apollo Server Setup
// ==========================================
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
});

await apolloServer.start();

app.use('/graphql', expressMiddleware(apolloServer));

// ==========================================
// Database Connection & Server Start
// ==========================================
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully!');

    // Sync models (create tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized!');

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║          🚀 ResolveX Server Running                ║
║                                                       ║
║   🌐 REST API:    http://localhost:${PORT}/api       ║
║   📊 GraphQL:     http://localhost:${PORT}/graphql   ║
║   🔌 Socket.io:  ws://localhost:${PORT}             ║
║                                                       ║
║   Topics Covered:                                   ║
║   ✅ NodeJS Project Setup                           ║
║   ✅ MySQL Database                                  ║
║   ✅ Sequelize ORM                                   ║
║   ✅ Socket.io (Real-time)                          ║
║   ✅ GraphQL API                                     ║
║   ✅ E-Commerce (Products & Orders)                 ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
  }
}

startServer();

export { io };

