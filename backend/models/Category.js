import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  nameAr: { type: DataTypes.STRING, allowNull: false },
  image: DataTypes.STRING,
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: true });

export default Category;