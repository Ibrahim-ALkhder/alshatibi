import { useEffect, useState } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import OrderCard from '../components/Order/OrderCard';
import Loader from '../components/UI/Loader';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/myorders');
      // الأحدث أولاً
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // استماع للأحداث القادمة من السيرفر
  useEffect(() => {
    if (!socket) return;

    // عند إنشاء طلب جديد
    socket.on('newOrderCreated', (data) => {
      // أضف الطلب الجديد إلى بداية القائمة
      setOrders(prev => [data.order, ...prev]);
    });

    // عند تحديث حالة طلب (للعميل)
    socket.on('orderStatusUpdated', (data) => {
      setOrders(prev =>
        prev.map(order =>
          order.id === data.orderId ? { ...order, status: data.status } : order
        )
      );
    });

    return () => {
      socket.off('newOrderCreated');
      socket.off('orderStatusUpdated');
    };
  }, [socket]);

  if (loading) return <Loader />;

  return (
    <div dir="rtl">
      <h1 className="text-3xl font-bold mb-8">طلباتي</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">لا توجد طلبات سابقة</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;