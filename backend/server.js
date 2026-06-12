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

async function loadModules() {
  try {
    const { default: sequelize } = await import('./config/database.js');
    await import('./models/index.js');
    const { default: authRoutes } = await import('./routes/authRoutes.js');
    const { default: categoryRoutes } = await import('./routes/categoryRoutes.js');
    const { default: menuRoutes } = await import('./routes/menuRoutes.js');
    const moduleOrder = await import('./routes/orderRoutes.js');
    const { default: userRoutes } = await import('./routes/userRoutes.js');
    const { default: driverRoutes } = await import('./routes/driverRoutes.js');
    const { errorHandler } = await import('./middleware/errorMiddleware.js');
    const { initSocket } = await import('./socket/index.js');

    const orderRoutes = moduleOrder.default;
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
  } catch (err) {
    console.error('[SERVER] Module loading failed:', err.message);
  }
}

setTimeout(loadModules, 100);
