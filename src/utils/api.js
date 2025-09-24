const API_BASE_URL = 'http://localhost:3002/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  logout: () => apiRequest('/auth/logout', {
    method: 'POST'
  }),
  
  refreshToken: () => apiRequest('/auth/refresh', {
    method: 'POST'
  }),
  
  getProfile: () => apiRequest('/auth/profile')
};

// Users API calls
export const usersAPI = {
  getAll: () => apiRequest('/users'),
  
  getById: (id) => apiRequest(`/users/${id}`),
  
  create: (userData) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  update: (id, userData) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  
  delete: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE'
  }),
  
  updateStatus: (id, status) => apiRequest(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
};

// Jobs API calls
export const jobsAPI = {
  getAll: () => apiRequest('/jobs'),
  
  getById: (id) => apiRequest(`/jobs/${id}`),
  
  create: (jobData) => apiRequest('/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData)
  }),
  
  update: (id, jobData) => apiRequest(`/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(jobData)
  }),
  
  delete: (id) => apiRequest(`/jobs/${id}`, {
    method: 'DELETE'
  }),
  
  updateStatus: (id, status) => apiRequest(`/jobs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  
  assignTechnician: (id, technicianId) => apiRequest(`/jobs/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ technicianId })
  })
};

// Disputes API calls
export const disputesAPI = {
  getAll: () => apiRequest('/disputes'),
  
  getById: (id) => apiRequest(`/disputes/${id}`),
  
  create: (disputeData) => apiRequest('/disputes', {
    method: 'POST',
    body: JSON.stringify(disputeData)
  }),
  
  update: (id, disputeData) => apiRequest(`/disputes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(disputeData)
  }),
  
  delete: (id) => apiRequest(`/disputes/${id}`, {
    method: 'DELETE'
  }),
  
  updateStatus: (id, status) => apiRequest(`/disputes/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  
  addComment: (id, comment) => apiRequest(`/disputes/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify(comment)
  })
};

// Notifications API calls
export const notificationsAPI = {
  getAll: () => apiRequest('/notifications'),
  
  getById: (id) => apiRequest(`/notifications/${id}`),
  
  create: (notificationData) => apiRequest('/notifications', {
    method: 'POST',
    body: JSON.stringify(notificationData)
  }),
  
  markAsRead: (id) => apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH'
  }),
  
  markAllAsRead: () => apiRequest('/notifications/read-all', {
    method: 'PATCH'
  }),
  
  delete: (id) => apiRequest(`/notifications/${id}`, {
    method: 'DELETE'
  })
};

// Analytics API calls
export const analyticsAPI = {
  getDashboard: () => apiRequest('/analytics/dashboard'),
  
  getJobStats: () => apiRequest('/analytics/jobs'),
  
  getUserStats: () => apiRequest('/analytics/users'),
  
  getDisputeStats: () => apiRequest('/analytics/disputes'),
  
  getRevenueStats: () => apiRequest('/analytics/revenue')
};

export default {
  authAPI,
  usersAPI,
  jobsAPI,
  disputesAPI,
  notificationsAPI,
  analyticsAPI
};
