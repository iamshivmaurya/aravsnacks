import './globals.css';
import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import { CartProvider } from "../components/CartContext"
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Grocery Store',
  description: 'Buy groceries online!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <CartProvider>
          <Navbar />
          <Toaster position="top-right" />
          <main className="p-4 max-w-7xl mx-auto">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
