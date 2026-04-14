import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { formatPrice } from '../utils/formatters';
import Button from '../components/UI/Button';

const DriverDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverStatus, setDriverStatus] = useState('available');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const socket = useSocket();
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    fetchDriverStatus();
    fetchOrders();
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('newDeliveryRequest', () => {
      audioRef.current?.play().catch(() => {});
      fetchOrders();
      fetchDriverStatus();
    });
    return () => socket.off('newDeliveryRequest');
  }, [socket]);

  const fetchDriverStatus = async () => {
    try {
      const { data } = await api.get('/driver/status');
      setDriverStatus(data.status);
    } catch (error) {
      console.error('Error fetching driver status:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/driver/orders');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/driver/history');
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/driver/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      fetchHistory();
      fetchDriverStatus();
    } catch (error) {
      alert(error.response?.data?.message || 'فشل تحديث الحالة');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (driverStatus === 'busy') {
      alert('لا يمكنك تغيير حالتك أثناء توصيل طلب');
      return;
    }
    setStatusUpdating(true);
    try {
      await api.put('/driver/status', { status: newStatus });
      setDriverStatus(newStatus);
    } catch (error) {
      alert(error.response?.data?.message || 'فشل تحديث الحالة');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="container mx-auto p-4">
      {/* رأس الصفحة مع حالة المندوب */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">لوحة المندوب</h1>
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow">
          <span className="font-medium text-gray-700">حالتك:</span>
          {driverStatus === 'busy' ? (
            <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full font-medium">
              🟠 مشغول (لديك طلب قيد التوصيل)
            </span>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange('available')}
                disabled={statusUpdating}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  driverStatus === 'available'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                }`}
              >
                🟢 متاح
              </button>
              <button
                onClick={() => handleStatusChange('offline')}
                disabled={statusUpdating}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  driverStatus === 'offline'
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔴 غير متصل
              </button>
            </div>
          )}
        </div>
      </div>

      {/* الطلبات الحالية */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">الطلبات الحالية</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 text-lg">لا توجد طلبات مسندة إليك حالياً.</p>
        </div>
      ) : (
        <div className="grid gap-4 mb-8">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <p className="font-bold text-lg">#{order.id.toString().slice(-6).toUpperCase()}</p>
                  <p className="text-gray-700">{order.User?.name} | {order.phone}</p>
                  <p className="text-gray-700">
                    {order.OrderAddress?.street}، {order.OrderAddress?.area}
                  </p>
                  <p className="text-gray-700 font-bold mt-2">{formatPrice(order.totalPrice)}</p>
                  <div className="mt-2 text-sm text-gray-600">
                    {order.OrderItems?.map((item, idx) => (
                      <div key={idx}>{item.quantity} × {item.name}</div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {order.status === 'Ready' && (
                    <Button onClick={() => handleUpdateStatus(order.id, 'Out for delivery')} variant="secondary">
                      🚚 خرج للتوصيل
                    </Button>
                  )}
                  {order.status === 'Out for delivery' && (
                    <Button onClick={() => handleUpdateStatus(order.id, 'Delivered')} variant="primary">
                      ✅ تم التوصيل
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* آخر 5 طلبات مكتملة */}
      {history.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">آخر الطلبات المكتملة</h2>
          <div className="grid gap-4">
            {history.map(order => (
              <div key={order.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <p className="font-medium">#{order.id.toString().slice(-6).toUpperCase()} - {order.User?.name}</p>
                <p className="text-sm text-gray-600">{formatPrice(order.totalPrice)}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.deliveredAt).toLocaleString('ar-EG')}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DriverDashboard;