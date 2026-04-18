import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import './models/index.js'; 
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { initSocket } from './socket/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- تعديل الـ CORS هنا ---
app.use(cors({
  origin: ['https://alshatibi-frontend.onrender.com', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// المسارات الأساسية
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/driver', driverRoutes);

// تهيئة السوكيت
const io = initSocket(httpServer);
app.set('io', io);
app.use('/api/orders', orderRoutes(io));

// Health check endpoint مهم لـ Render للتأكد أن السيرفر يعمل
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('📦 Database connected');
    return sequelize.sync(); 
  })
  .then(() => {
    httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));
