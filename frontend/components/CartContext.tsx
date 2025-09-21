'use client';

import api from "@/utils/axios";
import { toast } from 'react-hot-toast';
import { GET_QUOTES_API, CREATE_QUOTES_API } from '../constants';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';

// ================== Types ==================
export type Product = {
  id: number;
  name: string;
  description: string;
  product_price: number;
  image_url: string;
};

export type CartItem = {
  item_id: number;
  product_id: number;
  item_qty: number;
  item_price: number;
  name: string;
  image_url: string;
  item_name: string;
};

export type Quote = {
  quote_uid: number;
  coupon_code: string;
  subtotal: number;
};


// Context type
type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  increaseQty: (itemId: number, qty: number) => Promise<void>;
  decreaseQty: (itemId: number, qty: number) => Promise<void>;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  cartTotal: number;
  loading: boolean;
  quote: Quote | null
};

// ================== Context ==================
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [quoteUid, setQuoteUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);

  // Clear local cart state
  const clearCart = useCallback(() => setCartItems([]), []);

  // ----------------- Create Cart -----------------
  const createCart = useCallback(async () => {
    try {
      const response = await api.post(CREATE_QUOTES_API);
      const newQuoteId = response.data.quote_uid;
      localStorage.setItem('quote_uid', String(newQuoteId));
      setQuoteUid(newQuoteId);
      return newQuoteId;
    } catch (err) {
      console.error('Failed to create cart:', err);
      toast.error('Could not create cart');
      return null;
    }
  }, []);

// ----------------- Load Cart Items -----------------
const loadCartItems = useCallback(async () => {
  if (!quoteUid) {
    setCartItems([]);
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    const response = await api.get(`${GET_QUOTES_API}/${quoteUid}`);

    if (response.data?.is_active && Array.isArray(response.data.items)) {
      if(response.data.items.length > 0){
          setCartItems(response.data.items);
          setQuote(response.data);
        }else{
          setCartItems([]);
        }
    } else {
      // Cart is not valid, reset
      clearCart();
      localStorage.removeItem("quote_uid");
      setQuoteUid(null);
      setLoading(false);
    }
  } catch (err: any) {
   
      if (err.response?.status === 404) {
        console.warn("Cart not found (404). Resetting cart.");
        clearCart();
        localStorage.removeItem("quote_uid");
        setQuoteUid(null);
      } else {
        console.error("Failed to load cart:", err.message);
      }
   
  } finally {
    setLoading(false);
  }
}, [quoteUid, clearCart]);


  // ----------------- Qty Updates -----------------
  const updateQty = useCallback(
    async (itemId: number, qty: number) => {
      setCartItems((prev) =>
        prev.map((item) =>
          item.item_id === itemId ? { ...item, item_qty: qty } : item
        )
      );

      try {
        if (!quoteUid) return;
        const url = `${GET_QUOTES_API}/${quoteUid}/items/${itemId}/quantity`;
        const response = await api.put(url, { item_qty: qty });

        if (response.status === 200 || response.status === 201) {
          toast.success('Cart updated!');
           await loadCartItems();
        } else {
          toast.error('Failed to update quantity');
        }
      } catch (err) {
        console.error('Failed to update quantity:', err);
        toast.error('Something went wrong');
        await loadCartItems();
      }
    },
    [quoteUid, loadCartItems]
  );

  const increaseQty = (itemId: number, qty: number) => updateQty(itemId, qty);
  const decreaseQty = (itemId: number, qty: number) => updateQty(itemId, qty);

  // ----------------- Cart Actions -----------------
    // Delete handler for quote items
  const removeFromCart = async (itemId: number) => {
    if (!quoteUid) return;

    try {
      await api.delete(`${GET_QUOTES_API}/${quoteUid}/items/${itemId}`);
      setCartItems(prev => prev.filter(item => item.item_id !== itemId));
    } catch (error) {
      console.error("Failed to delete quote item:", error);
      alert("Failed to delete item from quote!");
    }
  };

  const addToCart = useCallback(
    async (product: Product) => {
      try {
        let activeQuoteId = quoteUid;

        // ✅ Create cart only when needed
        if (!activeQuoteId) {
          const newId = await createCart();
          if (!newId) return;
          activeQuoteId = newId;
          setQuoteUid(newId);
        }

        const payload = {
          product_id: product.id,
          item_qty: 1,
          item_id: null,
        };
        const url = `${GET_QUOTES_API}/${activeQuoteId}/add_items`;

        const response = await api.post(url, payload);

        if (response.status === 200 || response.status === 201) {
          toast.success(`${product.name} added to cart!`);
          await loadCartItems();
        } else {
          toast.error('Failed to add product to cart');
        }
      } catch (err) {
        console.error('Error adding product:', err);
        toast.error('Something went wrong!');
      }
    },
    [quoteUid, createCart, loadCartItems]
  );

  // ----------------- Effects -----------------
  useEffect(() => {
    const savedQuoteId = localStorage.getItem('quote_uid');
    if (savedQuoteId) {
      setQuoteUid(savedQuoteId);
    }
    // ❌ no auto createCart() here
  }, []);

  useEffect(() => {
    if (quoteUid) {
      loadCartItems();
    }
  }, [quoteUid, loadCartItems]);

  // ----------------- Derived Values -----------------
  const cartTotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.item_price * item.item_qty, 0),
    [cartItems]
  );

  // ----------------- Provider -----------------
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        cartTotal,
        loading,
        quote
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ================== Hook ==================
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
