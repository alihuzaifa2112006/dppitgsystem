import axios from "axios";
import { APP_API } from "src/config-global";

// Create an Axios instance
const apiHandle = axios.create({
  baseURL: APP_API,
});

// ✅ Attach Authorization token to every request
apiHandle.interceptors.request.use(
  (config) => {
    try {
      // Get token from UserData
      const userData = localStorage.getItem('UserData');
      console.log('🔍 UserData from localStorage:', userData ? 'Found' : 'Not found');

      if (userData) {
        const parsedData = JSON.parse(userData);
        // Extract token from Data.token path
        const token = parsedData?.Data?.token;
        console.log('🔑 Token extracted:', token ? 'Token found' : 'No token');

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Authorization header set');
        } else {
          console.warn('⚠️ No token found in UserData');
        }
      } else {
        console.warn('⚠️ No UserData found in localStorage');
      }
    } catch (error) {
      console.error('❌ Error parsing UserData from localStorage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
apiHandle.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔴 Unauthorized! Token might be expired.');
      // Optionally handle logout or token refresh here
    }
    return Promise.reject(error);
  }
);

// API Methods
const Get = (endPoint) => apiHandle.get(endPoint);
const GetById = (endPoint, id) => apiHandle.get(`${endPoint}/${id}`);
const Post = (endPoint, body) => apiHandle.post(endPoint, body);
const Put = (endPoint, body) => apiHandle.put(endPoint, body);
const Delete = (endPoint) => apiHandle.delete(endPoint);

export { Get, Put, Post, Delete, GetById };