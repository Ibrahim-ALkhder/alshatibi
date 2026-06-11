import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Loader from '../components/UI/Loader';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from 'react-select';

const roleOptions = [
  { value: 'all', label: 'الكل' },
  { value: 'customer', label: 'عميل' },
  { value: 'staff', label: 'موظف' },
  { value: 'admin', label: 'مدير' },
  { value: 'driver', label: 'مندوب توصيل' },
];

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  staff: 'bg-blue-100 text-blue-800',
  driver: 'bg-orange-100 text-orange-800',
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

  // حالات البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

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
      setUsers(users.filter((u) => u.id !== id));
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
        const { data } = await api.put(`/users/${editingUser.id}`, payload);
        setUsers(users.map((u) => (u.id === editingUser.id ? data : u)));
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

  // تصفية المستخدمين حسب البحث والدور
  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      u.name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower) ||
      roleLabels[u.role]?.toLowerCase().includes(searchLower);

    const matchesRole = filterRole === 'all' || u.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const selectedRole = roleOptions.find((opt) => opt.value === formData.role);

  if (user?.role !== 'admin') return <Navigate to="/" />;
  if (loading) return <Loader fullScreen />;

  return (
    <div dir="rtl" className="p-4 md:p-6">
      {/* العنوان والزر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <Button
          onClick={handleAddNew}
          variant="primary"
          className="text-sm md:text-lg py-2 px-4 md:py-3 md:px-6 self-end sm:self-auto"
        >
          + إضافة مستخدم جديد
        </Button>
      </div>

      {/* شريط البحث والتصفية */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="ابحث باسم، بريد، أو دور..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={roleOptions}
            value={roleOptions.find((opt) => opt.value === filterRole)}
            onChange={(option) => setFilterRole(option.value)}
            placeholder="تصفية حسب الدور"
            isSearchable={false}
          />
        </div>
      </div>

      {/* جدول / كروت المستخدمين */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="table-wrapper">
          <table className="min-w-full divide-y divide-gray-200 responsive-card-table">
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
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td data-label="الاسم">{u.name}</td>
                  <td data-label="البريد">{u.email}</td>
                  <td data-label="الهاتف">{u.phone}</td>
                  <td data-label="الدور">
                    <span className={`px-2 py-1 rounded text-sm ${roleColors[u.role] || 'bg-gray-100 text-gray-800'}`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td data-label="تاريخ التسجيل">
                    {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td data-label="إجراءات">
                    <button onClick={() => handleEdit(u)} className="text-blue-600 hover:underline ml-2">
                      تعديل
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">لا يوجد مستخدمين مطابقين للبحث</div>
        )}
      </div>

      {/* Modal للإضافة / التعديل */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
              </h2>
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
                    options={roleOptions.filter(opt => opt.value !== 'all')}
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