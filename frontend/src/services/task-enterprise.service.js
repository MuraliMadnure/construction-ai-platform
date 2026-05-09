import api from './api';

/**
 * Enterprise Task Management Service
 * Handles all enterprise-grade task operations including phases, assignments,
 * dependencies, approvals, progress tracking, and Gantt chart data
 */
class TaskEnterpriseService {

  // ============================================
  // PHASE & SUBPHASE MANAGEMENT
  // ============================================

  async createPhase(projectId, phaseData) {
    const response = await api.post(`/enterprise/projects/${projectId}/phases`, phaseData);
    return response.data;
  }

  async updatePhase(phaseId, phaseData) {
    const response = await api.put(`/enterprise/phases/${phaseId}`, phaseData);
    return response.data;
  }

  async deletePhase(phaseId) {
    const response = await api.delete(`/enterprise/phases/${phaseId}`);
    return response.data;
  }

  async getProjectPhases(projectId) {
    const response = await api.get(`/enterprise/projects/${projectId}/phases`);
    return response.data;
  }

  async createSubphase(phaseId, subphaseData) {
    const response = await api.post(`/enterprise/phases/${phaseId}/subphases`, subphaseData);
    return response.data;
  }

  async updateSubphase(subphaseId, subphaseData) {
    const response = await api.put(`/enterprise/subphases/${subphaseId}`, subphaseData);
    return response.data;
  }

  async deleteSubphase(subphaseId) {
    const response = await api.delete(`/enterprise/subphases/${subphaseId}`);
    return response.data;
  }

  // ============================================
  // SMART TASK ASSIGNMENT
  // ============================================

  async getSuggestedAssignees(taskId) {
    const response = await api.get(`/enterprise/tasks/${taskId}/suggested-assignees`);
    return response.data;
  }

  async assignTask(taskId, assigneeId) {
    const response = await api.post(`/enterprise/tasks/${taskId}/assign`, { assigneeId });
    return response.data;
  }

  async reassignTask(taskId, assigneeId, reason) {
    const response = await api.post(`/enterprise/tasks/${taskId}/reassign`, { assigneeId, reason });
    return response.data;
  }

  // ============================================
  // TASK DEPENDENCIES
  // ============================================

  async addDependency(taskId, dependencyData) {
    const response = await api.post(`/enterprise/tasks/${taskId}/dependencies`, dependencyData);
    return response.data;
  }

  async removeDependency(taskId, dependencyId) {
    const response = await api.delete(`/enterprise/tasks/${taskId}/dependencies/${dependencyId}`);
    return response.data;
  }

  async getTaskDependencies(taskId) {
    const response = await api.get(`/enterprise/tasks/${taskId}/dependencies`);
    return response.data;
  }

  async getCriticalPath(projectId) {
    const response = await api.get(`/enterprise/projects/${projectId}/critical-path`);
    return response.data;
  }

  // ============================================
  // TASK MATERIALS & RESOURCES
  // ============================================

  async addTaskMaterial(taskId, materialData) {
    const response = await api.post(`/enterprise/tasks/${taskId}/materials`, materialData);
    return response.data;
  }

  async updateTaskMaterial(materialId, materialData) {
    const response = await api.put(`/enterprise/task-materials/${materialId}`, materialData);
    return response.data;
  }

  async removeTaskMaterial(materialId) {
    const response = await api.delete(`/enterprise/task-materials/${materialId}`);
    return response.data;
  }

  async getTaskMaterials(taskId) {
    const response = await api.get(`/enterprise/tasks/${taskId}/materials`);
    return response.data;
  }

  async checkMaterialReadiness(taskId) {
    const response = await api.get(`/enterprise/tasks/${taskId}/material-readiness`);
    return response.data;
  }

  async addTaskResource(taskId, resourceData) {
    const response = await api.post(`/enterprise/tasks/${taskId}/resources`, resourceData);
    return response.data;
  }

  async updateTaskResource(resourceId, resourceData) {
    const response = await api.put(`/enterprise/task-resources/${resourceId}`, resourceData);
    return response.data;
  }

  async removeTaskResource(resourceId) {
    const response = await api.delete(`/enterprise/task-resources/${resourceId}`);
    return response.data;
  }

  // ============================================
  // TASK CHECKLISTS
  // ============================================

  async addChecklistItem(taskId, itemData) {
    const response = await api.post(`/enterprise/tasks/${taskId}/checklist`, itemData);
    return response.data;
  }

  async updateChecklistItem(itemId, itemData) {
    const response = await api.put(`/enterprise/checklist-items/${itemId}`, itemData);
    return response.data;
  }

  async toggleChecklistItem(itemId) {
    const response = await api.patch(`/enterprise/checklist-items/${itemId}/toggle`);
    return response.data;
  }

