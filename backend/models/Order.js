import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import DeliveryDriver from './DeliveryDriver.js';

const Order = sequelize.define('Order', {
  totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM('Preparing', 'Ready', 'Out for delivery', 'Delivered'),
    defaultValue: 'Preparing',
  },
  paymentMethod: { type: DataTypes.ENUM('cash', 'card'), defaultValue: 'cash' },
  isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
  paidAt: DataTypes.DATE,
  deliveredAt: DataTypes.DATE,
  deliveryFee: { type: DataTypes.FLOAT, defaultValue: 20 },
  readyAt: { type: DataTypes.DATE, allowNull: true }, // ✅ حقل جديد
}, { timestamps: true });

User.hasMany(Order);
Order.belongsTo(User);

DeliveryDriver.hasMany(Order);
Order.belongsTo(DeliveryDriver);

export default Order;