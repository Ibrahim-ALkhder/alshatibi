import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Order from './Order.js';

const OrderAddress = sequelize.define('OrderAddress', {
  street: DataTypes.STRING,
  city: DataTypes.STRING,
  area: DataTypes.STRING,
  building: DataTypes.STRING,
  floor: DataTypes.STRING,
  apartment: DataTypes.STRING,
  notes: DataTypes.STRING,
});

Order.hasOne(OrderAddress, { onDelete: 'CASCADE' });
OrderAddress.belongsTo(Order);

export default OrderAddress;