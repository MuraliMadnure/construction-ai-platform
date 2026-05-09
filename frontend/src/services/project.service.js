import api from './api';

class ProjectService {
  async getAll(params = {}) {
    const response = await api.get('/projects', { params });
    return response.data;
  }

  async getById(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  }

  async create(projectData) {
    const response = await api.post('/projects', projectData);
    return response.data;
  }

  async update(id, projectData) {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }

  async getDashboard(id) {
    const response = await api.get(`/projects/${id}/dashboard`);
    return response.data;
  }

  async getMembers(id) {
    const response = await api.get(`/projects/${id}/members`);
    return response.data;
  }

  async addMember(id, memberData) {
    const response = await api.post(`/projects/${id}/members`, memberData);
    return response.data;
  }

  async removeMember(id, memberId) {
    const response = await api.delete(`/projects/${id}/members/${memberId}`);
    return response.data;
  }
}

export default new ProjectService();
