// src/app/(frontend)/layout.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      <main>{children}</main>
      <Footer />
    </CartProvider>
  );
}
