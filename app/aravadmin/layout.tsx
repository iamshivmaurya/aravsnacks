export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {/* 🔹 Admin ke liye no frontend navbar */}
        {children}
      </body>
    </html>
  );
}
