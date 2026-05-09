import api from './api';

class AIService {
  async getDelayPrediction(projectId) {
    const response = await api.get(`/ai/projects/${projectId}/delay-prediction`);
    return response.data;
  }

  async getBudgetPrediction(projectId) {
    const response = await api.get(`/ai/projects/${projectId}/budget-prediction`);
    return response.data;
  }

  async getProjectInsights(projectId) {
    const response = await api.get(`/ai/projects/${projectId}/insights`);
    return response.data;
  }

  async generateDailySummary(reportId) {
    const response = await api.get(`/ai/reports/${reportId}/summary`);
    return response.data;
  }

  async estimateBOQ(projectSpecs) {
    const response = await api.post('/ai/boq/estimate', projectSpecs);
    return response.data;
  }

  async chatbot(message, projectId = null) {
    const response = await api.post('/ai/chatbot', { message, projectId });
    return response.data;
  }

  async analyzeProductivity(projectId, startDate, endDate) {
    const response = await api.get('/ai/productivity/analyze', {
      params: { projectId, startDate, endDate }
    });
    return response.data;
  }
}

export default new AIService();
