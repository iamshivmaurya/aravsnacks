'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from './CartContext';
import api from "@/utils/axios";
import {API_BASE_URL, GET_QUOTES_API} from  "../constants"

interface QuoteItem {
  item_id: number;
  item_name: string;
  item_price: number;
  item_qty: number;
}

interface CartItemsListProps {
  onCheckout: () => void;
}

export default function CartItemsList() {
  const { cartItems, increaseQty, decreaseQty, removeFromCart } = useCart();

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [totalTax, setTotalTax] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);

  useEffect(() => {
    const storedQuoteId = localStorage.getItem('quote_id');
    setQuoteId(storedQuoteId);

    if (!storedQuoteId) {
      setLoading(false);
      return;
    }
    
    async function fetchQuote() {
      try {
        const response = await axios.get(`${GET_QUOTES_API}/${storedQuoteId}`);
        setQuoteItems(response.data.items || []);
        setGrandTotal(response.data.grand_total || 0);
        setSubtotal(response.data.subtotal || 0);
        setTotalDiscount(response.data.discount || 0);
        setTotalTax(response.data.total_tax || 0);
      } catch (error) {
        console.error("Failed to fetch quote items:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuote();
  }, [cartItems]);

  // Delete handler for quote items
  const handleDeleteQuoteItem = async (itemId: number) => {
    if (!quoteId) return;

    try {
      await api.delete(`${GET_QUOTES_API}/${quoteId}/items/${itemId}`);
      setQuoteItems(prev => prev.filter(item => item.item_id !== itemId));
    } catch (error) {
      console.error("Failed to delete quote item:", error);
      alert("Failed to delete item from quote!");
    }
  };

  // Select which items to display
  const isQuoteMode = quoteItems.length > 0;
  const itemsToShow = isQuoteMode
    ? quoteItems.map(item => ({
        id: item.item_id,
        name: item.item_name,
        price: item.item_price,
        quantity: item.item_qty,
        isQuote: true,
      }))
    : cartItems.map(item => ({
        id: item.item_id,
        name: item.name,
        price: item.item_price,
        quantity: item.item_qty,
        isQuote: false,
      }));


  if (loading) {
    return <p className="text-gray-600">Loading your quote items...</p>;
  }

  if (itemsToShow.length === 0) {
    return null; // avoid rendering UI before redirect
  }

  return (
    <div className="space-y-4">
      {itemsToShow.map(item => (
        <div
          key={item.id}
          className="bg-white p-4 rounded shadow flex justify-between items-center"
        >
          <div>
            <h2 className="font-semibold">{item.name}</h2>
            {/* <p>₹{item.price} × {item.quantity}</p> */}

            <div className="flex items-center gap-2 mt-2">
             
                <>
                  <button
                    onClick={() => decreaseQty(item.id,item.quantity-1)}
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300">
                    <Minus size={16} />
                  </button>
                  <span className="px-2">{item.quantity}</span>
                  <button
                    onClick={() => increaseQty(item.id,item.quantity+1)}
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Plus size={16} />
                  </button>
                </>
               
              <button
                onClick={() =>
                  item.isQuote
                    ? handleDeleteQuoteItem(item.id)
                    : removeFromCart(item.id)
                }
                className="ml-4 p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <p className="font-bold text-right">
            ₹{item.price * item.quantity}
          </p>
        </div>
      ))}

      <div className="text-right font-bold text-x mt-4">
        Subtotal: ₹{subtotal}
      </div>
      <div className="text-right font-bold text-x mt-4">
        Discount: ₹{totalDiscount}
      </div>
      <div className="text-right font-bold text-x mt-4">
       Total Tax: ₹{totalTax}
      </div>
      <div className="text-right font-bold text-x mt-4">
        Grand Total: ₹{grandTotal}
      </div>
    </div>
  );
}
