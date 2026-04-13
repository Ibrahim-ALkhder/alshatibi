import { useEffect, useState } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('orderStatusUpdated', (data) => {
      setOrders(prev => prev.map(o => o._id === data.orderId ? {...o, status: data.status} : o));
    });
    return () => socket.off('orderStatusUpdated');
  }, [socket]);

  const fetchOrders = async () => {
    const { data } = await api.get('/orders');
    setOrders(data);
  };

  const updateStatus = async (orderId, status) => {
    await api.put(`/orders/${orderId}/status`, { status });
    fetchOrders();
  };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">إدارة الطلبات</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-right">رقم الطلب</th>
              <th className="p-3 text-right">العميل</th>
              <th className="p-3 text-right">الإجمالي</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-b">
                <td className="p-3">{order._id.slice(-6)}</td>
                <td className="p-3">{order.user?.name}</td>
                <td className="p-3">{order.totalPrice} ج.م</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    order.status === 'Delivered' ? 'bg-green-200' : 'bg-yellow-200'
                  }`}>{order.status}</span>
                </td>
                <td className="p-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="Preparing">قيد التحضير</option>
                    <option value="Ready">جاهز</option>
                    <option value="Out for delivery">قيد التوصيل</option>
                    <option value="Delivered">تم التوصيل</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;