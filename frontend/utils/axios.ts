import axios from "axios"

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
  async (error) => {
    if (error.response?.status === 401) {
      console.error("Axios : ", error);
    }
    return Promise.reject(error);
  }
);

export default api;
