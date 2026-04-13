import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: {
      street: '',
      city: 'القاهرة',
      area: '',
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
    setError('');
    
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            إنشاء حساب جديد
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            أو{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              تسجيل الدخول إذا كان لديك حساب
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <Input
            label="الاسم الكامل"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
          />
          
          <Input
            label="البريد الإلكتروني"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          
          <Input
            label="كلمة المرور"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            minLength={6}
          />
          
          <Input
            label="رقم الهاتف"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="01xxxxxxxxx"
          />
          
          <Input
            label="الشارع"
            name="address.street"
            type="text"
            required
            value={formData.address.street}
            onChange={handleChange}
          />
          
          <Input
            label="المنطقة"
            name="address.area"
            type="text"
            required
            value={formData.address.area}
            onChange={handleChange}
          />
          
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            disabled={loading}
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;