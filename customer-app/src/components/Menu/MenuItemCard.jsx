import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../../utils/formatters';

const MenuItemCard = ({ item, onAddToCart }) => {
  const isAvailable = item.isAvailable && item.stock > 0;
  const imageUrl = getImageUrl(item.image);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${!isAvailable ? 'opacity-70' : ''}`}>
      <Link to={`/menu/${item._id}`}>
        <img
          src={imageUrl}
          alt={item.nameAr}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link to={`/menu/${item._id}`}>
          <h3 className="text-lg font-bold text-gray-800 mb-1">{item.nameAr}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.descriptionAr}</p>

        <p className="text-sm text-gray-500 mb-2">
          {item.stock > 0 ? `متوفر: ${item.stock} قطعة` : 'نفذت الكمية'}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-primary-600">{formatPrice(item.price)}</span>

          {isAvailable ? (
            <button
              onClick={() =>
                onAddToCart({
                  menuItem: item._id,
                  name: item.nameAr,
                  price: item.price,
                  quantity: 1,
                  options: [],
                  image: item.image, 
                })
              }
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              أضف للسلة
            </button>
          ) : (
            <span className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
              غير متوفر
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;