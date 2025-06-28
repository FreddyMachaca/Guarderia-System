import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import RequestManager from '../services/RequestManager';

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

    return () => {
      RequestManager.cancelAllRequests();
    };
  }, []);

  const request = useCallback(async (method, endpoint, data = null, priority = 1) => {
    const requestKey = `${method}-${endpoint}-${JSON.stringify(data)}`;
    
    return RequestManager.makeRequest(requestKey, async (signal) => {
      setLoading(true);
      setError(null);
      
      try {
        const config = {
          method,
          url: endpoint,
          signal,
          ...(data && { data }),
        };
        
        const response = await axiosInstance(config);
        setLoading(false);
        return response.data;
      } catch (err) {
        setLoading(false);
        
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          throw err;
        }
        
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        
        if (err.response && err.response.status === 422) {
          return {
            success: false,
            ...err.response.data,
            message: err.response.data.message || 'Error de validación'
          };
        }
        
        if (err.response && err.response.status === 500) {
          return {
            success: false,
            data: null,
            message: 'Error interno del servidor'
          };
        }
        
        throw err;
      }
    }, priority);
  }, []);

  const get = useCallback((endpoint, priority = 1) => request('GET', endpoint, null, priority), [request]);
  const post = useCallback((endpoint, data, priority = 1) => request('POST', endpoint, data, priority), [request]);
  const put = useCallback((endpoint, data, priority = 1) => request('PUT', endpoint, data, priority), [request]);
  const del = useCallback((endpoint, priority = 1) => request('DELETE', endpoint, null, priority), [request]);

  const login = useCallback(async (credentials, userType) => {
    try {
      const response = await post(`/auth/login/${userType}`, credentials, 10);
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
      await post('/auth/logout', null, 10);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      RequestManager.cancelAllRequests();
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

  const postFile = useCallback(async (endpoint, formData, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const storedToken = localStorage.getItem(`${STORAGE_KEY}_token`);
      
      const response = await fetch(`${API_PATH}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          ...options.headers
        },
        body: formData
      });

      const result = await response.json();
      setLoading(false);
      
      if (!response.ok) {
        setError(result.message || 'Error en la petición');
        return result;
      }
      
      return result;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      throw error;
    }
  }, []);

  return {
    user,
    loading,
    error,
    get,
    post,
    put,
    del,
    postFile,
    login,
    logout,
    getCurrentUser,
    getCurrentUserId,
    isAuthenticated,
    setError
  };
};