import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Loader from '../components/UI/Loader';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { formatPrice, getImageUrl } from '../utils/formatters';
import Select from 'react-select';

const MenuManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nameAr: '',
    descriptionAr: '',
    price: '',
    category: '',
    isAvailable: true,
    stock: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        api.get('/menu'),
        api.get('/categories'),
      ]);
      setItems(itemsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الصنف؟')) return;
    try {
      await api.delete(`/menu/${id}`);
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      alert('فشل الحذف');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nameAr: item.nameAr,
      descriptionAr: item.descriptionAr || '',
      price: item.price,
      category: item.CategoryId || item.category?.id || '',
      isAvailable: item.isAvailable,
      stock: item.stock || 0,
    });
    setPreviewUrl('');
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      nameAr: '',
      descriptionAr: '',
      price: '',
      category: categories[0]?.id || '',
      isAvailable: true,
      stock: 0,
    });
    setImageFile(null);
    setPreviewUrl('');
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    const data = new FormData();
    data.append('nameAr', formData.nameAr);
    data.append('name', formData.nameAr);
    data.append('descriptionAr', formData.descriptionAr);
    data.append('description', formData.descriptionAr);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('isAvailable', formData.isAvailable);
    data.append('stock', formData.stock);
    if (imageFile) data.append('image', imageFile);

    try {
      if (editingItem) {
        const res = await api.put(`/menu/${editingItem.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setItems(items.map((item) => (item.id === editingItem.id ? res.data : item)));
      } else {
        const res = await api.post('/menu', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setItems([res.data, ...items]);
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitLoading(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.nameAr,
  }));

  const selectedCategoryOption = categoryOptions.find((opt) => opt.value === formData.category) || null;

  if (user?.role !== 'admin' && user?.role !== 'staff') {
    return <Navigate to="/" />;
  }

  if (loading) return <Loader fullScreen />;

  return (
    <div dir="rtl" className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة قائمة الطعام</h1>
        <Button onClick={handleAddNew} variant="primary">
          + إضافة صنف جديد
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right">الصورة</th>
              <th className="px-4 py-3 text-right">الاسم</th>
              <th className="px-4 py-3 text-right">الفئة</th>
              <th className="px-4 py-3 text-right">السعر</th>
              <th className="px-4 py-3 text-right">المخزون</th>
              <th className="px-4 py-3 text-right">متوفر</th>
              <th className="px-4 py-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.nameAr}
                    className="w-10 h-10 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-2">{item.nameAr}</td>
                <td className="px-4 py-2">{item.Category?.nameAr}</td>
                <td className="px-4 py-2">{formatPrice(item.price)}</td>
                <td className="px-4 py-2">{item.stock}</td>
                <td className="px-4 py-2">
                  <span className={item.isAvailable ? 'text-green-600' : 'text-red-600'}>
                    {item.isAvailable ? 'نعم' : 'لا'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline ml-2">
                    تعديل
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{editingItem ? 'تعديل الصنف' : 'إضافة صنف جديد'}</h2>
              <form onSubmit={handleSubmit}>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <div className="mb-4">
                  <label className="block mb-1">الصورة</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {previewUrl && (
                    <img src={previewUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                  {editingItem && !previewUrl && editingItem.image && (
                    <img src={getImageUrl(editingItem.image)} alt="Current" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>

                <Input
                  label="الاسم بالعربية"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  required
                />

                <div className="mb-4">
                  <label className="block mb-1">الوصف</label>
                  <textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    className="input-field"
                    rows="3"
                  />
                </div>

                <Input
                  label="السعر (جنيه)"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />

                <Input
                  label="الكمية المتوفرة (المخزون)"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  required
                />

                <div className="mb-4">
                  <label className="block mb-1">الفئة</label>
                  <Select
                    options={categoryOptions}
                    value={selectedCategoryOption}
                    onChange={(option) => setFormData({ ...formData, category: option.value })}
                    placeholder="اختر الفئة"
                    isSearchable
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="ml-2"
                    />
                    <span>متوفر حالياً</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitLoading}>
                    {submitLoading ? 'جاري الحفظ...' : editingItem ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;