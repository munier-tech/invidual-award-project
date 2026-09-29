import axios from "axios";

const envBaseURL = import.meta.env.VITE_REACT_APP_API_URL;
const baseURL = envBaseURL || "/api";

console.debug('[Axios] baseURL:', baseURL, 'NODE_ENV:', import.meta.env.MODE);

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  console.debug('[Axios] Request:', config.method?.toUpperCase(), config.baseURL + config.url, config);
  return config;
}, (error) => {
  console.error('[Axios] Request error:', error);
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use((response) => {
  console.debug('[Axios] Response:', response.status, response.config.url, response.data);
  return response;
}, (error) => {
  console.error('[Axios] Response error:', {
    message: error.message,
    config: error.config,
    response: error.response ? {
      status: error.response.status,
      headers: error.response.headers,
      data: error.response.data,
    } : undefined,
  });
  return Promise.reject(error);
});

export default axiosInstance;