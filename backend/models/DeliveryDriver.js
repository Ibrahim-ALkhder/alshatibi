import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const DeliveryDriver = sequelize.define('DeliveryDriver', {
  status: {
    type: DataTypes.ENUM('available', 'busy', 'offline'),
    defaultValue: 'available',
  },
  rating: { type: DataTypes.FLOAT, defaultValue: 5 },
  totalDeliveries: { type: DataTypes.INTEGER, defaultValue: 0 },
  currentOrderId: { type: DataTypes.INTEGER, allowNull: true }, // للتتبع
}, { timestamps: true });

User.hasOne(DeliveryDriver, { onDelete: 'CASCADE' });
DeliveryDriver.belongsTo(User);

export default DeliveryDriver;