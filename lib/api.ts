// lib/api.ts
import axios from 'axios'; // <--- IMPORTANTE: Importamos la librería real
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const api = axios.create({
  baseURL: API_URL, // Tu URL de Django
});

// INTERCEPTOR DE PETICIÓN: Pega el token a la fuerza
api.interceptors.request.use(
  (config) => {
    // Verificamos que estemos en el navegador antes de usar localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR DE RESPUESTA: Maneja el error 401 (Token vencido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;