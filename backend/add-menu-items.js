import sequelize from './config/database.js';
import './models/index.js';
import Category from './models/Category.js';
import MenuItem from './models/MenuItem.js';

const addMenuItems = async () => {
  try {
    await sequelize.sync();
    console.log('✅ Database connected');

    const findOrCreateCategory = async (name, nameAr, order) => {
      let cat = await Category.findOne({ where: { name } });
      if (!cat) {
        cat = await Category.create({ name, nameAr, order });
        console.log(`➕ Created category: ${nameAr}`);
      }
      return cat;
    };

    const sandwichesCat = await findOrCreateCategory('Sandwiches', 'سندويتشات', 1);
    const mainDishesCat = await findOrCreateCategory('Main Dishes', 'وجبات رئيسية', 2);
    const piesCat = await findOrCreateCategory('Pies', 'فطائر', 3);
    const appetizersCat = await findOrCreateCategory('Appetizers', 'مقبلات', 4);
    const juicesCat = await findOrCreateCategory('Juices', 'عصائر', 5);
    const dessertsCat = await findOrCreateCategory('Desserts', 'حلويات', 6);
    const hotDrinksCat = await findOrCreateCategory('Hot Drinks', 'مشروبات ساخنة', 7);

    const addItemsIfNotExist = async (itemsArray, categoryId, defaultStock = 30) => {
      for (const item of itemsArray) {
        const existing = await MenuItem.findOne({
          where: { nameAr: item.nameAr, CategoryId: categoryId }
        });
        if (!existing) {
          await MenuItem.create({
            name: item.name || item.nameAr,   // ✅ تمت الإضافة
            nameAr: item.nameAr,
            price: item.price,
            CategoryId: categoryId,
            stock: defaultStock,
            descriptionAr: `ألذ ${item.nameAr} في القاهرة`,
            description: `Delicious ${item.nameAr} in Cairo`,
          });
        }
      }
      console.log(`✅ Processed ${itemsArray.length} items for category`);
    };

    // 1. سندويتشات
    await addItemsIfNotExist([
      { nameAr: 'سندويتش كبدة إسكندراني', price: 35 },
      { nameAr: 'سندويتش حووشي', price: 40 },
      { nameAr: 'سندويتش سوبر كرانشي', price: 45 },
      { nameAr: 'سندويتش زنجر', price: 42 },
      { nameAr: 'سندويتش فاهيتا', price: 48 },
    ], sandwichesCat.id, 25);

    // 2. وجبات رئيسية
    await addItemsIfNotExist([
      { nameAr: 'ملوخية بالدجاج', price: 65 },
      { nameAr: 'بامية باللحم', price: 70 },
      { nameAr: 'رز بشاور', price: 30 },
      { nameAr: 'مكرونة بشاميل', price: 55 },
      { nameAr: 'مسقعة', price: 45 },
      { nameAr: 'كشري', price: 35 },
      { nameAr: 'محشي مشكل', price: 60 },
    ], mainDishesCat.id, 20);

    // 3. فطائر
    await addItemsIfNotExist([
      { nameAr: 'فطيرة دجاج بالجبن', price: 35 },
      { nameAr: 'فطيرة مشكل', price: 40 },
      { nameAr: 'فطيرة هوت دوج', price: 25 },
      { nameAr: 'فطيرة شوكولاتة', price: 20 },
    ], piesCat.id, 30);

    // 4. مقبلات
    await addItemsIfNotExist([
      { nameAr: 'ورق عنب', price: 30 },
      { nameAr: 'متبل', price: 25 },
      { nameAr: 'حمص', price: 20 },
      { nameAr: 'بطاطس ودجز', price: 28 },
      { nameAr: 'حلقات بصل', price: 22 },
    ], appetizersCat.id, 40);

    // 5. عصائر
    await addItemsIfNotExist([
      { nameAr: 'عصير كوكتيل', price: 35 },
      { nameAr: 'عصير رمان', price: 30 },
      { nameAr: 'عصير كانتلوب', price: 25 },
      { nameAr: 'عصير خوخ', price: 25 },
    ], juicesCat.id, 50);

    // 6. حلويات
    await addItemsIfNotExist([
      { nameAr: 'أم علي', price: 40 },
      { nameAr: 'كنافة', price: 45 },
      { nameAr: 'بسبوسة', price: 35 },
      { nameAr: 'زلابية', price: 25 },
      { nameAr: 'مهلبية', price: 30 },
      { nameAr: 'رز بلبن', price: 30 },
    ], dessertsCat.id, 20);

    // 7. مشروبات ساخنة
    await addItemsIfNotExist([
      { nameAr: 'شاي', price: 10 },
      { nameAr: 'قهوة سادة', price: 15 },
      { nameAr: 'قهوة بلدي', price: 12 },
      { nameAr: 'نسكافيه', price: 20 },
      { nameAr: 'كابتشينو', price: 25 },
      { nameAr: 'لاتيه', price: 28 },
      { nameAr: 'شاي بلبن', price: 18 },
    ], hotDrinksCat.id, 100);

    console.log('🎉 All new menu items added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding menu items:', error);
    process.exit(1);
  }
};

addMenuItems();