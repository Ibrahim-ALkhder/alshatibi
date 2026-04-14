import sequelize from '../config/database.js';
import User from './User.js';
import Address from './Address.js';
import Category from './Category.js';
import MenuItem from './MenuItem.js';
import MenuItemOption from './MenuItemOption.js';
import OptionChoice from './OptionChoice.js';
import Order from './Order.js';
import OrderAddress from './OrderAddress.js';
import OrderItem from './OrderItem.js';
import DeliveryDriver from './DeliveryDriver.js';

// العلاقات تم تعريفها داخل كل ملف نموذج، ولكن يمكن أيضاً تجميعها هنا للتأكيد

const models = {
  User,
  Address,
  Category,
  MenuItem,
  MenuItemOption,
  OptionChoice,
  Order,
  OrderAddress,
  OrderItem,
  DeliveryDriver,
};

// مزامنة قاعدة البيانات (اختياري)
export const syncDatabase = async (force = false) => {
  await sequelize.sync({ force });
  console.log('✅ Database synced');
};

export default models;