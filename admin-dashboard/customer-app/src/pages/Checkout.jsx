import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || {});
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        menuItem: item.menuItem,
        quantity: item.quantity,
        options: item.options,
      }));
      const { data } = await api.post('/orders', {
        items: orderItems,
        totalPrice,
        deliveryAddress: address,
        phone,
        paymentMethod,
      });
      clearCart();
      navigate(`/tracking/${data._id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/menu');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">إتمام الطلب</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">رقم الهاتف</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">العنوان</label>
            <input
              type="text"
              placeholder="الشارع"
              value={address.street || ''}
              onChange={(e) => setAddress({...address, street: e.target.value})}
              required
              className="w-full border rounded p-2 mb-2"
            />
            {/* Additional address fields */}
          </div>
          <div>
            <label className="block mb-1">طريقة الدفع</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="cash">الدفع عند الاستلام</option>
              <option value="card">بطاقة ائتمان (قريباً)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded font-bold"
          >
            {loading ? 'جاري...' : 'تأكيد الطلب'}
          </button>
        </form>
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="font-bold mb-4">ملخص الطلب</h2>
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between py-2 border-b">
              <span>{item.name} × {item.quantity}</span>
              <span>{item.price * item.quantity} ج.م</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-4">
            <span>الإجمالي</span>
            <span>{totalPrice} ج.م</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;