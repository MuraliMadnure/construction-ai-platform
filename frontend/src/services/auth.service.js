import api from './api';

class AuthService {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.data.tokens) {
      this.setTokens(response.data.data.tokens);
    }
    return response.data;
  }

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.data.tokens) {
      this.setTokens(response.data.data.tokens);
    }
    return response.data;
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', { refreshToken });
    if (response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    return response.data;
  }

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token, password) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }

  setTokens(tokens) {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export default new AuthService();
