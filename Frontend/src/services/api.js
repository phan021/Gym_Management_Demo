const API_BASE_URL = 'http://localhost:5000/api';

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('gym_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        if (response.status === 401) {
          localStorage.removeItem('gym_token');
          localStorage.removeItem('gym_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
      throw new Error(data.message || `Lỗi yêu cầu: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
};

export default {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};
