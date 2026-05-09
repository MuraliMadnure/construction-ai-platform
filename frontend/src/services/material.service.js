import api from './api';

class MaterialService {
  async getInventory(params = {}) {
    const response = await api.get('/materials/inventory', { params });
    return response.data;
  }

  async getOrders(params = {}) {
    const response = await api.get('/materials/orders', { params });
    return response.data;
  }

  async createInventoryItem(data) {
    const response = await api.post('/materials/inventory', data);
    return response.data;
  }

  async createOrder(data) {
    const response = await api.post('/materials/orders', data);
    return response.data;
  }

  async updateInventory(id, data) {
    const response = await api.put(`/materials/inventory/${id}`, data);
    return response.data;
  }

  async updateOrder(id, data) {
    const response = await api.put(`/materials/orders/${id}`, data);
    return response.data;
  }

  async deleteInventoryItem(id) {
    const response = await api.delete(`/materials/inventory/${id}`);
    return response.data;
  }
}

export default new MaterialService();
