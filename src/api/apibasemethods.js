import axios from "axios";
import { APP_API } from "src/config-global";

const apiHandle = axios.create({
  baseURL: APP_API,
});

const Get = (endPoint) => apiHandle.get(endPoint);

const GetById = (endPoint, id) => apiHandle.get(`${endPoint}/${id}`);

const Post = (endPoint, body) =>  apiHandle.post(endPoint, body);

const Put = (endPoint, body) => apiHandle.put(endPoint, body);

const Delete = (endPoint) => apiHandle.delete(endPoint);


export { Get, Put, Post, Delete, GetById };


// import axios from 'axios';
// import { APP_API } from 'src/config-global';

// // Create an Axios instance
// const apiHandle = axios.create({
//   baseURL: APP_API,
// });

// // Attach Authorization token to every request
// apiHandle.interceptors.request.use(
//   (config) => {
//     const data = localStorage.getItem('UserData'); // Retrieve JWT token
//     console.log('userData', data);

//     if (data) {
//       try {
//         const parsedData = JSON.parse(data); // Parse JSON string
//         const token = parsedData?.token; // Extract token safely
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//       } catch (error) {
//         console.error('Error parsing UserData from localStorage:', error);
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Handle token expiration (optional, based on API response)
// apiHandle.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.log('Unauthorized! Token might be expired.');
//       // Optionally handle logout or token refresh here
//     }
//     return Promise.reject(error);
//   }
// );

// // API Methods
// const Get = (endPoint) => apiHandle.get(endPoint);
// const GetById = (endPoint, id) => apiHandle.get(`${endPoint}/${id}`);
// const Post = (endPoint, body) => apiHandle.post(endPoint, body);
// const Put = (endPoint, body) => apiHandle.put(endPoint, body);
// const Delete = (endPoint) => apiHandle.delete(endPoint);

// export { Get, Put, Post, Delete, GetById };
