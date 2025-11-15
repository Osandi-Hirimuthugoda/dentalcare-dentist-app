// // src/api/API.js

// import axios from "axios";

// //Backend base URL
// const API = axios.create({
//   baseURL: "http://localhost:4000/api",
// });

// //JWT token to all requests automatically
// API.interceptors.request.use((req) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     req.headers.Authorization = `Bearer ${token}`;
//   }
//   return req;
// });

// export default API;
