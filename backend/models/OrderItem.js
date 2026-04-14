import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import MenuItem from './MenuItem.js';
import Order from './Order.js';

const OrderItem = sequelize.define('OrderItem', {
  name: DataTypes.STRING,
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
});

MenuItem.hasMany(OrderItem);
OrderItem.belongsTo(MenuItem);

Order.hasMany(OrderItem, { onDelete: 'CASCADE' });
OrderItem.belongsTo(Order);

export default OrderItem;