'use client';

import { useEffect, useState } from 'react';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
};

type Order = {
  id: number;
  date: string;
  items: (Product & { quantity: number })[];
  total: number;
};

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(storedOrders);
  }, []);

  return (
    <section className="mt-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">You have no past orders.</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500 mb-2">
                Order Date: {new Date(order.date).toLocaleString()}
              </p>
              <ul className="space-y-2">
                {order.items.map(item => (
                  <li key={item.id} className="flex justify-between items-center border-b pb-1">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold">₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="text-right mt-2 font-bold text-lg">
                Total: ₹{order.total}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
