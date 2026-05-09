import api from './api';

class ReportService {
  async generateProjectPDF(projectId) {
    const response = await api.get(`/reports/projects/${projectId}/pdf`);
    return response.data;
  }

  async exportProjectToExcel(projectId) {
    const response = await api.get(`/reports/projects/${projectId}/excel`);
    return response.data;
  }

  async generateMonthlySummary(projectId, month, year) {
    const response = await api.get(`/reports/projects/${projectId}/monthly`, {
      params: { month, year }
    });
    return response.data;
  }

  async getDailyReports(projectId, params = {}) {
    const response = await api.get(`/reports/projects/${projectId}/daily`, { params });
    return response.data;
  }

  async createDailyReport(reportData) {
    const response = await api.post('/reports/daily', reportData);
    return response.data;
  }

  async generateDailyReportPDF(reportId) {
    const response = await api.get(`/reports/daily/${reportId}/pdf`);
    return response.data;
  }

  async updateDailyReport(reportId, reportData) {
    const response = await api.put(`/reports/daily/${reportId}`, reportData);
    return response.data;
  }

  async deleteDailyReport(reportId) {
    const response = await api.delete(`/reports/daily/${reportId}`);
    return response.data;
  }

  async getSiteIssues(projectId, params = {}) {
    const response = await api.get(`/reports/projects/${projectId}/issues`, { params });
    return response.data;
  }

  async createSiteIssue(issueData) {
    const response = await api.post('/reports/issues', issueData);
    return response.data;
  }

  async updateSiteIssue(issueId, updateData) {
    const response = await api.patch(`/reports/issues/${issueId}`, updateData);
    return response.data;
  }

  async downloadReport(filename) {
    window.open(`${api.defaults.baseURL}/reports/download/${filename}`, '_blank');
  }
}

export default new ReportService();
