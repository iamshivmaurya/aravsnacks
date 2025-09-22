// app/error.tsx
"use client";
export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Something went wrong!</h1>
      <p className="mb-4">{error.message}</p>
      <button onClick={() => reset()} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Retry</button>
    </div>
  );
}
