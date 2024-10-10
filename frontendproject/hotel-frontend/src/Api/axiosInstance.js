import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000", // <-- change this to your backend port if different
  headers: {
    "Content-Type": "application/json",
  }
});

export default axiosInstance;
