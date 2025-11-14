"use client";

import React, { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* ✅ HEADER SECTION (like About page) */}
      <section className="relative bg-orange-500 text-white py-20 px-6 text-center shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold mb-4 tracking-wide">Contact Us</h1>
          <p className="text-lg text-orange-100 leading-relaxed">
            We’d love to hear from you! Whether you have a question about our snacks,
            need support, or just want to share your thoughts — reach out anytime.
          </p>
        </div>

        {/* Decorative wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-8 text-gray-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
          >
            <path
              fill="currentColor"
              fillOpacity="1"
              d="M0,192L48,165.3C96,139,192,85,288,85.3C384,85,480,139,576,170.7C672,203,768,213,864,197.3C960,181,1056,139,1152,138.7C1248,139,1344,181,1392,202.7L1440,224V320H0Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* ✅ CONTACT SECTION */}
      <section className="flex-grow py-16 px-6">
        <Toaster position="top-right" />
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden grid md:grid-cols-2">
          {/* Left Side - Info */}
          <div className="bg-orange-500 text-white p-10 flex flex-col justify-center space-y-6">
            <h2 className="text-4xl font-extrabold mb-2">Get in Touch</h2>
            <p className="text-gray-100 mb-6">
              Have questions, feedback, or business inquiries? We’d love to hear from you!
            </p>

            <div className="space-y-5 text-gray-100">
              <div className="flex items-center gap-3">
                <Mail size={22} />
                <a href="mailto:support@aravsnacks.com" className="hover:underline">
                  support@aravsnacks.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={22} />
                <p>+91 98765 43210</p>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={22} />
                <p>Ahmedabad, Gujarat, India</p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-10">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">Send Us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Write your message..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                  loading
                    ? "bg-orange-300 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
