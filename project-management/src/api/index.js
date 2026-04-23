import axios from 'axios';

const API = axios.create({
    baseURL: 'https://project-management-1-1.onrender.com/api',
});

// Add a request interceptor to include the JWT token in headers
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
