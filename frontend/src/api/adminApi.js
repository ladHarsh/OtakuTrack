import axios from 'axios';

// Ensure API_BASE_URL ends with /api
let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL += '/api';
}

// Create axios instance with auth header
const createAuthInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// User Management
export const getUsers = async () => {
  try {
    const response = await createAuthInstance().get('/admin/users');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const getAllUsers = async () => {
  try {
    const response = await createAuthInstance().get('/admin/users');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const banUser = async (userId) => {
  try {
    const response = await createAuthInstance().put(`/admin/users/${userId}/ban`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to ban user');
  }
};

export const unbanUser = async (userId) => {
  try {
    const response = await createAuthInstance().put(`/admin/users/${userId}/unban`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to unban user');
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await createAuthInstance().delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await createAuthInstance().put(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user role');
  }
};

// Club Management
export const getClubs = async () => {
  try {
    const response = await createAuthInstance().get('/admin/clubs');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch clubs');
  }
};

export const getAllClubs = async () => {
  try {
    const response = await createAuthInstance().get('/admin/clubs');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch clubs');
  }
};

export const approveClub = async (clubId) => {
  try {
    const response = await createAuthInstance().put(`/admin/clubs/${clubId}/approve`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve club');
  }
};

export const rejectClub = async (clubId) => {
  try {
    const response = await createAuthInstance().put(`/admin/clubs/${clubId}/reject`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reject club');
  }
};

export const deleteClub = async (clubId) => {
  try {
    const response = await createAuthInstance().delete(`/admin/clubs/${clubId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete club');
  }
};

// Content Moderation
export const getFlaggedContent = async () => {
  try {
    const response = await createAuthInstance().get('/admin/flagged-content');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch flagged content');
  }
};

export const removeFlaggedContent = async (contentId) => {
  try {
    const response = await createAuthInstance().delete(`/admin/flagged-content/${contentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove flagged content');
  }
};

export const approveFlaggedContent = async (contentId) => {
  try {
    const response = await createAuthInstance().put(`/admin/flagged-content/${contentId}/approve`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve flagged content');
  }
};

// Analytics and Reports
export const getStats = async () => {
  try {
    const response = await createAuthInstance().get('/admin/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch admin stats');
  }
};

export const getAdminStats = async () => {
  try {
    const response = await createAuthInstance().get('/admin/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch admin stats');
  }
};

export const getSystemLogs = async (page = 1, limit = 50) => {
  try {
    const response = await createAuthInstance().get(`/admin/logs?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch system logs');
  }
};

// Bulk Operations
export const bulkBanUsers = async (userIds) => {
  try {
    const response = await createAuthInstance().post('/admin/users/bulk-ban', { userIds });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to bulk ban users');
  }
};

export const bulkDeleteClubs = async (clubIds) => {
  try {
    const response = await createAuthInstance().post('/admin/clubs/bulk-delete', { clubIds });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to bulk delete clubs');
  }
};

// Export Data
export const exportUsers = async (format = 'csv') => {
  try {
    const response = await createAuthInstance().get(`/admin/export/users?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export user data');
  }
};

export const exportClubs = async (format = 'csv') => {
  try {
    const response = await createAuthInstance().get(`/admin/export/clubs?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export club data');
  }
};

export const exportUserData = async (format = 'csv') => {
  try {
    const response = await createAuthInstance().get(`/admin/export/users?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export user data');
  }
};

export const exportClubData = async (format = 'csv') => {
  try {
    const response = await createAuthInstance().get(`/admin/export/clubs?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export club data');
  }
};

// Default export for backward compatibility
const adminApi = {
  getUsers,
  getAllUsers,
  banUser,
  unbanUser,
  deleteUser,
  updateUserRole,
  getClubs,
  getAllClubs,
  approveClub,
  rejectClub,
  deleteClub,
  getFlaggedContent,
  removeFlaggedContent,
  approveFlaggedContent,
  getStats,
  getAdminStats,
  getSystemLogs,
  bulkBanUsers,
  bulkDeleteClubs,
  exportUsers,
  exportClubs,
  exportUserData,
  exportClubData
};

export default adminApi;
