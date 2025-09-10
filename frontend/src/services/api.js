import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  getCurrentUser: () => 
    api.get('/auth/me').then(res => res.data),
};

// Profile API
export const profileAPI = {
  getAll: () => 
    api.get('/profiles').then(res => res.data),
  
  getById: (id) => 
    api.get(`/profiles/${id}`).then(res => res.data),
  
  create: (profileData, files) => {
    const formData = new FormData();
    
    // Add profile data as individual fields
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });
    
    // Add files
    if (files) {
      files.forEach((file, index) => {
        if (file) {
          formData.append(`files`, file);
        }
      });
    }
    
    return api.post('/profiles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
  
  update: (id, profileData, files) => {
    const formData = new FormData();
    
    // Add profile data as individual fields
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });
    
    // Add files
    if (files) {
      files.forEach((file, index) => {
        if (file) {
          formData.append(`files`, file);
        }
      });
    }
    
    return api.put(`/profiles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
  
  delete: (id) => 
    api.delete(`/profiles/${id}`).then(res => res.data),
  
  lockAll: (lock) => 
    api.post('/profiles/lock-all', { lock }).then(res => res.data),
  
  lock: (id, lock) => 
    api.post(`/profiles/${id}/lock`, { lock }).then(res => res.data),
  
  requestEdit: (id) => 
    api.post(`/profiles/${id}/request-edit`).then(res => res.data),
  
  approveEdit: (id) => 
    api.post(`/profiles/${id}/approve-edit`).then(res => res.data),
  
  removeFile: (id, fileType) => 
    api.delete(`/profiles/${id}/files/${fileType}`).then(res => res.data),
  
  addFaculty: (facultyData) => 
    api.post('/profiles/add-faculty', facultyData).then(res => res.data),
};

// File API
export const fileAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
  
  download: (filename) => 
    api.get(`/files/download/${filename}`, {
      responseType: 'blob',
    }).then(res => res.data),
};

export default api;
