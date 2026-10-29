import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if 401 and we aren't already on /login or /register
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
