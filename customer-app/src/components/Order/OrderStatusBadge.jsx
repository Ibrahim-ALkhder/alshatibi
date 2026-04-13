const statusConfig = {
  'Preparing': { label: 'قيد التحضير', color: 'bg-yellow-100 text-yellow-800' },
  'Ready': { label: 'جاهز', color: 'bg-blue-100 text-blue-800' },
  'Out for delivery': { label: 'قيد التوصيل', color: 'bg-purple-100 text-purple-800' },
  'Delivered': { label: 'تم التوصيل', color: 'bg-green-100 text-green-800' },
};

const OrderStatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;