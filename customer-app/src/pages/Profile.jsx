import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    address: user?.address || {
      street: '',
      city: '',
      area: '',
      building: '',
      floor: '',
      apartment: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      await updateProfile(updateData);
      setMessage('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      setMessage(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">الملف الشخصي</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('نجاح') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <Input
          label="الاسم الكامل"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <Input
          label="البريد الإلكتروني"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <Input
          label="رقم الهاتف"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        
        <Input
          label="كلمة المرور الجديدة (اتركه فارغاً إذا لم ترغب في تغييرها)"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
        
        <h2 className="text-xl font-bold mt-6 mb-4">العنوان</h2>
        
        <Input
          label="الشارع"
          name="address.street"
          value={formData.address.street}
          onChange={handleChange}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="المدينة"
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
          />
          <Input
            label="المنطقة"
            name="address.area"
            value={formData.address.area}
            onChange={handleChange}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="العمارة"
            name="address.building"
            value={formData.address.building}
            onChange={handleChange}
          />
          <Input
            label="الدور"
            name="address.floor"
            value={formData.address.floor}
            onChange={handleChange}
          />
          <Input
            label="الشقة"
            name="address.apartment"
            value={formData.address.apartment}
            onChange={handleChange}
          />
        </div>
        
        <Button
          type="submit"
          variant="primary"
          className="w-full mt-6"
          disabled={loading}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </form>
    </div>
  );
};

export default Profile;