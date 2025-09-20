// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CartProvider } from '../components/CartContext';
import { Toaster } from 'react-hot-toast';
import MaintenancePage from '../components/MaintenancePage';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Grocery Store',
  description: 'Buy groceries online!',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Await cookies before reading them
  const cookieStore = await cookies();
  const maintenanceMode = cookieStore.get('maintenanceMode')?.value  === 'true' ? true : false;

  console.log("maintenanceMode ==> ", maintenanceMode);

  return (
    <html lang="en">
      <body className="bg-gray-100">
        <CartProvider>
          <Toaster position="top-right" />
          {maintenanceMode ? (
            <MaintenancePage />
          ) : (
            <>
              <div className="top-0 left-0 w-full z-50">
                <Navbar />
              </div>
              <main className="min-h-[80vh]">{children}</main>
              <Footer />
            </>
          )}
        </CartProvider>
      </body>
    </html>
  );
}
