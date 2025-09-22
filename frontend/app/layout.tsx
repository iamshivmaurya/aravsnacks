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
import NetworkStatusBanner from '@/components/NetworkStatusBanner';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await api.get(`/admin/settings`);
    const { metaTitle, metaDescription } = res.data;

    return {
      title: metaTitle || 'Grocery Store',
      description: metaDescription || 'Buy groceries online!',
    };
  } catch (err: any) {
    console.error('Failed to fetch metadata:', err.message);

    // Handle specific errors
    if (err.response) {
      if (err.response.status === 404) {
        console.warn('Settings not found, using default metadata.');
      } else if (err.response.status >= 500) {
        console.error('Server error while fetching settings.');
      }
    } else if (err.code === 'ECONNREFUSED') {
      console.error('Backend server is not running.');
    }

    // Fallback default metadata
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
         <NetworkStatusBanner />
        <AuthProvider>
          <CartProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 1000, // 2 seconds
                style: {
                  fontSize: '14px',
                  padding: '12px 16px',
                  background: '#f3f4f6', // Tailwind gray-100
                  color: '#111827',       // Tailwind gray-900
                },
                success: {
                  iconTheme: {
                    primary: '#16a34a', // green
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#dc2626', // red
                    secondary: '#ffffff',
                  },
                },
              }}
            />
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
