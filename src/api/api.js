import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/Auth/login', data),
  register: (data) => api.post('/Auth/register', data),
};

// Products
export const productAPI = {
  getAll: () => api.get('/Products'),
  getById: (id) => api.get(`/Products/${id}`),
  create: (data) => api.post('/Products', data),
  update: (id, data) => api.put(`/Products/${id}`, data),
  delete: (id) => api.delete(`/Products/${id}`),
};

// Cart
export const cartAPI = {
  get: () => api.get('/Cart'),
  add: (data) => api.post('/Cart', data),
  update: (id, data) => api.put(`/Cart/${id}`, data),
  remove: (id) => api.delete(`/Cart/${id}`),
  clear: () => api.delete('/Cart/clear'),
};

// Orders
export const orderAPI = {
  create: () => api.post('/Orders'),
  getMy: () => api.get('/Orders/my'),
  getAll: () => api.get('/Orders'),
  getById: (id) => api.get(`/Orders/${id}`),
  updateStatus: (id, status) => api.put(`/Orders/${id}/status`, { status }),
};

// Payments
export const paymentAPI = {
  create: (orderId) => api.post(`/Payments/${orderId}`),
  getByOrder: (orderId) => api.get(`/Payments/order/${orderId}`),
  markPaid: (id) => api.put(`/Payments/${id}/pay`),
};

export default api;
