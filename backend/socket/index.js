import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      // السماح برابط ريندر ورابط اللوكال هوست للتطوير
      origin: ['https://alshatibi-frontend.onrender.com', 'http://localhost:5173', 'http://localhost:5174'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
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
    console.log(`✅ User connected: ${socket.user.id} (${socket.user.role})`);

    socket.join(socket.user.id.toString());

    if (socket.user.role === 'admin') {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};
