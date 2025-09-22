import './globals.css';
import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CartProvider } from '../components/CartContext';
import { AuthProvider } from '../components/AuthContext';
import { Toaster } from 'react-hot-toast';
import MaintenancePage from '../components/MaintenancePage';
import { cookies } from 'next/headers';
import api from "@/utils/axios";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await api.get(`/admin/settings`);
    const { metaTitle, metaDescription } = res.data;
    return {
      title: metaTitle || 'Grocery Store',
      description: metaDescription || 'Buy groceries online!',
    };
  } catch (err) {
    console.error('Failed to fetch metadata:', err);
    return {
      title: 'Grocery Store',
      description: 'Buy groceries online!',
    };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const maintenanceMode = cookieStore.get('maintenanceMode')?.value === 'true';
  const metadata = await generateMetadata();

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className="bg-gray-100">
        {/* Wrap AuthProvider first so that CartProvider can use useAuth */}
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" />
            {maintenanceMode ? (
              <MaintenancePage />
            ) : (
              <>
                <header className="top-0 left-0 w-full z-50">
                  <Navbar />
                </header>
                <main className="min-h-[80vh]">{children}</main>
                <Footer />
              </>
            )}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
