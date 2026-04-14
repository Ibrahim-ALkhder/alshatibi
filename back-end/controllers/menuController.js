import MenuItem from '../models/MenuItem.js';

// @desc    Get all menu items
// @route   GET /api/menu
export const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({}).populate('category');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
export const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category');
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a menu item
// @route   POST /api/menu
export const createMenuItem = async (req, res) => {
  try {
    const itemData = { ...req.body };
    
    // إضافة مسار الصورة إذا تم رفع ملف
    if (req.file) {
      itemData.image = `/uploads/${req.file.filename}`;
    }
    
    // تحويل stock إلى رقم
    if (itemData.stock) {
      itemData.stock = Number(itemData.stock);
    }
    
    const item = new MenuItem(itemData);
    const created = await item.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
export const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // تحديث الحقول النصية
    item.name = req.body.name || item.name;
    item.nameAr = req.body.nameAr || item.nameAr;
    item.description = req.body.description || item.description;
    item.descriptionAr = req.body.descriptionAr || item.descriptionAr;
    item.price = req.body.price || item.price;
    item.category = req.body.category || item.category;
    item.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
    
    if (req.body.stock !== undefined) {
      item.stock = Number(req.body.stock);
    }

    // تحديث الصورة إذا تم رفع ملف جديد
    if (req.file) {
      item.image = `/uploads/${req.file.filename}`;
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (item) {
      await item.deleteOne();
      res.json({ message: 'Menu item removed' });
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};