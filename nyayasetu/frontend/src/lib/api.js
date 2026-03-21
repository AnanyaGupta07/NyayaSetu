import axios from 'axios'

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
if (!baseURL.endsWith('/api')) {
  baseURL += '/api';
}

const api = axios.create({
  baseURL,
  timeout: 180000,
})

export const analyzeDocument = async (file, language, userId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  if (userId) {
    formData.append('user_id', userId);
  }
  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getUserHistory = async (userId) => {
  if (!userId) return [];
  const response = await api.get(`/history/${userId}`);
  return response.data.history || [];
};

export const getSharedAnalysis = async (shareId) => {
  const response = await api.get(`/share/${shareId}`);
  return response.data;
};

export const getGlobalStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export default api;
