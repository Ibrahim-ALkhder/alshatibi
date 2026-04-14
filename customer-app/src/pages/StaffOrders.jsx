import { useEffect, useState } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import OrderStatusBadge from '../components/Order/OrderStatusBadge';
import Loader from '../components/UI/Loader';
import { formatPrice, formatOrderId } from '../utils/formatters';
import Button from '../components/UI/Button';

const StaffOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('orderStatusUpdated', (data) => {
      setOrders(prev => prev.map(o => o.id === data.orderId ? { ...o, status: data.status } : o));
    });
    return () => socket.off('orderStatusUpdated');
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
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
      fetchOrders();
    } catch (error) {
      alert('فشل تحديث الحالة');
    }
  };

  const handleAssignPending = async () => {
    setAssigning(true);
    try {
      await api.post('/orders/assign-pending');
      fetchOrders();
      alert('تمت محاولة تخصيص الطلبات المعلقة');
    } catch (error) {
      alert('فشل تخصيص الطلبات');
    } finally {
      setAssigning(false);
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'Delivered');
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  const pendingOrders = activeOrders.filter(o => o.status === 'Ready' && !o.DeliveryDriverId);

  if (loading) return <Loader fullScreen />;

  return (
    <div dir="rtl" className="p-4">
      <h1 className="text-3xl font-bold mb-6">لوحة متابعة الطلبات - الموظف</h1>
      
      {/* قسم الطلبات المعلقة */}
      {pendingOrders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-yellow-800">
              ⏳ طلبات جاهزة بانتظار مناديب ({pendingOrders.length})
            </h2>
            <Button 
              onClick={handleAssignPending} 
              variant="primary" 
              disabled={assigning}
            >
              {assigning ? 'جاري...' : 'تخصيص الآن'}
            </Button>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">الطلبات النشطة</h2>
      <div className="grid gap-4 mb-8">
        {activeOrders.length === 0 && <p className="text-gray-500">لا توجد طلبات نشطة</p>}
        {activeOrders.map(order => (
          <div key={order.id} className={`bg-white rounded-lg shadow p-4 border-r-4 ${
            order.status === 'Ready' && !order.DeliveryDriverId 
              ? 'border-yellow-500' 
              : 'border-orange-500'
          }`}>
            <div className="flex flex-wrap justify-between items-start">
              <div>
                <p className="font-bold">{formatOrderId(order.id)}</p>
                <p className="text-sm text-gray-600">{order.User?.name} - {order.phone}</p>
                <p className="text-sm mt-1">{order.OrderAddress?.street}، {order.OrderAddress?.area}</p>
                <ul className="mt-2 text-sm">
                  {order.OrderItems?.map((item, i) => (
                    <li key={i}>{item.quantity} × {item.name}</li>
                  ))}
                </ul>
                <p className="font-bold mt-2">{formatPrice(order.totalPrice)}</p>
                {order.status === 'Ready' && !order.DeliveryDriverId && (
                  <p className="text-sm text-yellow-700 mt-1">⚠️ بانتظار مندوب</p>
                )}
                {order.DeliveryDriverId && (
                  <p className="text-sm text-blue-700 mt-1">
                    🚚 المندوب: {order.DeliveryDriver?.User?.name || 'غير معروف'}
                  </p>
                )}
              </div>
              <div className="mt-3 sm:mt-0">
                <OrderStatusBadge status={order.status} />
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
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

      <h2 className="text-2xl font-semibold mb-4">الطلبات المكتملة</h2>
      <div className="grid gap-4 opacity-75">
        {completedOrders.slice(0, 10).map(order => (
          <div key={order.id} className="bg-gray-50 rounded-lg shadow p-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{formatOrderId(order.id)}</p>
                <p className="text-sm">{order.User?.name}</p>
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