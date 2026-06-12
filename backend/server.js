import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

httpServer.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));

process.on('uncaughtException', (err) => console.error('[FATAL]', err));
process.on('unhandledRejection', (reason) => console.error('[FATAL]', reason));

let sequelize, authRoutes, categoryRoutes, menuRoutes, orderRoutes, userRoutes, driverRoutes, errorHandler, initSocket;

try {
  const dbModule = await import('./config/database.js');
  sequelize = dbModule.default;
  await import('./models/index.js');
  authRoutes = (await import('./routes/authRoutes.js')).default;
  categoryRoutes = (await import('./routes/categoryRoutes.js')).default;
  menuRoutes = (await import('./routes/menuRoutes.js')).default;
  const orderModule = await import('./routes/orderRoutes.js');
  orderRoutes = orderModule.default;
  userRoutes = (await import('./routes/userRoutes.js')).default;
  driverRoutes = (await import('./routes/driverRoutes.js')).default;
  errorHandler = (await import('./middleware/errorMiddleware.js')).errorHandler;
  initSocket = (await import('./socket/index.js')).initSocket;
} catch (err) {
  console.error('[SERVER] Module loading failed:', err.message, err.stack);
}

if (authRoutes) {
  const io = initSocket(httpServer);
  app.set('io', io);
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/driver', driverRoutes);
  app.use('/api/orders', orderRoutes(io));
  app.use(errorHandler);

  try {
    await sequelize.authenticate();
    console.log('SQLite connected');
    await sequelize.sync();
  } catch (dbErr) {
    console.error('DB init error:', dbErr.message);
  }
}
