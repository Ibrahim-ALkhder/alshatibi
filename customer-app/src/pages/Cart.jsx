import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, getImageUrl } from '../utils/formatters';
import Button from '../components/UI/Button';
import { TrashIcon, PlusIcon, MinusIcon } from '../components/UI/Icons';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const deliveryFee = 20;
  const finalTotal = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="text-center py-16" dir="rtl">
        <h2 className="text-2xl font-bold mb-4">السلة فارغة</h2>
        <p className="text-gray-600 mb-8">لم تقم بإضافة أي عناصر بعد</p>
        <Button onClick={() => navigate('/menu')} variant="primary">
          تصفح القائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">سلة التسوق</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="divide-y">
          {items.map((item, index) => (
            <div
              key={`${item.menuItem}-${index}`}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4"
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  {item.options && item.options.length > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      {item.options.map((opt) => `${opt.name}: ${opt.choice}`).join('، ')}
                    </div>
                  )}
                  <p className="text-primary-600 font-bold mt-1">{formatPrice(item.price)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 space-x-reverse mt-4 sm:mt-0">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => updateQuantity(index, item.quantity - 1)}
                    className="p-2 hover:bg-gray-100"
                    disabled={item.quantity <= 1}
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-bold text-gray-800 w-24 text-center">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <button
                  onClick={() => removeFromCart(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ملخص السلة مع رسوم التوصيل */}
        <div className="border-t mt-6 pt-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">المجموع الفرعي:</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">رسوم التوصيل:</span>
              <span className="font-medium">{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-lg font-bold">الإجمالي:</span>
              <span className="text-2xl font-bold text-primary-600">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={clearCart} variant="secondary" className="sm:w-auto">
              تفريغ السلة
            </Button>
            <Button onClick={() => navigate('/checkout')} variant="primary" className="flex-1 py-3">
              متابعة الشراء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;