  async deleteChecklistItem(itemId) {
    const response = await api.delete(`/enterprise/checklist-items/${itemId}`);
    return response.data;
  }

  // ============================================
  // TASK COMMENTS
  // ============================================

  async addComment(taskId, commentData) {
    const response = await api.post(`/enterprise/tasks/${taskId}/comments`, commentData);
    return response.data;
  }

  async getTaskComments(taskId, limit = 50) {
    const response = await api.get(`/enterprise/tasks/${taskId}/comments`, {
      params: { limit }
    });
    return response.data;
  }

  async updateComment(commentId, content) {
    const response = await api.put(`/enterprise/comments/${commentId}`, { content });
    return response.data;
  }

  async deleteComment(commentId) {
    const response = await api.delete(`/enterprise/comments/${commentId}`);
    return response.data;
  }

  // ============================================
  // TASK ALERTS
  // ============================================

  async getTaskAlerts(taskId) {
    const response = await api.get(`/enterprise/tasks/${taskId}/alerts`);
    return response.data;
  }

  async resolveAlert(alertId, resolution) {
    const response = await api.patch(`/enterprise/alerts/${alertId}/resolve`, { resolution });
    return response.data;
  }

  async acknowledgeAlert(alertId) {
    const response = await api.patch(`/enterprise/alerts/${alertId}/acknowledge`);
    return response.data;
  }

  // ============================================
  // GANTT CHART
  // ============================================

  async getGanttData(projectId) {
    const response = await api.get(`/enterprise/projects/${projectId}/gantt`);
    return response.data;
  }

  async updateTaskDates(taskId, startDate, endDate) {
    const response = await api.patch(`/enterprise/tasks/${taskId}/dates`, {
      startDate,
      endDate
    });
    return response.data;
  }

  // ============================================
  // APPROVAL WORKFLOWS
  // ============================================

  async initiateApprovalWorkflow(taskId) {
    const response = await api.post(`/approvals/tasks/${taskId}/initiate`);
    return response.data;
  }

  async getPendingApprovals() {
    const response = await api.get('/approvals/pending');
    return response.data;
  }

  async approveTask(workflowId, approvalData) {
    const response = await api.post(`/approvals/workflows/${workflowId}/approve`, approvalData);
    return response.data;
  }

  async rejectTask(workflowId, rejectionData) {
    const response = await api.post(`/approvals/workflows/${workflowId}/reject`, rejectionData);
    return response.data;
  }

  async requestRevision(workflowId, revisionData) {
    const response = await api.post(`/approvals/workflows/${workflowId}/request-revision`, revisionData);
    return response.data;
  }

  async conditionalApproval(workflowId, approvalData) {
    const response = await api.post(`/approvals/workflows/${workflowId}/conditional-approve`, approvalData);
    return response.data;
  }

  async getApprovalHistory(taskId) {
    const response = await api.get(`/approvals/tasks/${taskId}/history`);
    return response.data;
  }

  // ============================================
  // DAILY PROGRESS REPORTS
  // ============================================

  async submitDailyReport(taskId, reportData) {
    const response = await api.post(`/progress/tasks/${taskId}/daily-reports`, reportData);
    return response.data;
  }

  async getDailyReport(reportId) {
    const response = await api.get(`/progress/reports/${reportId}`);
    return response.data;
  }

  async getTaskReports(taskId) {
    const response = await api.get(`/progress/tasks/${taskId}/reports`);
    return response.data;
  }

  async getProjectReports(projectId) {
    const response = await api.get(`/progress/projects/${projectId}/reports`);
    return response.data;
  }

  async reviewReport(reportId, reviewData) {
    const response = await api.post(`/progress/reports/${reportId}/review`, reviewData);
    return response.data;
  }

  async getPendingReviews() {
    const response = await api.get('/progress/reviews/pending');
    return response.data;
  }

  async getProgressAnalytics(taskId) {
    const response = await api.get(`/progress/tasks/${taskId}/analytics`);
    return response.data;
  }

  async getProjectProgressSummary(projectId) {
    const response = await api.get(`/progress/projects/${projectId}/progress-summary`);
    return response.data;
  }

  // ============================================
  // COST TRACKING
  // ============================================

  async addCostEntry(taskId, costData) {
    const response = await api.post(`/enterprise/tasks/${taskId}/costs`, costData);
    return response.data;
  }

  async getTaskCosts(taskId) {
    const response = await api.get(`/enterprise/tasks/${taskId}/costs`);
    return response.data;
  }

  async updateCostEntry(costId, costData) {
    const response = await api.put(`/enterprise/costs/${costId}`, costData);
    return response.data;
  }

  async deleteCostEntry(costId) {
    const response = await api.delete(`/enterprise/costs/${costId}`);
    return response.data;
  }
}

export default new TaskEnterpriseService();
