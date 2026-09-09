import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api` 
    : 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para agregar el token a TODAS las peticiones
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

export default api;