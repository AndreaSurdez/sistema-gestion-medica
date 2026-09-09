import axios from 'axios';

const api = axios.create({
  // Si existe la variable de entorno, le agrega '/api' al final. Si no, usa localhost.
  baseURL: process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api` 
    : 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

export default api;