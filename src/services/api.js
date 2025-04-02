import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized, logout user
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('username');
      window.location.reload(); // Force reload to logout
    }
    return Promise.reject(error);
  }
);

// Product API methods
const productAPI = {
  // Get all products
  getAll: () => api.get('/productos'),
  
  // Get active products
  getActive: () => api.get('/productos/activos'),
  
  // Get inactive products
  getInactive: () => api.get('/productos/inactivos'),
  
  // Get a specific product
  getById: (id) => api.get(`/productos/${id}`),
  
  // Create a new product
  create: (productData) => api.post('/productos', productData),
  
  // Update a product
  update: (id, productData) => api.put(`/productos/${id}`, productData),
  
  // Add inventory (entrada)
  addInventory: (inventarioDTO) => api.post('/productos/entrada', inventarioDTO),
  
  // Remove inventory (salida)
  removeInventory: (inventarioDTO) => api.post('/productos/salida', inventarioDTO),
  
  // Activate a product
  activate: (id) => api.put(`/productos/${id}/activar`),
  
  // Deactivate a product
  deactivate: (id) => api.put(`/productos/${id}/baja`),
};

// History API methods
const historyAPI = {
  // Get all movement history
  getAll: () => api.get('/historial'),
  
  // Get movements by type (ENTRADA or SALIDA)
  getByType: (type) => api.get(`/historial/tipo/${type}`),
  
  // Register a new movement manually (normally done through product endpoints)
  create: (movementData) => api.post('/historial', movementData)
};

export { productAPI, historyAPI };
export default api;
