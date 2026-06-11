import { useEffect, useState } from 'react';
import api from '../services/api';
import MenuItemCard from '../components/Menu/MenuItemCard';
import { useCart } from '../context/CartContext';

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, menuRes] = await Promise.all([
        api.get('/categories'),
        api.get('/menu'),
      ]);
      setCategories(catRes.data);
      setMenuItems(menuRes.data);
    };
    fetchData();
  }, []);

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category._id === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">قائمة الطعام</h1>
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full ${selectedCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          الكل
        </button>
        {categories.map(cat => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat._id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedCategory === cat._id ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          >
            {cat.nameAr}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <MenuItemCard key={item._id} item={item} onAdd={addToCart} />
        ))}
      </div>
    </div>
  );
};

export default Menu;