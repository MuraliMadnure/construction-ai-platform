import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import taskEnterpriseService from '../services/task-enterprise.service';

/**
 * Progress Tracking Store
 * Manages daily progress reports, pending reviews, and analytics
 */
const useProgressStore = create(
  devtools(
    (set, get) => ({
      // ============================================
      // STATE
      // ============================================

      dailyReports: [],
      taskReports: {},
      projectReports: {},
      pendingReviews: [],
      analytics: {},
      selectedReport: null,
      loading: false,
      error: null,

      // ============================================
      // ACTIONS
      // ============================================

      setDailyReports: (reports) => set({ dailyReports: reports }),

      addDailyReport: (report) => set((state) => ({
        dailyReports: [report, ...state.dailyReports]
      })),

      updateReport: (reportId, updates) => set((state) => ({
        dailyReports: state.dailyReports.map(report =>
          report.id === reportId ? { ...report, ...updates } : report
        ),
        selectedReport: state.selectedReport?.id === reportId
          ? { ...state.selectedReport, ...updates }
          : state.selectedReport
      })),

      setTaskReports: (taskId, reports) => set((state) => ({
        taskReports: {
          ...state.taskReports,
          [taskId]: reports
        }
      })),

      setProjectReports: (projectId, reports) => set((state) => ({
        projectReports: {
          ...state.projectReports,
          [projectId]: reports
        }
      })),

      setPendingReviews: (reviews) => set({ pendingReviews: reviews }),

      removePendingReview: (reportId) => set((state) => ({
        pendingReviews: state.pendingReviews.filter(review => review.id !== reportId)
      })),

      setAnalytics: (taskId, analytics) => set((state) => ({
        analytics: {
          ...state.analytics,
          [taskId]: analytics
        }
      })),

      setSelectedReport: (report) => set({ selectedReport: report }),

      // ============================================
      // API ACTIONS
      // ============================================

      submitDailyReport: async (taskId, reportData) => {
        set({ loading: true, error: null });
        try {
          const report = await taskEnterpriseService.submitDailyReport(taskId, reportData);
          get().addDailyReport(report);
          set({ loading: false });
          return report;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchDailyReport: async (reportId) => {
        set({ loading: true, error: null });
        try {
          const report = await taskEnterpriseService.getDailyReport(reportId);
          set({ selectedReport: report, loading: false });
          return report;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchTaskReports: async (taskId) => {
        set({ loading: true, error: null });
        try {
          const reports = await taskEnterpriseService.getTaskReports(taskId);
          get().setTaskReports(taskId, reports);
          set({ loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchProjectReports: async (projectId) => {
        set({ loading: true, error: null });
        try {
          const reports = await taskEnterpriseService.getProjectReports(projectId);
          get().setProjectReports(projectId, reports);
          set({ loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchPendingReviews: async () => {
        set({ loading: true, error: null });
        try {
          const reviews = await taskEnterpriseService.getPendingReviews();
          set({ pendingReviews: reviews, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      reviewReport: async (reportId, reviewData) => {
        set({ loading: true, error: null });
        try {
          const result = await taskEnterpriseService.reviewReport(reportId, reviewData);
          get().updateReport(reportId, result);
          get().removePendingReview(reportId);
          set({ loading: false });
          return result;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchProgressAnalytics: async (taskId) => {
        set({ loading: true, error: null });
        try {
          const analytics = await taskEnterpriseService.getProgressAnalytics(taskId);
          get().setAnalytics(taskId, analytics);
          set({ loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // ============================================
      // COMPUTED VALUES
      // ============================================

      getReportsByStatus: () => {
        const { dailyReports } = get();
        return {
          submitted: dailyReports.filter(r => r.reviewStatus === 'PENDING'),
          approved: dailyReports.filter(r => r.reviewStatus === 'APPROVED'),
          rejected: dailyReports.filter(r => r.reviewStatus === 'REJECTED'),
          revision_required: dailyReports.filter(r => r.reviewStatus === 'REVISION_REQUIRED')
        };
      },

      getTodayReports: () => {
        const { dailyReports } = get();
        const today = new Date().toISOString().split('T')[0];
        return dailyReports.filter(report => {
          const reportDate = new Date(report.reportDate).toISOString().split('T')[0];
          return reportDate === today;
        });
      }
    }),
    { name: 'ProgressStore' }
  )
);

export default useProgressStore;
