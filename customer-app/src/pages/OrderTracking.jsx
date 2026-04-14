import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { formatPrice, formatOrderId } from '../utils/formatters';
import Loader from '../components/UI/Loader';
import OrderStatusBadge from '../components/Order/OrderStatusBadge';
import { toast } from 'react-toastify';

const statusSteps = [
  { key: 'Preparing', label: 'قيد التحضير' },
  { key: 'Ready', label: 'جاهز' },
  { key: 'Out for delivery', label: 'قيد التوصيل' },
  { key: 'Delivered', label: 'تم التوصيل' },
];

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    socket.on('orderStatusUpdated', (data) => {
      if (data.orderId == id) {
        setOrder(prev => prev ? { ...prev, status: data.status } : prev);
      }
    });

    socket.on('driverUnavailable', (data) => {
      if (data.orderId == id) {
        try {
          toast.info(data.message, {
            position: "top-center",
            autoClose: 7000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        } catch (e) {
          console.warn('Toast not available');
        }
      }
    });

    return () => {
      socket.off('orderStatusUpdated');
      socket.off('driverUnavailable');
    };
  }, [socket, id]);

  if (loading) return <Loader fullScreen />;
  if (!order) return <div className="text-center py-8 text-lg">الطلب غير موجود</div>;

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);
  const progressPercentage = ((currentStepIndex + 1) / statusSteps.length) * 100;

  return (
    <div className="max-w-3xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-2">تتبع الطلب</h1>
      <p className="text-gray-600 mb-6">رقم الطلب: {formatOrderId(order.id)}</p>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-medium">حالة الطلب:</span>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="relative pt-2">
          <div className="h-3 bg-primary-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                order.status !== 'Delivered'
                  ? 'progress-bar-gradient progress-bar-animated'
                  : 'progress-bar-gradient'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex justify-between mt-2">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} className="flex flex-col items-center" style={{ width: '20%' }}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isCompleted
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-300'
                    } ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}
                  >
                    {isCompleted && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center font-medium ${
                    isCompleted ? 'text-primary-700' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t mt-6 pt-4">
          <p className="text-sm text-gray-500">
            تاريخ الطلب: {new Date(order.createdAt).toLocaleString('ar-EG')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">تفاصيل الطلب</h2>
        <div className="space-y-3 mb-4">
          {order.OrderItems?.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{item.quantity} × {item.name}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>الإجمالي</span>
            <span className="text-primary-600">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;