import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import MenuItemOption from '../models/MenuItemOption.js';
import OptionChoice from '../models/OptionChoice.js';

// @desc    Get all menu items
export const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.findAll({
      include: [
        { model: Category },
        { model: MenuItemOption, include: [OptionChoice] },
      ],
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single menu item
export const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: MenuItemOption, include: [OptionChoice] },
      ],
    });
    if (item) res.json(item);
    else res.status(404).json({ message: 'Menu item not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a menu item (admin/staff)
export const createMenuItem = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }
    const item = await MenuItem.create(data);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a menu item (admin/staff)
export const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    const updates = req.body;
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }
    await item.update(updates);
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a menu item (admin/staff)
export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    await item.destroy();
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};