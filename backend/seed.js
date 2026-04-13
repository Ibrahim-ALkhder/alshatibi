import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import MenuItem from './models/MenuItem.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    // مسح البيانات القديمة
    await Category.deleteMany();
    await MenuItem.deleteMany();
    console.log('Old data cleared');

    // إنشاء الفئات الجديدة المطلوبة
    const categories = await Category.insertMany([
      { name: 'Sandwiches', nameAr: 'سندويتشات', order: 1 },
      { name: 'Main Dishes', nameAr: 'وجبات رئيسية', order: 2 },
      { name: 'Pies', nameAr: 'فطائر', order: 3 },
      { name: 'Appetizers', nameAr: 'مقبلات', order: 4 },
      { name: 'Juices', nameAr: 'عصائر', order: 5 },
    ]);

    console.log('Categories created: سندويتشات، وجبات رئيسية، فطائر، مقبلات، عصائر');

    const [sandwichesCat, mainDishesCat, piesCat, appetizersCat, juicesCat] = categories;

    // دالة مساعدة لإدراج أصناف مع كمية افتراضية
    const insertItems = async (itemsArray, categoryId, defaultStock = 20) => {
      const items = itemsArray.map(item => ({
        name: item.nameAr,
        nameAr: item.nameAr,
        description: `وصف ${item.nameAr}`,
        descriptionAr: `ألذ ${item.nameAr} في القاهرة`,
        price: item.price,
        image: `https://via.placeholder.com/300?text=${encodeURIComponent(item.nameAr)}`,
        category: categoryId,
        isAvailable: true,
        stock: defaultStock,
        preparationTime: 10,
      }));
      await MenuItem.insertMany(items);
    };

    // أصناف السندويتشات (10)
    await insertItems([
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
    ], sandwichesCat._id, 30);

    // وجبات رئيسية (9)
    await insertItems([
      { nameAr: 'فول مدمس', price: 35 },
      { nameAr: 'طعمية', price: 25 },
      { nameAr: 'ملوخية', price: 45 },
      { nameAr: 'بامية', price: 50 },
      { nameAr: 'كسرة', price: 60 },
      { nameAr: 'عصيدة', price: 55 },
      { nameAr: 'قراصة', price: 40 },
      { nameAr: 'كبدة', price: 70 },
      { nameAr: 'شية', price: 120 },
    ], mainDishesCat._id, 25);

    // فطائر (6)
    await insertItems([
      { nameAr: 'فطيرة جبنة', price: 20 },
      { nameAr: 'فطيرة لحم', price: 35 },
      { nameAr: 'فطيرة دجاج', price: 30 },
      { nameAr: 'فطيرة سجق', price: 30 },
      { nameAr: 'فطيرة سبانخ', price: 25 },
      { nameAr: 'فطيرة زعتر', price: 15 },
    ], piesCat._id, 20);

    // مقبلات (5)
    await insertItems([
      { nameAr: 'بطاطس مقلية', price: 25 },
      { nameAr: 'سمبوسة', price: 20 },
      { nameAr: 'سلطة خضراء', price: 15 },
      { nameAr: 'طحينة', price: 10 },
      { nameAr: 'بابا غنوج', price: 20 },
    ], appetizersCat._id, 40);

    // عصائر (6)
    await insertItems([
      { nameAr: 'عصير برتقال', price: 25 },
      { nameAr: 'عصير مانجو', price: 30 },
      { nameAr: 'عصير جوافة', price: 25 },
      { nameAr: 'عصير فراولة', price: 35 },
      { nameAr: 'عصير ليمون', price: 20 },
      { nameAr: 'عصير قمر الدين', price: 30 },
    ], juicesCat._id, 50);

    console.log('All items seeded with stock values!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();