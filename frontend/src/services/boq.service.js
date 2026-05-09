import api from './api';

class BOQService {
  async getByProject(projectId) {
    const response = await api.get(`/boq/projects/${projectId}`);
    return response.data;
  }

  async getById(boqId) {
    const response = await api.get(`/boq/${boqId}`);
    return response.data;
  }

  async create(boqData) {
    const response = await api.post('/boq', boqData);
    return response.data;
  }

  async update(boqId, boqData) {
    const response = await api.put(`/boq/${boqId}`, boqData);
    return response.data;
  }

  async delete(boqId) {
    const response = await api.delete(`/boq/${boqId}`);
    return response.data;
  }

  async addItem(boqId, itemData) {
    const response = await api.post(`/boq/${boqId}/items`, itemData);
    return response.data;
  }

  async updateItem(itemId, itemData) {
    const response = await api.put(`/boq/items/${itemId}`, itemData);
    return response.data;
  }

  async deleteItem(itemId) {
    const response = await api.delete(`/boq/items/${itemId}`);
    return response.data;
  }

  async submitForApproval(boqId) {
    const response = await api.patch(`/boq/${boqId}/submit`);
    return response.data;
  }

  async approve(boqId) {
    const response = await api.patch(`/boq/${boqId}/approve`);
    return response.data;
  }

  async reject(boqId, reason) {
    const response = await api.patch(`/boq/${boqId}/reject`, { reason });
    return response.data;
  }

  async exportPDF(boqId) {
    const response = await api.get(`/boq/${boqId}/export/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async exportExcel(boqId) {
    const response = await api.get(`/boq/${boqId}/export/excel`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export default new BOQService();
