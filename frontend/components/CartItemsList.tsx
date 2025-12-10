'use client';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from './CartContext';

interface CartItemsListProps {
  onCheckout: () => void;
}

export default function CartItemsList() {
  const { cartItems, increaseQty, decreaseQty, removeFromCart, loading , cartTotal} = useCart();

  if (loading) {
    return <p className="text-gray-600">Loading your quote items...</p>;
  }

  if (cartItems.length === 0) {
    return <p className="text-gray-600">Your cart is empty.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="text-right font-bold text-x mt-4">
        Subtotal: ₹{cartTotal}
      </div>
      {cartItems.map(item => (
        <div
          key={item.item_id}
          className="p-4 rounded shadow flex justify-between items-center"
        >
          
          <div>
            <h2 className="font-semibold">{item.item_name}</h2>
            {/* <p>₹{item.price} × {item.quantity}</p> */}

            <div className="flex items-center gap-2 mt-2">
             
                <>
                  <button
                    onClick={() => decreaseQty(item.item_id,item.item_qty-1)}
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300">
                    <Minus size={16} />
                  </button>
                  <span className="px-2">{item.item_qty}</span>
                  <button
                    onClick={() => increaseQty(item.item_id,item.item_qty+1)}
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Plus size={16} />
                  </button>
                </>
               
              <button
                onClick={() => removeFromCart(item.item_id) }
                className="ml-4 p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <p className="font-bold text-right">
            ₹{item.item_price * item.item_qty}
          </p>
        </div>
      ))}
    </div>
  );
}
