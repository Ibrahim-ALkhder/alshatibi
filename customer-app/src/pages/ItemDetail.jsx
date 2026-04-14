import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice, getImageUrl } from '../utils/formatters';
import Loader from '../components/UI/Loader';
import Button from '../components/UI/Button';
import { PlusIcon, MinusIcon } from '../components/UI/Icons';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await api.get(`/menu/${id}`);
        setItem(data);
        const options = {};
        data.options?.forEach((opt) => {
          if (opt.choices.length > 0) {
            options[opt.name] = opt.choices[0];
          }
        });
        setSelectedOptions(options);
      } catch (error) {
        console.error('Error fetching item:', error);
        navigate('/menu');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handleOptionChange = (optionName, choice) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: choice }));
  };

  const calculateTotalPrice = () => {
    if (!item) return 0;
    let total = item.price;
    Object.values(selectedOptions).forEach((choice) => {
      if (choice?.price) total += choice.price;
    });
    return total * quantity;
  };

  const handleAddToCart = (e) => {
    e?.preventDefault();
    if (!item || item.stock < quantity) {
      alert('الكمية المطلوبة غير متوفرة');
      return;
    }
    const cartItem = {
      menuItem: item.id,
      name: item.nameAr,
      price: item.price,
      quantity,
      options: Object.entries(selectedOptions).map(([name, choice]) => ({
        name,
        choice: choice.nameAr || choice.name,
        price: choice.price || 0,
      })),
      image: item.image,
    };
    addToCart(cartItem);
    navigate('/cart');
  };

  if (loading) return <Loader fullScreen />;
  if (!item) return null;

  const isAvailable = item.isAvailable && item.stock > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img
              src={getImageUrl(item.image)}
              alt={item.nameAr}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          <div className="p-6 md:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{item.nameAr}</h1>
            <p className="text-gray-600 mb-4">{item.descriptionAr}</p>
            <p className="text-2xl font-bold text-primary-600 mb-2">{formatPrice(item.price)}</p>
            <p className="text-sm text-gray-600 mb-4">
              {item.stock > 0 ? `الكمية المتوفرة: ${item.stock}` : 'نفذت الكمية'}
            </p>

            {/* Options */}
            {item.options?.map((option) => (
              <div key={option.name} className="mb-4">
                <label className="block font-medium mb-2">{option.nameAr}</label>
                <select
                  value={selectedOptions[option.name]?.name || ''}
                  onChange={(e) => {
                    const choice = option.choices.find((c) => c.name === e.target.value);
                    handleOptionChange(option.name, choice);
                  }}
                  className="input-field"
                >
                  {option.choices.map((choice) => (
                    <option key={choice.name} value={choice.name}>
                      {choice.nameAr} {choice.price > 0 && `(+${formatPrice(choice.price)})`}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Quantity selector */}
            {isAvailable && (
              <div className="mb-6">
                <label className="block font-medium mb-2">الكمية</label>
                <div className="flex items-center border rounded-lg w-32">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(item.stock, q + 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">الإجمالي:</span>
                <span className="text-xl font-bold text-primary-600">{formatPrice(calculateTotalPrice())}</span>
              </div>
              {isAvailable ? (
                <Button onClick={handleAddToCart} variant="primary" className="w-full py-3 text-lg">
                  أضف إلى السلة
                </Button>
              ) : (
                <div className="w-full py-3 text-lg text-center bg-gray-200 text-gray-600 rounded-lg">
                  هذا الصنف غير متوفر حالياً
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;