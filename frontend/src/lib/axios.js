import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    `${import.meta.env.VITE_BASE_URL}/api` || "http://localhost:4000/api/v1",
  withCredentials: true,
});

export default axiosInstance;
