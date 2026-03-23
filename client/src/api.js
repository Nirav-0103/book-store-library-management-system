import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lib_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginAPI = (data) => API.post('/auth/login', data);
export const registerAPI = (data) => API.post('/auth/register', data);
export const getMeAPI = () => API.get('/auth/me');
export const updateProfileAPI = (data) => API.put('/auth/profile', data);
export const changePasswordAPI = (data) => API.put('/auth/change-password', data);

// Users (Admin)
export const getUsersAPI = (params) => API.get('/users', { params });
export const createUserAPI = (data) => API.post('/users', data);
export const updateUserAPI = (id, data) => API.put(`/users/${id}`, data);
export const deleteUserAPI = (id) => API.delete(`/users/${id}`);
export const toggleUserAPI = (id) => API.put(`/users/${id}/toggle`);

// Books
export const getBooksAPI = (params) => API.get('/books', { params });
export const getBookAPI = (id) => API.get(`/books/${id}`);
export const createBookAPI = (data) => API.post('/books', data);
export const updateBookAPI = (id, data) => API.put(`/books/${id}`, data);
export const deleteBookAPI = (id) => API.delete(`/books/${id}`);
export const getCategoryCountsAPI = () => API.get('/books/category-counts');

// Members
export const getMembersAPI = (params) => API.get('/members', { params });
export const createMemberAPI = (data) => API.post('/members', data);
export const updateMemberAPI = (id, data) => API.put(`/members/${id}`, data);
export const deleteMemberAPI = (id) => API.delete(`/members/${id}`);

// Issues
export const getIssuesAPI = (params) => API.get('/issues', { params });
export const createIssueAPI = (data) => API.post('/issues', data);
export const returnBookAPI = (id) => API.put(`/issues/${id}/return`);
export const deleteIssueAPI = (id) => API.delete(`/issues/${id}`);

// Dashboard
export const getDashboardAPI = () => API.get('/dashboard/stats');

// Addresses
export const getSavedAddressesAPI = () => API.get('/auth/addresses');
export const saveAddressAPI = (data) => API.post('/auth/addresses', data);
export const deleteAddressAPI = (idx) => API.delete(`/auth/addresses/${idx}`);

// Orders
export const createOrderAPI = (data) => API.post('/orders', data);
export const getMyOrdersAPI = () => API.get('/orders/my');
export const cancelOrderRequestAPI = (id, reason) => API.put(`/orders/${id}/cancel-request`, { reason });
export const getAdminOrdersAPI = (params) => API.get('/orders/admin/all', { params });
export const updateOrderStatusAPI = (id, data) => API.put(`/orders/admin/${id}/status`, data);
export const getOrderStatsAPI = () => API.get('/orders/admin/stats');

export default API;