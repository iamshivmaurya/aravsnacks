import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "Next.js Admin",
  description: "Admin Dashboard with NextAuth + FastAPI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
