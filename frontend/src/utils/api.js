import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

if (baseURL && baseURL.startsWith('http')) {
  const cleanBase = baseURL.replace(/\/$/, '');
  if (!cleanBase.endsWith('/api')) {
    baseURL = `${cleanBase}/api`;
  }
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
