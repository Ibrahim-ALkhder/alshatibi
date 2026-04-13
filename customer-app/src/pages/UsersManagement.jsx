import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Loader from '../components/UI/Loader';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from 'react-select';

const roleOptions = [
  { value: 'customer', label: 'عميل' },
  { value: 'staff', label: 'موظف' },
  { value: 'admin', label: 'مدير' },
  { value: 'driver', label: 'مندوب توصيل' }, // ← تمت الإضافة
];

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  staff: 'bg-blue-100 text-blue-800',
  driver: 'bg-orange-100 text-orange-800', // لون مميز للمندوب
  customer: 'bg-gray-100 text-gray-800',
};

const roleLabels = {
  admin: 'مدير',
  staff: 'موظف',
  driver: 'مندوب',
  customer: 'عميل',
};

const UsersManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'staff',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'فشل الحذف');
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      phone: u.phone || '',
      role: u.role,
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'staff',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    const payload = { ...formData };
    if (!editingUser && !payload.password) {
      setError('كلمة المرور مطلوبة للمستخدم الجديد');
      setSubmitLoading(false);
      return;
    }
    if (editingUser && !payload.password) {
      delete payload.password;
    }

    try {
      if (editingUser) {
        const { data } = await api.put(`/users/${editingUser._id}`, payload);
        setUsers(users.map(u => u._id === editingUser._id ? data : u));
      } else {
        const { data } = await api.post('/users', payload);
        setUsers([data, ...users]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitLoading(false);
    }
  };

  const selectedRole = roleOptions.find(opt => opt.value === formData.role);

  if (user?.role !== 'admin') return <Navigate to="/" />;
  if (loading) return <Loader fullScreen />;

  return (
    <div dir="rtl" className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <Button onClick={handleAddNew} variant="primary">+ إضافة مستخدم جديد</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right">الاسم</th>
              <th className="px-4 py-3 text-right">البريد الإلكتروني</th>
              <th className="px-4 py-3 text-right">الهاتف</th>
              <th className="px-4 py-3 text-right">الدور</th>
              <th className="px-4 py-3 text-right">تاريخ التسجيل</th>
              <th className="px-4 py-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u._id}>
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.phone}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${roleColors[u.role] || 'bg-gray-100 text-gray-800'}`}>
                    {roleLabels[u.role] || u.role}
                  </span>
                </td>
                <td className="px-4 py-2">{new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
                <td className="px-4 py-2 space-x-2 space-x-reverse">
                  <button onClick={() => handleEdit(u)} className="text-blue-600 hover:underline ml-2">
                    تعديل
                  </button>
                  <button onClick={() => handleDelete(u._id)} className="text-red-600 hover:underline">
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h2>
              <form onSubmit={handleSubmit}>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <Input
                  label="الاسم الكامل"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="رقم الهاتف"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label={editingUser ? 'كلمة المرور (اتركه فارغاً لعدم التغيير)' : 'كلمة المرور'}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />

                <div className="mb-4">
                  <label className="block mb-1 font-medium">الدور</label>
                  <Select
                    options={roleOptions}
                    value={selectedRole}
                    onChange={(option) => setFormData({ ...formData, role: option.value })}
                    placeholder="اختر الدور"
                    isSearchable={false}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitLoading}>
                    {submitLoading ? 'جاري...' : editingUser ? 'تحديث' : 'إضافة'}
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

export default UsersManagement;