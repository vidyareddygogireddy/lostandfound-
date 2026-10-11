import axios from 'axios';

// Dynamic API base URL: defaults to relative '/api' for proxy/production or environment override
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper for constructing image URLs in dev, staging, or production
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const serverUrl = import.meta.env.VITE_SERVER_URL || '';
  return `${serverUrl}${path}`;
};

export default api;
