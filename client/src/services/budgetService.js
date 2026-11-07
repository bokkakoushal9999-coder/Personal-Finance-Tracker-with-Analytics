import api from './api';

export const budgetService = {
  async getBudgets(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/budgets${query}`);
    return response.data;
  },

  async createBudget(budgetData) {
    const response = await api.post('/budgets', budgetData);
    return response.data;
  },

  async updateBudget(id, budgetData) {
    const response = await api.put(`/budgets/${id}`, budgetData);
    return response.data;
  },

  async deleteBudget(id) {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },
};

export default budgetService;

