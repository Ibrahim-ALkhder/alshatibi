import sequelize from './config/database.js';
import './models/index.js';
import User from './models/User.js';
import DeliveryDriver from './models/DeliveryDriver.js';

const createAdmin = async () => {
  try {
    // تأكد من مزامنة النماذج (بدون force حتى لا تمسح البيانات)
    await sequelize.sync();

    // إنشاء المدير إذا لم يكن موجودًا
    const adminExists = await User.findOne({ where: { email: 'admin@alshatibi.com' } });
    if (!adminExists) {
      await User.create({
        name: 'مدير النظام',
        email: 'admin@alshatibi.com',
        password: '123456',
        phone: '0100000000',
        role: 'admin',
      });
      console.log('✅ Admin created');
    } else {
      console.log('ℹ️ Admin already exists');
    }

    // إنشاء مندوب توصيل (اختياري)
    const driverUser = await User.findOne({ where: { email: 'driver@alshatibi.com' } });
    if (!driverUser) {
      const newDriver = await User.create({
        name: 'مندوب التوصيل',
        email: 'driver@alshatibi.com',
        password: '123456',
        phone: '0102222222',
        role: 'driver',
      });
      await DeliveryDriver.create({ UserId: newDriver.id, status: 'available' });
      console.log('✅ Driver created');
    }

    console.log('🎉 Done. You can now log in with admin@alshatibi.com / 123456');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();