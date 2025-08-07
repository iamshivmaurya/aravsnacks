import Banner from "@/components/Banner";

export default function Home() {
  return (
    <div>
      <Banner />
      <section className="text-center mt-10">
        <h1 className="text-4xl font-bold">Welcome to Arav Snacks</h1>
        <p className="mt-4 text-gray-600">Fresh snacks delivered to your doorstep.</p>
      </section>
    </div>
  );
}
