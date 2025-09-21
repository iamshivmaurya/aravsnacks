'use client';

import api from "@/utils/axios";
import { toast } from 'react-hot-toast';
import { GET_QUOTES_API, CREATE_QUOTES_API , API_BASE_URL} from '../constants';
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
  quote_id: number;
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
  const [quoteId, setQuoteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);

  // Clear local cart state
  const clearCart = useCallback(() => setCartItems([]), []);

  // ----------------- Create Cart -----------------
  const createCart = useCallback(async () => {
    try {
      const response = await api.post(CREATE_QUOTES_API);
      const newQuoteId = response.data.quote_id;
      localStorage.setItem('quote_id', String(newQuoteId));
      setQuoteId(newQuoteId);
      return newQuoteId;
    } catch (err) {
      console.error('Failed to create cart:', err);
      toast.error('Could not create cart');
      return null;
    }
  }, []);

// ----------------- Load Cart Items -----------------
const loadCartItems = useCallback(async () => {
  if (!quoteId) {
    setCartItems([]);
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    const response = await axios.get(`${GET_QUOTES_API}/${quoteId}`);

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
      localStorage.removeItem("quote_id");
      setQuoteId(null);
      setLoading(false);
    }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        console.warn("Cart not found (404). Resetting cart.");
        clearCart();
        localStorage.removeItem("quote_id");
        setQuoteId(null);
      } else {
        console.error("Failed to load cart:", err.message);
      }
    } else {
      console.error("Unexpected error:", err);
    }
  } finally {
    setLoading(false);
  }
}, [quoteId, clearCart]);


  // ----------------- Qty Updates -----------------
  const updateQty = useCallback(
    async (itemId: number, qty: number) => {
      setCartItems((prev) =>
        prev.map((item) =>
          item.item_id === itemId ? { ...item, item_qty: qty } : item
        )
      );

      try {
        if (!quoteId) return;
        const url = `${GET_QUOTES_API}/${quoteId}/items/${itemId}/quantity`;
        const response = await axios.put(url, { item_qty: qty });

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
    [quoteId, loadCartItems]
  );

  const increaseQty = (itemId: number, qty: number) => updateQty(itemId, qty);
  const decreaseQty = (itemId: number, qty: number) => updateQty(itemId, qty);

  // ----------------- Cart Actions -----------------
  const removeFromCart = useCallback((itemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.item_id !== itemId));
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      try {
        let activeQuoteId = quoteId;

        // ✅ Create cart only when needed
        if (!activeQuoteId) {
          const newId = await createCart();
          if (!newId) return;
          activeQuoteId = newId;
          setQuoteId(newId);
        }

        const payload = {
          product_id: product.id,
          item_qty: 1,
          item_id: null,
        };
        const url = `${GET_QUOTES_API}/${activeQuoteId}/add_items`;

        const response = await axios.post(url, payload);

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
    [quoteId, createCart, loadCartItems]
  );

  // ----------------- Effects -----------------
  useEffect(() => {
    const savedQuoteId = localStorage.getItem('quote_id');
    if (savedQuoteId) {
      setQuoteId(Number(savedQuoteId));
    }
    // ❌ no auto createCart() here
  }, []);

  useEffect(() => {
    if (quoteId) {
      loadCartItems();
    }
  }, [quoteId, loadCartItems]);

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
