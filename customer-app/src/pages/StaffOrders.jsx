import { useEffect, useState } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import OrderStatusBadge from '../components/Order/OrderStatusBadge';
import Loader from '../components/UI/Loader';
import { formatPrice, formatOrderId } from '../utils/formatters';

const StaffOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('orderStatusUpdated', (data) => {
      setOrders(prev => prev.map(o => o._id === data.orderId ? { ...o, status: data.status } : o));
    });
    return () => socket.off('orderStatusUpdated');
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders'); // يتطلب صلاحية admin
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // تحديث فوري
    } catch (error) {
      alert('فشل تحديث الحالة');
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'Delivered');
  const completedOrders = orders.filter(o => o.status === 'Delivered');

  if (loading) return <Loader fullScreen />;

  return (
    <div dir="rtl" className="p-4">
      <h1 className="text-3xl font-bold mb-6">لوحة متابعة الطلبات - الموظف</h1>
      
      {/* Active Orders */}
      <h2 className="text-2xl font-semibold mb-4">الطلبات النشطة</h2>
      <div className="grid gap-4 mb-8">
        {activeOrders.length === 0 && <p className="text-gray-500">لا توجد طلبات نشطة</p>}
        {activeOrders.map(order => (
          <div key={order._id} className="bg-white rounded-lg shadow p-4 border-r-4 border-orange-500">
            <div className="flex flex-wrap justify-between items-start">
              <div>
                <p className="font-bold">{formatOrderId(order._id)}</p>
                <p className="text-sm text-gray-600">{order.user?.name} - {order.phone}</p>
                <p className="text-sm mt-1">{order.deliveryAddress?.street}، {order.deliveryAddress?.area}</p>
                <ul className="mt-2 text-sm">
                  {order.items.map((item, i) => (
                    <li key={i}>{item.quantity} × {item.name}</li>
                  ))}
                </ul>
                <p className="font-bold mt-2">{formatPrice(order.totalPrice)}</p>
              </div>
              <div className="mt-3 sm:mt-0">
                <OrderStatusBadge status={order.status} />
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="mt-2 block w-full border rounded p-2 text-sm"
                >
                  <option value="Preparing">قيد التحضير</option>
                  <option value="Ready">جاهز</option>
                  <option value="Out for delivery">خرج للتوصيل</option>
                  <option value="Delivered">تم التوصيل</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completed Orders */}
      <h2 className="text-2xl font-semibold mb-4">الطلبات المكتملة</h2>
      <div className="grid gap-4 opacity-75">
        {completedOrders.slice(0, 10).map(order => (
          <div key={order._id} className="bg-gray-50 rounded-lg shadow p-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{formatOrderId(order._id)}</p>
                <p className="text-sm">{order.user?.name}</p>
                <p className="text-sm">{formatPrice(order.totalPrice)}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffOrders;