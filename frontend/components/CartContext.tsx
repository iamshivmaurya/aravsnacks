'use client';

import api from "@/utils/axios";
import { toast } from 'react-hot-toast';
import { GET_QUOTES_API, CREATE_QUOTES_API } from '../constants';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

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
  quote_uid: string;
  coupon_code?: string;
  subtotal: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  increaseQty: (itemId: number, qty: number) => Promise<void>;
  decreaseQty: (itemId: number, qty: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => void;
  cartTotal: number;
  loading: boolean;
  quote: Quote | null;
  loadActiveQuote: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [quoteUid, setQuoteUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);

  // ----------------- Clear Cart -----------------
  const clearCart = useCallback(() => {
    setCartItems([]);
    setQuote(null);
    setQuoteUid(null);
    localStorage.removeItem('quote_uid');
  }, []);

  // ----------------- Load Cart Items -----------------
  const loadCartItemsByQuote = useCallback(async (qid: string) => {
    setLoading(true);
    try {
      const res = await api.get(`${GET_QUOTES_API}/${qid}`);

      if (res.data?.is_active && Array.isArray(res.data.items)) {
        setCartItems(res.data.items);
        setQuote({
          quote_uid: qid,
          subtotal: res.data.items.reduce((acc, item: CartItem) => acc + item.item_price * item.item_qty, 0),
          coupon_code: res.data.coupon_code
        });
      } else {
        clearCart();
      }
    } catch (err) {
      console.error('Failed to load cart items:', err);
      clearCart();
    } finally {
      setLoading(false);
    }
  }, [clearCart]);

  // ----------------- Load Active Quote -----------------
  const loadActiveQuote = useCallback(async () => {
    try {
      let qid = localStorage.getItem('quote_uid');

      // If user is logged in, fetch their active quote
      if (user) {
        const res = await api.get(`/customer/active-quote`);
        if (res.data?.quote_uid) qid = res.data.quote_uid;
      }

      if (qid) {
        localStorage.setItem('quote_uid', qid);
        setQuoteUid(qid);
        await loadCartItemsByQuote(qid);
      } else {
        clearCart();
      }
    } catch (err) {
      console.error('Failed to load active quote:', err);
      clearCart();
    }
  }, [user, loadCartItemsByQuote, clearCart]);

  // ----------------- Create Cart -----------------
  const createCart = useCallback(async (): Promise<string | null> => {
    try {
      const res = await api.post(CREATE_QUOTES_API); // backend should allow guest cart creation
      const newQuoteId = res.data.quote_uid;
      localStorage.setItem('quote_uid', newQuoteId);
      setQuoteUid(newQuoteId);
      return newQuoteId;
    } catch (err) {
      console.error('Failed to create cart:', err);
      toast.error('Could not create cart');
      return null;
    }
  }, []);

  // ----------------- Add to Cart -----------------
  const addToCart = useCallback(async (product: Product) => {
    let activeQuoteId = quoteUid || await createCart();
    if (!activeQuoteId) return;

    try {
      await api.post(`${GET_QUOTES_API}/${activeQuoteId}/add_items`, { product_id: product.id, item_qty: 1, item_id: null });
      toast.success(`${product.name} added to cart`);
      await loadCartItemsByQuote(activeQuoteId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add product');
    }
  }, [quoteUid, createCart, loadCartItemsByQuote]);

  // ----------------- Remove from Cart -----------------
  const removeFromCart = useCallback(async (itemId: number) => {
    if (!quoteUid) return;
    try {
      await api.delete(`${GET_QUOTES_API}/${quoteUid}/items/${itemId}`);
      setCartItems(prev => prev.filter(item => item.item_id !== itemId));
      toast.success("Item removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
    }
  }, [quoteUid]);

  // ----------------- Update Quantity -----------------
  const updateQty = useCallback(async (itemId: number, qty: number) => {
    if (!quoteUid) return;
    setCartItems(prev => prev.map(i => i.item_id === itemId ? { ...i, item_qty: qty } : i));
    try {
      await api.put(`${GET_QUOTES_API}/${quoteUid}/items/${itemId}/quantity`, { item_qty: qty });
      await loadCartItemsByQuote(quoteUid);
      toast.success("Cart updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quantity");
    }
  }, [quoteUid, loadCartItemsByQuote]);

  const increaseQty = (itemId: number, qty: number) => updateQty(itemId, qty);
  const decreaseQty = (itemId: number, qty: number) => updateQty(itemId, qty);

  const cartTotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.item_price * item.item_qty, 0), [cartItems]);

  // ----------------- Load saved quote on mount -----------------
  useEffect(() => {
    const savedQuoteId = localStorage.getItem('quote_uid');
    if (savedQuoteId) setQuoteUid(savedQuoteId);
    loadActiveQuote();

    // Listen for logout and login events
    const handleLogout = () => clearCart();
    const handleLogin = async (e: CustomEvent) => {
      const guestQuoteId = localStorage.getItem('quote_uid');
      if (guestQuoteId && user) {
        // Optional: merge guest cart into user cart
        try {
          await api.post(`/customer/merge-quote`, { guest_quote_uid: guestQuoteId });
        } catch (err) {
          console.error('Failed to merge guest cart', err);
        }
      }
      await loadActiveQuote();
    };

    window.addEventListener('user-logout', handleLogout);
    window.addEventListener('user-login', handleLogin as any);

    return () => {
      window.removeEventListener('user-logout', handleLogout);
      window.removeEventListener('user-login', handleLogin as any);
    };
  }, [loadActiveQuote, clearCart, user]);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      increaseQty,
      decreaseQty,
      removeFromCart,
      clearCart,
      cartTotal,
      loading,
      quote,
      loadActiveQuote
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
