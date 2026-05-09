import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import taskEnterpriseService from '../services/task-enterprise.service';

/**
 * Approval Workflow Store
 * Manages approval workflows, pending approvals, and approval history
 */
const useApprovalStore = create(
  devtools(
    (set, get) => ({
      // ============================================
      // STATE
      // ============================================

      pendingApprovals: [],
      approvalHistory: {},
      selectedWorkflow: null,
      loading: false,
      error: null,

      // ============================================
      // ACTIONS
      // ============================================

      setPendingApprovals: (approvals) => set({ pendingApprovals: approvals }),

      addPendingApproval: (approval) => set((state) => ({
        pendingApprovals: [...state.pendingApprovals, approval]
      })),

      removePendingApproval: (workflowId) => set((state) => ({
        pendingApprovals: state.pendingApprovals.filter(
          approval => approval.workflowId !== workflowId
        )
      })),

      updateApprovalStatus: (workflowId, status) => set((state) => ({
        pendingApprovals: state.pendingApprovals.map(approval =>
          approval.workflowId === workflowId
            ? { ...approval, status }
            : approval
        )
      })),

      setApprovalHistory: (taskId, history) => set((state) => ({
        approvalHistory: {
          ...state.approvalHistory,
          [taskId]: history
        }
      })),

      setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),

      // ============================================
      // API ACTIONS
      // ============================================

      fetchPendingApprovals: async () => {
        set({ loading: true, error: null });
        try {
          const response = await taskEnterpriseService.getPendingApprovals();
          const approvals = Array.isArray(response) ? response : (response?.data || []);
          set({ pendingApprovals: approvals, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          console.error('Failed to fetch pending approvals:', error);
          set({ pendingApprovals: [] }); // Ensure it's always an array
        }
      },

      fetchApprovalHistory: async (taskId) => {
        set({ loading: true, error: null });
        try {
          const history = await taskEnterpriseService.getApprovalHistory(taskId);
          get().setApprovalHistory(taskId, history);
          set({ loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      initiateApproval: async (taskId) => {
        set({ loading: true, error: null });
        try {
          const workflow = await taskEnterpriseService.initiateApprovalWorkflow(taskId);
          get().addPendingApproval(workflow);
          set({ loading: false });
          return workflow;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      approveWorkflow: async (workflowId, approvalData) => {
        set({ loading: true, error: null });
        try {
          const result = await taskEnterpriseService.approveTask(workflowId, approvalData);
          get().removePendingApproval(workflowId);
          set({ loading: false });
          return result;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      rejectWorkflow: async (workflowId, rejectionData) => {
        set({ loading: true, error: null });
        try {
          const result = await taskEnterpriseService.rejectTask(workflowId, rejectionData);
          get().removePendingApproval(workflowId);
          set({ loading: false });
          return result;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      requestRevisionWorkflow: async (workflowId, revisionData) => {
        set({ loading: true, error: null });
        try {
          const result = await taskEnterpriseService.requestRevision(workflowId, revisionData);
          get().updateApprovalStatus(workflowId, 'REVISION_REQUIRED');
          set({ loading: false });
          return result;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      conditionalApprovalWorkflow: async (workflowId, approvalData) => {
        set({ loading: true, error: null });
        try {
          const result = await taskEnterpriseService.conditionalApproval(workflowId, approvalData);
          get().updateApprovalStatus(workflowId, 'CONDITIONALLY_APPROVED');
          set({ loading: false });
          return result;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // ============================================
      // COMPUTED VALUES
      // ============================================

      getApprovalsByPriority: () => {
        const { pendingApprovals } = get();
        const approvals = Array.isArray(pendingApprovals) ? pendingApprovals : [];
        return {
          urgent: approvals.filter(a => a.priority === 'urgent'),
          high: approvals.filter(a => a.priority === 'high'),
          normal: approvals.filter(a => a.priority === 'normal'),
          low: approvals.filter(a => a.priority === 'low')
        };
      },

      getOverdueApprovals: () => {
        const { pendingApprovals } = get();
        const approvals = Array.isArray(pendingApprovals) ? pendingApprovals : [];
        const now = new Date();
        return approvals.filter(approval => {
          if (!approval.deadline) return false;
          return new Date(approval.deadline) < now;
        });
      }
    }),
    { name: 'ApprovalStore' }
  )
);

export default useApprovalStore;
