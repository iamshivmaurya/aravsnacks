import Providers from "./providers";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "Next.js Admin",
  description: "Admin Dashboard with NextAuth + FastAPI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Toaster position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
