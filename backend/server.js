import { createRequire } from 'module';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const require = createRequire(import.meta.url);

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

setTimeout(() => {
  try {
    const sequelize = require('./config/database.js').default;
    require('./models/index.js');
    const authRoutes = require('./routes/authRoutes.js').default;
    const categoryRoutes = require('./routes/categoryRoutes.js').default;
    const menuRoutes = require('./routes/menuRoutes.js').default;
    const orderRoutes = require('./routes/orderRoutes.js').default;
    const userRoutes = require('./routes/userRoutes.js').default;
    const driverRoutes = require('./routes/driverRoutes.js').default;
    const { errorHandler } = require('./middleware/errorMiddleware.js');
    const { initSocket } = require('./socket/index.js');

    const io = initSocket(httpServer);
    app.set('io', io);

    app.use('/api/auth', authRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/menu', menuRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/driver', driverRoutes);
    app.use('/api/orders', orderRoutes(io));
    app.use(errorHandler);

    sequelize.authenticate()
      .then(() => { console.log('SQLite connected'); return sequelize.sync(); })
      .then(() => console.log('Tables synced'))
      .catch((err) => console.error('DB init error:', err.message));
  } catch (err) {
    console.error('[SERVER] Route loading failed:', err.message);
  }
}, 100);
