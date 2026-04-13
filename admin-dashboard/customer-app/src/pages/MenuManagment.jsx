import { useEffect, useState } from 'react';
import api from '../services/api';
import MenuItemForm from '../components/Menu/MenuItemForm';

const MenuManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [itemsRes, catRes] = await Promise.all([
      api.get('/menu'),
      api.get('/categories'),
    ]);
    setItems(itemsRes.data);
    setCategories(catRes.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد؟')) {
      await api.delete(`/menu/${id}`);
      fetchData();
    }
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة القائمة</h1>
        <button
          onClick={() => setEditing({})}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          إضافة صنف جديد
        </button>
      </div>

      {editing && (
        <MenuItemForm
          item={editing}
          categories={categories}
          onSave={async (itemData) => {
            if (itemData._id) {
              await api.put(`/menu/${itemData._id}`, itemData);
            } else {
              await api.post('/menu', itemData);
            }
            setEditing(null);
            fetchData();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {items.map(item => (
          <div key={item._id} className="border rounded p-4 shadow">
            <img src={item.image || '/placeholder.jpg'} alt={item.nameAr} className="w-full h-40 object-cover rounded" />
            <h3 className="font-bold mt-2">{item.nameAr}</h3>
            <p className="text-gray-600">{item.price} ج.م</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setEditing(item)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                تعديل
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuManagement;