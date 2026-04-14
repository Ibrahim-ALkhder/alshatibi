import sequelize from './config/database.js';
import './models/index.js';
import User from './models/User.js';
import Category from './models/Category.js';
import MenuItem from './models/MenuItem.js';
import DeliveryDriver from './models/DeliveryDriver.js';

const seedDatabase = async () => {
  try {
    // حذف وإنشاء الجداول من جديد
    await sequelize.sync({ force: true });
    console.log('✅ Database synced (all tables recreated)');

    // ----- 1. إنشاء الفئات -----
    const categories = await Category.bulkCreate([
      { name: 'Sandwiches', nameAr: 'سندويتشات', order: 1 },
      { name: 'Main Dishes', nameAr: 'وجبات رئيسية', order: 2 },
      { name: 'Pies', nameAr: 'فطائر', order: 3 },
      { name: 'Appetizers', nameAr: 'مقبلات', order: 4 },
      { name: 'Juices', nameAr: 'عصائر', order: 5 },
    ]);
    console.log(`✅ Created ${categories.length} categories`);

    const addItems = async (itemsArray, categoryId, defaultStock = 30) => {
      const items = itemsArray.map(item => ({
        name: item.nameAr,          // ✅ حقل name مطلوب
        nameAr: item.nameAr,
        price: item.price,
        CategoryId: categoryId,
        stock: defaultStock,
        isAvailable: true,
        preparationTime: 15,
      }));
      await MenuItem.bulkCreate(items);
    };

    // ----- 2. إضافة الأصناف -----
    // سندويتشات
    await addItems([
      { nameAr: 'سندويتش فول', price: 20 },
      { nameAr: 'سندويتش طعمية', price: 15 },
      { nameAr: 'سندويتش كبدة', price: 30 },
      { nameAr: 'سندويتش سجق', price: 35 },
      { nameAr: 'سندويتش شاورما', price: 45 },
      { nameAr: 'سندويتش برجر', price: 50 },
      { nameAr: 'سندويتش جبنة', price: 18 },
      { nameAr: 'سندويتش بيض', price: 22 },
      { nameAr: 'سندويتش ملوخية', price: 25 },
      { nameAr: 'سندويتش كفتة', price: 40 },
    ], categories[0].id);

    // وجبات رئيسية
    await addItems([
      { nameAr: 'فول مدمس', price: 35 },
      { nameAr: 'طعمية', price: 25 },
      { nameAr: 'ملوخية', price: 45 },
      { nameAr: 'بامية', price: 50 },
      { nameAr: 'كسرة', price: 60 },
      { nameAr: 'عصيدة', price: 55 },
      { nameAr: 'قراصة', price: 40 },
      { nameAr: 'كبدة', price: 70 },
      { nameAr: 'شية', price: 120 },
    ], categories[1].id);

    // فطائر
    await addItems([
      { nameAr: 'فطيرة جبنة', price: 20 },
      { nameAr: 'فطيرة لحم', price: 35 },
      { nameAr: 'فطيرة دجاج', price: 30 },
      { nameAr: 'فطيرة سجق', price: 30 },
      { nameAr: 'فطيرة سبانخ', price: 25 },
      { nameAr: 'فطيرة زعتر', price: 15 },
    ], categories[2].id);

    // مقبلات
    await addItems([
      { nameAr: 'بطاطس مقلية', price: 25 },
      { nameAr: 'سمبوسة', price: 20 },
      { nameAr: 'سلطة خضراء', price: 15 },
      { nameAr: 'طحينة', price: 10 },
      { nameAr: 'بابا غنوج', price: 20 },
    ], categories[3].id);

    // عصائر
    await addItems([
      { nameAr: 'عصير برتقال', price: 25 },
      { nameAr: 'عصير مانجو', price: 30 },
      { nameAr: 'عصير جوافة', price: 25 },
      { nameAr: 'عصير فراولة', price: 35 },
      { nameAr: 'عصير ليمون', price: 20 },
      { nameAr: 'عصير قمر الدين', price: 30 },
    ], categories[4].id);

    console.log('✅ All menu items seeded');

    // ----- 3. إنشاء المستخدمين الأساسيين -----
    await User.create({
      name: 'مدير النظام',
      email: 'admin@alshatibi.com',
      password: '123456',
      phone: '0100000000',
      role: 'admin',
    });

    await User.create({
      name: 'موظف المطبخ',
      email: 'staff@alshatibi.com',
      password: '123456',
      phone: '0101111111',
      role: 'staff',
    });

    const driverUser = await User.create({
      name: 'مندوب التوصيل',
      email: 'driver@alshatibi.com',
      password: '123456',
      phone: '0102222222',
      role: 'driver',
    });
    await DeliveryDriver.create({ UserId: driverUser.id, status: 'available' });

    await User.create({
      name: 'عميل تجريبي',
      email: 'customer@alshatibi.com',
      password: '123456',
      phone: '0103333333',
      role: 'customer',
    });

    console.log('✅ Default users created (admin, staff, driver, customer)');
    console.log('🎉 Seeding completed successfully!');
    console.log('   Admin login: admin@alshatibi.com / 123456');
    console.log('   Staff login: staff@alshatibi.com / 123456');
    console.log('   Driver login: driver@alshatibi.com / 123456');
    console.log('   Customer login: customer@alshatibi.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();