"use client";
import { useEffect, useState } from "react";
import EditProfileForm from "../../components/EditSignupForm";
import axios from "axios";

export default function ProfilePage() {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("customer_id");
    if (id) {
      setCustomerId(id);

      // API call to fetch customer data
      axios.get(`http://127.0.0.1:8000/customers/${id}`)
        .then(res => {
          setInitialData({
            first_name: res.data.first_name,
            last_name: res.data.last_name,
            email: res.data.email,
            phone: res.data.phone
          });
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!customerId) return <p>Please login first!</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <EditProfileForm customer_id={customerId} initialData={initialData} />
    </div>
  );
}
