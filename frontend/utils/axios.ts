import axios from "axios"
import { toast } from 'react-hot-toast';

console.log("process.env.NEXT_PUBLIC_API_BASE_URL ", process.env.NEXT_PUBLIC_API_BASE_URL);


const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE_URL });

if (typeof window !== "undefined") {
  const token = localStorage.getItem("access_token");
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Server is not reachable.');
    } else if (error.response.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response.status >= 500) {
      toast.error('Server error, please try again later.');
    }
    return Promise.reject(error);
  }
);

export default api;
