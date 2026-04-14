import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Category from './Category.js';

const MenuItem = sequelize.define('MenuItem', {
  name: { type: DataTypes.STRING, allowNull: false },
  nameAr: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  descriptionAr: DataTypes.TEXT,
  price: { type: DataTypes.FLOAT, allowNull: false },
  image: DataTypes.STRING,
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  preparationTime: { type: DataTypes.INTEGER, defaultValue: 15 },
}, { timestamps: true });

Category.hasMany(MenuItem, { onDelete: 'CASCADE' });
MenuItem.belongsTo(Category);

export default MenuItem;