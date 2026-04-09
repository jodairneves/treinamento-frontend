import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — padroniza erros
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Erro de rede / backend offline
    if (!error.response) {
      return Promise.reject(
        new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
      );
    }

    // 401 — limpa auth e redireciona
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/registro')) {
        window.location.href = '/';
      }
    }

    const message =
      error.response.data?.error ||
      error.response.data?.message ||
      error.message ||
      'Erro inesperado. Tente novamente.';

    return Promise.reject(new Error(message));
  }
);

export default api;
