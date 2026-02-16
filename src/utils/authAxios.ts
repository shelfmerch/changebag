import axios from 'axios';

const authAxios = axios.create({
  baseURL: import.meta.env.PROD ? 'https://api.changebag.org' : 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // config.withCredentials = true;
  return config;
});

export default authAxios; 