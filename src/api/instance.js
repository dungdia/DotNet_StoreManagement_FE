import axios from "axios";
import Cookies from "js-cookie";
const token = Cookies.get("accessToken");

const baseUrl = axios.create({
  baseURL: `${process.env.VITE_APP_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

baseUrl.interceptors.request.use(
  (config) => {
    const accessToken = `Bearer ${token}`;
    config.headers.Authorization = accessToken;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default baseUrl;
