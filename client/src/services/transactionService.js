import api from './api';

export const transactionService = {
  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/transactions?${query}`);
    return response.data;
  },

  async getTransactionById(id) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async createTransaction(transactionData) {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  async updateTransaction(id, transactionData) {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  async deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

export default transactionService;

