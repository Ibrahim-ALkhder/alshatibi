import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import MenuItemOption from './MenuItemOption.js';

const OptionChoice = sequelize.define('OptionChoice', {
  name: DataTypes.STRING,
  nameAr: DataTypes.STRING,
  price: { type: DataTypes.FLOAT, defaultValue: 0 },
});

MenuItemOption.hasMany(OptionChoice, { onDelete: 'CASCADE' });
OptionChoice.belongsTo(MenuItemOption);

export default OptionChoice;