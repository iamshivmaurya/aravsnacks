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
  const orderId = searchParams.get("orderId");

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch customer info
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
        console.warn("Profile load failed", err);
      }
    };
    fetchProfile();
  }, []);

  // Fetch order by ID
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;

      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await api.get(`/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const order = res.data;

        if (order?.items) {
          setOrderItems(order.items);
        }
      } catch (err) {
        console.error("Order fetch failed", err);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleSubmit = async () => {
    if (!selectedItemId) {
      setErrorMsg("⚠️ Please select a product.");
      return;
    }
    if (!rating || !comment) {
      setErrorMsg("⚠️ Rating and comment are required.");
      return;
    }

    // Find selected order item
  const selectedItem = orderItems.find(
    (i) => i.order_item_id === selectedItemId
  );

  if (!selectedItem) {
    setErrorMsg("❌ Selected product not found.");
    return;
  }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const token = localStorage.getItem("access_token");


      
      

      const payload = {
        order_item_id: selectedItemId,
        product_id: selectedItem.product_id,   // ✅ Required field added
        customer_id: customerId,
        rating,
        comment,
      };

      await api.post("/reviews", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setSuccessMsg("✅ Review submitted successfully!");
      setRating(0);
      setComment("");
    } catch (error: any) {
      let msg = "❌ Failed to submit review.";

      // Convert object error into string
      if (typeof error.response?.data === "object") {
        msg = JSON.stringify(error.response.data);
      }

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
        className="w-full max-w-xl"
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

            {/* PRODUCT LIST LIKE ORDER DETAILS */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Select Product
              </h3>

              {orderItems.length === 0 && (
                <p className="text-sm text-gray-500">
                  No products found in this order.
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderItems.map((item) => (
                  <div
                    key={item.order_item_id}
                    onClick={() => setSelectedItemId(item.order_item_id)}
                    className={`cursor-pointer border rounded-xl p-3 shadow-sm hover:shadow-md transition ${
                      selectedItemId === item.order_item_id
                        ? "border-yellow-500 shadow-yellow-300"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="w-full h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400 text-sm">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          "No Image"
                        )}
                      </p>
                    </div>

                    <p className="font-semibold mt-2">{item.product_name}</p>
                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-600">
                      Price: ₹{item.unit_price}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="flex justify-center gap-2 mt-4">
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

            {/* Comment */}
            <Textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="text-lg"
            />

            {/* Submit */}
            <Button
              disabled={loading}
              onClick={handleSubmit}
              className="w-full h-12 text-lg rounded-xl flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600"
            >
              {loading && <Loader2 className="animate-spin w-5 h-5" />}
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
