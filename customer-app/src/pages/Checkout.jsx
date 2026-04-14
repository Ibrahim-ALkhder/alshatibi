import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatPrice } from '../utils/formatters';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    deliveryAddress: user?.address || {
      street: '',
      city: 'القاهرة',
      area: '',
      building: '',
      floor: '',
      apartment: '',
      notes: '',
    },
    paymentMethod: 'cash',
  });
  const [error, setError] = useState('');

  const deliveryFee = 20;
  const finalTotal = totalPrice + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      navigate('/menu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: items.map((item) => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
          options: item.options || [],
        })),
        totalPrice: finalTotal,
        deliveryAddress: formData.deliveryAddress,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
      };

      const { data } = await api.post('/orders', orderData);
      clearCart();
      // استخدام data.id بدلاً من data._id
      navigate(`/tracking/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <h2 className="text-xl font-bold mb-4">معلومات التوصيل</h2>

            <Input
              label="رقم الهاتف"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
            />

            <Input
              label="الشارع"
              name="deliveryAddress.street"
              required
              value={formData.deliveryAddress.street}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="المنطقة"
                name="deliveryAddress.area"
                required
                value={formData.deliveryAddress.area}
                onChange={handleChange}
              />
              <Input
                label="المدينة"
                name="deliveryAddress.city"
                required
                value={formData.deliveryAddress.city}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="رقم العمارة"
                name="deliveryAddress.building"
                value={formData.deliveryAddress.building}
                onChange={handleChange}
              />
              <Input
                label="الدور"
                name="deliveryAddress.floor"
                value={formData.deliveryAddress.floor}
                onChange={handleChange}
              />
              <Input
                label="الشقة"
                name="deliveryAddress.apartment"
                value={formData.deliveryAddress.apartment}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ملاحظات إضافية (اختياري)
              </label>
              <textarea
                name="deliveryAddress.notes"
                value={formData.deliveryAddress.notes}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="أي تعليمات خاصة للتوصيل..."
              />
            </div>

            <h2 className="text-xl font-bold mb-4">طريقة الدفع</h2>
            <div className="mb-6">
              <label className="flex items-center space-x-3 space-x-reverse">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600"
                />
                <span>الدفع عند الاستلام (نقداً)</span>
              </label>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>
              {loading ? 'جاري إنشاء الطلب...' : 'تأكيد الطلب'}
            </Button>
          </form>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
          <div className="space-y-3 mb-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">المجموع الفرعي:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">رسوم التوصيل:</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>الإجمالي</span>
              <span className="text-primary-600">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;