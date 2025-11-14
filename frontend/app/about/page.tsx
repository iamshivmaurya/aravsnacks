import React from "react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Us | Arav Snacks",
  description: "Learn more about Arav Snacks — your trusted source for tasty & healthy snacks.",
};

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-orange-500 text-white py-20 text-center">
        <h1 className="text-5xl font-extrabold mb-4">About Arav Snacks</h1>
        <p className="text-lg max-w-2xl mx-auto text-gray-100">
          Delicious, nutritious, and made with love — discover our story and what makes us special.
        </p>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side Image */}
        <div className="relative w-full h-[400px]">
          <Image
            src="/about.jpg"
            alt="Arav Snacks"
            fill
            className="object-cover rounded-2xl shadow-lg"
          />
        </div>

        {/* Right Side Text */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Our Journey
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Arav Snacks started with a simple idea — to bring healthy and tasty snacks
            to every household. We believe snacking can be both delightful and
            nourishing, without compromising on flavor.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            Each of our products is crafted with care, using high-quality ingredients and
            sustainable processes. From crispy chips to protein-packed bites, our mission
            is to make every snack a reason to smile.
          </p>
          <Link
            href="/products"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            Explore Our Products
          </Link>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our mission is simple — to redefine snacking by combining great taste with
            nutrition. We are committed to using natural ingredients, reducing waste, and
            supporting local farmers who share our passion for quality.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-10">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <Image
                src="/team.jpg"
                alt="Team Member"
                width={200}
                height={200}
                className="mx-auto rounded-full mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800">Arav Patel</h3>
              <p className="text-orange-500 font-medium">Founder & CEO</p>
              <p className="text-gray-600 mt-2 text-sm">
                Passionate about healthy living and great taste, Arav leads our mission with energy and heart.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <Image
                src="/team1.jpg"
                alt="Team Member"
                width={200}
                height={200}
                className="mx-auto rounded-full mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800">Priya Sharma</h3>
              <p className="text-orange-500 font-medium">Head of Operations</p>
              <p className="text-gray-600 mt-2 text-sm">
                Priya ensures every product meets our quality standards — fresh, safe, and delicious.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <Image
                src="/team.jpg"
                alt="Team Member"
                width={200}
                height={200}
                className="mx-auto rounded-full mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800">Rahul Verma</h3>
              <p className="text-orange-500 font-medium">Marketing Lead</p>
              <p className="text-gray-600 mt-2 text-sm">
                Rahul connects our brand with people who love snacks that are both tasty and mindful.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
