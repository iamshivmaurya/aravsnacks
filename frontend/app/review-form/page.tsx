"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/utils/axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";

export default function ReviewFormPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const [customerId, setCustomerId] = useState<number | null>(null);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ✅ Optionally fetch customer_id from token
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const res = await api.get("/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomerId(res.data.customer_id);
      } catch (err) {
        console.warn("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || !comment) {
      setErrorMsg("⚠️ Please provide both rating and comment.");
      setSuccessMsg("");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const token = localStorage.getItem("access_token");

      const payload = {
        product_id: Number(productId),
        customer_id: customerId,
        rating,
        comment,
      };

      console.log("📤 Sending review:", payload);

      const response = await api.post("/reviews", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setSuccessMsg("✅ Review submitted successfully!");
      setRating(0);
      setComment("");
    } catch (error: any) {
      console.error("Review submission failed:", error);
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "❌ Failed to submit review.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Write a Review
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ⭐ Rating */}
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => {
                  const value = i + 1;
                  return (
                    <Star
                      key={value}
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHover(value)}
                      onMouseLeave={() => setHover(0)}
                      className={`w-8 h-8 cursor-pointer transition ${
                        value <= (hover || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  );
                })}
              </div>

              {/* ✍️ Comment Textarea */}
              <Textarea
                placeholder="Write your review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="text-lg"
              />

              {/* 🚀 Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-lg rounded-xl flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600"
              >
                {loading && <Loader2 className="animate-spin w-5 h-5" />}
                {loading ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
