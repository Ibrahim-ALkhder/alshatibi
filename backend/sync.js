import sequelize from './config/database.js';
import './models/index.js'; // تأكد من استيراد جميع النماذج

(async () => {
  try {
    await sequelize.sync({ force: true }); // force: true يحذف الجداول القديمة
    console.log('✅ Database synced successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
})();