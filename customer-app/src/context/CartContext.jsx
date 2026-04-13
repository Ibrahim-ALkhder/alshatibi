import { createContext, useContext, useReducer, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => 
          item.menuItem === action.payload.menuItem &&
          JSON.stringify(item.options) === JSON.stringify(action.payload.options)
      );
      
      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += action.payload.quantity;
        return { ...state, items: updatedItems };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((_, idx) => idx !== action.payload),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item, idx) =>
          idx === action.payload.index
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [storedCart, setStoredCart] = useLocalStorage('cart', { items: [] });
  const [state, dispatch] = useReducer(cartReducer, storedCart);

  useEffect(() => {
    setStoredCart(state);
  }, [state, setStoredCart]);

  const addToCart = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeFromCart = (index) => dispatch({ type: 'REMOVE_ITEM', payload: index });
  const updateQuantity = (index, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const totalPrice = state.items.reduce(
    (acc, item) => acc + (item.price * item.quantity),
    0
  );

  const totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);