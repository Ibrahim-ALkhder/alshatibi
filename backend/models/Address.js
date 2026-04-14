import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Address = sequelize.define('Address', {
  street: DataTypes.STRING,
  city: DataTypes.STRING,
  area: DataTypes.STRING,
  building: DataTypes.STRING,
  floor: DataTypes.STRING,
  apartment: DataTypes.STRING,
  notes: DataTypes.STRING,
});

User.hasOne(Address, { onDelete: 'CASCADE' });
Address.belongsTo(User);

export default Address;