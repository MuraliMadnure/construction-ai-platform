import api from './api';

class ResourceService {
  // Workers
  async getWorkers(params = {}) {
    const response = await api.get('/resources/workers', { params });
    return response.data;
  }

  async getWorkerById(workerId) {
    const response = await api.get(`/resources/workers/${workerId}`);
    return response.data;
  }

  async createWorker(workerData) {
    const response = await api.post('/resources/workers', workerData);
    return response.data;
  }

  async updateWorker(workerId, workerData) {
    const response = await api.put(`/resources/workers/${workerId}`, workerData);
    return response.data;
  }

  async deleteWorker(workerId) {
    const response = await api.delete(`/resources/workers/${workerId}`);
    return response.data;
  }

  // Equipment
  async getEquipment(params = {}) {
    const response = await api.get('/resources/equipment', { params });
    return response.data;
  }

  async getEquipmentById(equipmentId) {
    const response = await api.get(`/resources/equipment/${equipmentId}`);
    return response.data;
  }

  async createEquipment(equipmentData) {
    const response = await api.post('/resources/equipment', equipmentData);
    return response.data;
  }

  async updateEquipment(equipmentId, equipmentData) {
    const response = await api.put(`/resources/equipment/${equipmentId}`, equipmentData);
    return response.data;
  }

  async deleteEquipment(equipmentId) {
    const response = await api.delete(`/resources/equipment/${equipmentId}`);
    return response.data;
  }

  // Allocations
  async getAllocations(projectId, params = {}) {
    const response = await api.get(`/resources/allocations/projects/${projectId}`, { params });
    return response.data;
  }

  async createAllocation(allocationData) {
    const response = await api.post('/resources/allocations', allocationData);
    return response.data;
  }

  async updateAllocation(allocationId, allocationData) {
    const response = await api.put(`/resources/allocations/${allocationId}`, allocationData);
    return response.data;
  }

  async deleteAllocation(allocationId) {
    const response = await api.delete(`/resources/allocations/${allocationId}`);
    return response.data;
  }

  // Utilization
  async getUtilization(projectId, startDate, endDate) {
    const response = await api.get('/resources/utilization', {
      params: { projectId, startDate, endDate }
    });
    return response.data;
  }
}

export default new ResourceService();
