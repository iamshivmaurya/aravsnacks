'use client';
import { useState } from "react";
import { useCart } from '../components/CartContext';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import SignUpModal from "@/components/SignUpModal";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();


  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false); // Track user signup

  const addProductToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };



  // const handleAddToCart = () => {
  //   addToCart(product);
  //   toast.success(`${product.name} added to cart!`);
  // };

  const handleAddToCartClick = () => {
    if (isSignedUp) {
      // Already signed up → directly add to cart
      addProductToCart();
    } else {
      // Not signed up → show signup modal
      setIsSignUpOpen(true);
    }
  };


  const handleSignUpSuccess = () => {
    setIsSignedUp(true); // Mark as signed up
    setIsSignUpOpen(false); // Close modal
    addProductToCart(); // Now add to cart
  };

 
  return (
    <div className="bg-white border rounded-lg shadow p-4 flex flex-col">
      <div className="w-full h-40 relative">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover rounded"
        />
      </div>
      <h2 className="text-lg font-bold mt-2">{product.name}</h2>
      <p className="text-sm text-gray-600">{product.description}</p>
      <p className="font-semibold mt-1">₹{product.price}</p>
      <button
         onClick={handleAddToCartClick}
        className="bg-green-600 text-white px-4 py-1 rounded mt-2 hover:bg-green-700"
      >
        Add to Cart
      </button>

          {/* SignUp Modal */}
            <SignUpModal
              isOpen={isSignUpOpen}
              onClose={() => setIsSignUpOpen(false)}
              onSuccess={handleSignUpSuccess} // Signup successful
            />

    
    </div>
  );
}
