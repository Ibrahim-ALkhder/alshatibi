import { Link } from 'react-router-dom';
import { formatPrice, formatDate, formatOrderId } from '../../utils/formatters';
import OrderStatusBadge from './OrderStatusBadge';

const OrderCard = ({ order }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">رقم الطلب: {formatOrderId(order.id)}</p>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="border-t pt-4">
        <p className="font-medium mb-2">العناصر:</p>
        <ul className="space-y-2">
          {order.OrderItems?.slice(0, 3).map((item, idx) => (
            <li key={idx} className="flex justify-between text-sm">
              <span>{item.quantity} × {item.name}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
          {order.OrderItems?.length > 3 && (
            <li className="text-sm text-gray-500">+ {order.OrderItems.length - 3} عناصر أخرى</li>
          )}
        </ul>
      </div>

      <div className="border-t mt-4 pt-4 flex justify-between items-center">
        <span className="font-bold">الإجمالي: {formatPrice(order.totalPrice)}</span>
        <Link
          to={`/tracking/${order.id}`}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          تتبع الطلب ←
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;