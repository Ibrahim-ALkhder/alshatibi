import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

const statusSteps = ['Preparing', 'Ready', 'Out for delivery', 'Delivered'];

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.on('orderStatusUpdated', (data) => {
      if (data.orderId === id) {
        setOrder(prev => ({ ...prev, status: data.status }));
      }
    });
    return () => socket.off('orderStatusUpdated');
  }, [socket, id]);

  if (!order) return <div>Loading...</div>;

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">تتبع الطلب #{order._id.slice(-6)}</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between mb-8">
          {statusSteps.map((step, idx) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                {idx + 1}
              </div>
              <span className="mt-2 text-sm">{step}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <p>الحالة الحالية: <strong>{order.status}</strong></p>
          <p>الإجمالي: {order.totalPrice} ج.م</p>
          <p>تاريخ الطلب: {new Date(order.createdAt).toLocaleString('ar-EG')}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;