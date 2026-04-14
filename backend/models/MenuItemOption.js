import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import MenuItem from './MenuItem.js';

const MenuItemOption = sequelize.define('MenuItemOption', {
  name: DataTypes.STRING,
  nameAr: DataTypes.STRING,
});

MenuItem.hasMany(MenuItemOption, { onDelete: 'CASCADE' });
MenuItemOption.belongsTo(MenuItem);

export default MenuItemOption;