/**
 * API service for making HTTP requests to the backend
 */

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Get the auth token from localStorage
 * @returns {string|null}
 */
function getAuthToken() {
  return localStorage.getItem('kbeauty_token');
}

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Récupérer le token d'authentification
    const token = getAuthToken();
    
    // Construire les headers avec le token si présent
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Ajouter le token d'autorisation si disponible
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Build query string from filters object
 * @param {Object} filters - Filter parameters
 * @returns {string} - Query string
 */
function buildQueryString(filters = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get products with optional filters
 */
export async function getProducts(filters = {}) {
  const queryString = buildQueryString(filters);
  return apiRequest(`/api/products${queryString}`);
}

/**
 * Get a single product by ID
 */
export async function getProduct(id) {
  if (!id) {
    return { success: false, error: 'Product ID is required' };
  }
  return apiRequest(`/api/products/${id}`);
}

/**
 * Get all brands with product counts
 */
export async function getBrands() {
  return apiRequest('/api/brands');
}

/**
 * Get all categories with product counts
 */
export async function getCategories() {
  return apiRequest('/api/categories');
}

/**
 * Get API base URL (useful for other components)
 */
export function getApiBaseUrl() {
  return API_BASE_URL;
}

// ============================================
// ADMIN API FUNCTIONS
// ============================================

/**
 * Get admin dashboard stats
 */
export async function getAdminDashboard() {
  return apiRequest('/api/admin/dashboard');
}

/**
 * Get all products (admin)
 */
export async function getAdminProducts() {
  return apiRequest('/api/admin/products');
}

/**
 * Get all orders (admin)
 */
export async function getAdminOrders() {
  return apiRequest('/api/admin/orders');
}

/**
 * Get all clients (admin)
 */
export async function getAdminClients() {
  return apiRequest('/api/admin/clients');
}

/**
 * Update order status (admin)
 */
export async function updateOrderStatus(orderId, status) {
  return apiRequest(`/api/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}