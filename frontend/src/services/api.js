/**
 * API service for making HTTP requests to the backend
 */

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '' + process.env.REACT_APP_API_URL + '';

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
