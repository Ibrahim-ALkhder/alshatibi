import { useEffect, useState } from 'react';
import api from '../services/api';
import MenuItemCard from '../components/Menu/MenuItemCard';
import { useCart } from '../context/CartContext';
import Loader from '../components/UI/Loader';
import { MagnifyingGlassIcon } from '../components/UI/Icons'; // أيقونة البحث (سنضيفها لاحقًا)

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, menuRes] = await Promise.all([
          api.get('/categories'),
          api.get('/menu'),
        ]);
        setCategories(catRes.data);
        setMenuItems(menuRes.data);
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // تصفية العناصر حسب الفئة والبحث
  const filteredItems = menuItems.filter(item => {
    // فلترة الفئة
const matchesCategory = selectedCategory === 'all' || item.Category?.id === selectedCategory    // فلترة البحث (إذا لم يكن هناك نص بحث، نتجاوز)
    if (!searchTerm.trim()) return matchesCategory;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      item.nameAr?.toLowerCase().includes(searchLower) ||
      item.descriptionAr?.toLowerCase().includes(searchLower) ||
      item.category?.nameAr?.toLowerCase().includes(searchLower);
    
    return matchesCategory && matchesSearch;
  });

  if (loading) return <Loader />;

  return (
    <div dir="rtl" className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">قائمة الطعام</h1>
      
      {/* شريط البحث */}
      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن صنف، وصف، أو فئة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pr-12 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <MagnifyingGlassIcon className="w-6 h-6" />
          </span>
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-500 mt-2 mr-2">
            تم العثور على {filteredItems.length} عنصر
          </p>
        )}
      </div>

      {/* فئات التصفية (أزرار أفقية) */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-5 py-2 rounded-full whitespace-nowrap transition-colors text-base ${
            selectedCategory === 'all'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          الكل
        </button>
        {categories.map(cat => (
  <button
    key={cat.id}
    onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-2 rounded-full whitespace-nowrap transition-colors text-base ${
              selectedCategory === cat._id
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.nameAr}
          </button>
        ))}
      </div>

      {/* شبكة المنتجات */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <MenuItemCard
              key={item._id}
              item={item}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">لا توجد عناصر مطابقة للبحث</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
            className="mt-4 text-primary-600 hover:underline"
          >
            عرض كل الأصناف
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;