import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_PATH = process.env.REACT_APP_API_PATH;
const STORAGE_KEY = process.env.REACT_APP_STORAGE_KEY;

const axiosInstance = axios.create({
  baseURL: API_PATH,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(`${STORAGE_KEY}_token`);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && response.data.pagination) {
      return {
        ...response,
        data: {
          data: response.data.data,
          pagination: response.data.pagination,
          success: response.data.success
        }
      };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(`${STORAGE_KEY}_token`);
      localStorage.removeItem(`${STORAGE_KEY}_user`);
      window.location.href = '/portal';
    }
    return Promise.reject(error);
  }
);

export const useApi = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem(`${STORAGE_KEY}_token`);
    const userData = localStorage.getItem(`${STORAGE_KEY}_user`);
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const request = useCallback(async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const config = {
        method,
        url: endpoint,
        ...(data && { data }),
      };
      
      const response = await axiosInstance(config);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.message);
      
      if (err.response && err.response.status === 422) {
        return {
          success: false,
          ...err.response.data,
          message: err.response.data.message || 'Error de validación'
        };
      }
      
      throw err;
    }
  }, []);

  const get = useCallback((endpoint) => request('GET', endpoint), [request]);
  const post = useCallback((endpoint, data) => request('POST', endpoint, data), [request]);
  const put = useCallback((endpoint, data) => request('PUT', endpoint, data), [request]);
  const del = useCallback((endpoint) => request('DELETE', endpoint), [request]);

  const login = useCallback(async (credentials, userType) => {
    try {
      const response = await post(`/auth/login/${userType}`, credentials);
      if (response.token) {
        localStorage.setItem(`${STORAGE_KEY}_token`, response.token);
        localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(response.user));
        setUser(response.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }, [post]);

  const logout = useCallback(async () => {
    try {
      await post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem(`${STORAGE_KEY}_token`);
      localStorage.removeItem(`${STORAGE_KEY}_user`);
      setUser(null);
      window.location.href = '/portal';
    }
  }, [post]);

  const getCurrentUser = useCallback(() => {
    const userData = localStorage.getItem(`${STORAGE_KEY}_user`);
    return userData ? JSON.parse(userData) : null;
  }, []);

  const getCurrentUserId = useCallback(() => {
    const userData = localStorage.getItem(`${STORAGE_KEY}_user`);
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || user.usr_id || user.prs_id || null;
    }
    return null;
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem(`${STORAGE_KEY}_token`);
  }, []);

  return {
    user,
    loading,
    error,
    get,
    post,
    put,
    del,
    login,
    logout,
    getCurrentUser,
    getCurrentUserId,
    isAuthenticated,
    setError
  };
};