import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // ✅ استخدام findByPk بدلاً من findById
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // ✅ استخدام id بدلاً من _id
    console.log(`✅ User connected: ${socket.user.id} (${socket.user.role})`);

    // انضمام المستخدم إلى غرفته الخاصة
    socket.join(socket.user.id.toString());

    // إذا كان مديرًا، ينضم إلى غرفة المديرين
    if (socket.user.role === 'admin') {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};