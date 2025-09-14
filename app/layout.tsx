import './globals.css';
import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
        <div className="top-0 left-0 w-full z-50">
            <Navbar />
          </div>
          <Toaster position="top-right" />
         <main className=" ">{children}</main>
        </CartProvider>
        <Footer />
      </body>
    </html>
  );
}
