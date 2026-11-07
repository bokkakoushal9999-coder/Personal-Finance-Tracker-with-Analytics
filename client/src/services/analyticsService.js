import api from './api';

export const analyticsService = {
  async getSummary(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/analytics/summary${query}`);
    return response.data;
  },

  async getMonthly(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/analytics/monthly?${query}`);
    return response.data;
  },

  async getCategories(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/analytics/categories?${query}`);
    return response.data;
  },

  async getInsights() {
    const response = await api.get('/analytics/insights');
    return response.data;
  },
};

export default analyticsService;

