'use client';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { GET_QUOTES_API, CREATE_QUOTES_API } from '../constants';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export type Product = {
  id: number;
  product_name: string;
  description: string;
  product_price: number;
  image_url: string;
};

export type CartItem = Product & { quantity: number };

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  increaseQty: (id: number ,qty: number) => void;
  decreaseQty: (id: number,qty: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  cartTotal: number;   // ✅ Added
};
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const clearCart = () => setCartItems([]);

  const increaseQty = async (id: number ,qty: number) => {
    let quoteId = localStorage.getItem('quote_id');  
    const addItemUrl = `${GET_QUOTES_API}/${quoteId}/items/${id}/quantity`;
    const payload = { item_qty: qty };

    const response = await axios.put(addItemUrl, payload);
    if (response.status === 200 || response.status === 201) {
      toast.success('Product updated!');
      laodCartItems();
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      toast.error('Failed to increaseQty');
    }
  };

  const decreaseQty = async (id: number ,qty: number) => {
    let quoteId = localStorage.getItem('quote_id');  
    const addItemUrl = `${GET_QUOTES_API}/${quoteId}/items/${id}/quantity`;
    const payload = { item_qty: qty };

    const response = await axios.put(addItemUrl, payload);
    if (response.status === 200 || response.status === 201) {
      toast.success('Product updated!');
      laodCartItems();
      setCartItems((prev) =>
        prev
          .map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
          )
          .filter((item) => item.quantity > 0)
      );
    } else {
      toast.error('Failed to decreaseQty');
    }  
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const createCart = async () => {
    let quoteId = localStorage.getItem('quote_id');
    if (!quoteId || quoteId === 'undefined') {
      const response = await axios.post(CREATE_QUOTES_API);
      quoteId = response.data.quote_id;
      localStorage.setItem('quote_id', quoteId);
    }
  };

  const laodCartItems = async () => {
    createCart();
    let quoteId = localStorage.getItem('quote_id');
    const quote = `${GET_QUOTES_API}/${quoteId}`;
    const response = await axios.get(quote);
    try {
      if(response.data && response.data.items){
        if (Array.isArray(response.data.items)) {
          setCartItems(response.data.items);
        }
      }
    } catch (err) {
      console.error('Failed to parse cart:', err);
    }
  };

  useEffect(() => {
    laodCartItems();
  }, []);

  const addToCart = (product: Product) => {
    console.log("Add to cart cart");
  };

  // ✅ Calculate total dynamically
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + (item.item_price * item.item_qty),
    0
  );

  return (
    <CartContext.Provider 
      value={{ cartItems, addToCart, increaseQty, decreaseQty, removeFromCart , clearCart, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
