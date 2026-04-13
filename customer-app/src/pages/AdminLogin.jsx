import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      // تأكد من أن المستخدم مدير أو موظف
      if (data.role !== 'admin' && data.role !== 'staff') {
        throw new Error('غير مصرح لك بالدخول إلى لوحة الإدارة');
      }
      // التوجيه حسب الدور
      if (data.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/staff/orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-300 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-primary-700 mb-2">لوحة الإدارة</h2>
        <p className="text-center text-gray-600 mb-6">تسجيل الدخول للمديرين والموظفين</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Input
            label="البريد الإلكتروني"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="كلمة المرور"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>
            {loading ? 'جاري الدخول...' : 'دخول'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;