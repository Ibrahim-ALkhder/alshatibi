import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';
import { TrashIcon, PlusIcon, MinusIcon } from '../UI/Icons';

const CartItem = ({ item, index, onUpdateQuantity, onRemove }) => {
  const subtotal = item.price * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b">
      <div className="flex items-center space-x-4 space-x-reverse">
        <img
          src={item.image || 'https://via.placeholder.com/80?text=الشطبي'}
          alt={item.name}
          className="w-20 h-20 object-cover rounded"
        />
        <div>
          <Link to={`/menu/${item.menuItem}`} className="font-medium text-gray-800 hover:text-primary-600">
            {item.name}
          </Link>
          {item.options && item.options.length > 0 && (
            <div className="text-sm text-gray-500 mt-1">
              {item.options.map(opt => `${opt.name}: ${opt.choice}`).join('، ')}
            </div>
          )}
          <p className="text-primary-600 font-bold mt-1">{formatPrice(item.price)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 space-x-reverse mt-4 sm:mt-0">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
            className="p-2 hover:bg-gray-100"
            disabled={item.quantity <= 1}
          >
            <MinusIcon className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
            className="p-2 hover:bg-gray-100"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
        <p className="font-bold text-gray-800 w-24 text-center">{formatPrice(subtotal)}</p>
        <button
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700 p-2"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;