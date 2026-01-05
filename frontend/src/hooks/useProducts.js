import { useState, useEffect, useCallback } from 'react';
import { getProducts, getProduct, getBrands, getCategories } from '../services/api';

/**
 * Custom hook for managing products, brands, and categories data
 * @returns {Object} - Hook state and functions
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch products with optional filters
   * @param {Object} filters - Filter parameters
   */
  const fetchProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getProducts(filters);
      
      if (response.success) {
        setProducts(response.data?.products || []);
      } else {
        setError(response.error || 'Failed to fetch products');
        setProducts([]);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a single product by ID
   * @param {string} id - Product ID
   */
  const fetchProduct = useCallback(async (id) => {
    if (!id) {
      setError('Product ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await getProduct(id);
      
      if (response.success) {
        setProduct(response.data);
      } else {
        setError(response.error || 'Failed to fetch product');
        setProduct(null);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all brands
   */
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getBrands();
      
      if (response.success) {
        setBrands(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch brands');
        setBrands([]);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all categories
   */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getCategories();
      
      if (response.success) {
        setCategories(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch categories');
        setCategories([]);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    products,
    product,
    brands,
    categories,
    loading,
    error,
    
    // Functions
    fetchProducts,
    fetchProduct,
    fetchBrands,
    fetchCategories,
  };
}

