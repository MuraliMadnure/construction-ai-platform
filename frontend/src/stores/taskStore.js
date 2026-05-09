import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import taskService from '../services/task.service';
import taskEnterpriseService from '../services/task-enterprise.service';

/**
 * Task Management Store
 * Manages all task-related state including tasks, phases, subphases,
 * dependencies, materials, and real-time updates
 */
const useTaskStore = create(
  devtools(
    (set, get) => ({
      // ============================================
      // STATE
      // ============================================

      tasks: [],
      selectedTask: null,
      phases: [],
      subphases: [],
      dependencies: [],
      criticalPath: [],
      ganttData: null,
      loading: false,
      error: null,

      // Filters
      filters: {
        status: 'all',
        assignee: 'all',
        phase: 'all',
        priority: 'all',
        search: ''
      },

      // UI State
      isTaskDrawerOpen: false,
      isPhaseModalOpen: false,

      // ============================================
      // TASK OPERATIONS
      // ============================================

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
      })),

      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
        selectedTask: state.selectedTask?.id === taskId
          ? { ...state.selectedTask, ...updates }
          : state.selectedTask
      })),

      removeTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== taskId),
        selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask
      })),

      setSelectedTask: (task) => set({ selectedTask: task }),

      // ============================================
      // PHASES & SUBPHASES
      // ============================================

      setPhases: (phases) => set({ phases }),

      addPhase: (phase) => set((state) => ({
        phases: [...state.phases, phase]
      })),

      updatePhase: (phaseId, updates) => set((state) => ({
        phases: state.phases.map(phase =>
          phase.id === phaseId ? { ...phase, ...updates } : phase
        )
      })),

      removePhase: (phaseId) => set((state) => ({
        phases: state.phases.filter(phase => phase.id !== phaseId),
        tasks: state.tasks.map(task =>
          task.phaseId === phaseId ? { ...task, phaseId: null } : task
        )
      })),

      setSubphases: (subphases) => set({ subphases }),

      addSubphase: (subphase) => set((state) => ({
        subphases: [...state.subphases, subphase]
      })),

      updateSubphase: (subphaseId, updates) => set((state) => ({
        subphases: state.subphases.map(subphase =>
          subphase.id === subphaseId ? { ...subphase, ...updates } : subphase
        )
      })),

      removeSubphase: (subphaseId) => set((state) => ({
        subphases: state.subphases.filter(subphase => subphase.id !== subphaseId)
      })),

      // ============================================
      // DEPENDENCIES
      // ============================================

      setDependencies: (dependencies) => set({ dependencies }),

      addDependency: (dependency) => set((state) => ({
        dependencies: [...state.dependencies, dependency]
      })),

      removeDependency: (dependencyId) => set((state) => ({
        dependencies: state.dependencies.filter(dep => dep.id !== dependencyId)
      })),

      setCriticalPath: (criticalPath) => set({ criticalPath }),

      // ============================================
      // GANTT DATA
      // ============================================

      setGanttData: (ganttData) => set({ ganttData }),

      updateGanttTask: (taskId, updates) => set((state) => {
        if (!state.ganttData) return state;

        return {
          ganttData: {
            ...state.ganttData,
            data: state.ganttData.data.map(task =>
              task.id === taskId ? { ...task, ...updates } : task
            )
          }
        };
      }),

      // ============================================
      // FILTERS
      // ============================================

      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),

      resetFilters: () => set({
        filters: {
          status: 'all',
          assignee: 'all',
          phase: 'all',
          priority: 'all',
          search: ''
        }
      }),

      // ============================================
      // UI STATE
      // ============================================

      openTaskDrawer: (task = null) => set({
        isTaskDrawerOpen: true,
        selectedTask: task
      }),

      closeTaskDrawer: () => set({
        isTaskDrawerOpen: false,
        selectedTask: null
      }),

      togglePhaseModal: (isOpen) => set({ isPhaseModalOpen: isOpen }),

      // ============================================
      // API ACTIONS
      // ============================================

      fetchTasks: async (projectId) => {
        set({ loading: true, error: null });
        try {
          const data = await taskService.getAll({ projectId });
          set({ tasks: data.tasks || data, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchTaskById: async (taskId) => {
        set({ loading: true, error: null });
        try {
          const response = await taskService.getById(taskId);
          const task = response?.data?.task || response?.task || response;
          set({ selectedTask: task, loading: false });
          return task;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      createTask: async (taskData) => {
        set({ loading: true, error: null });
        try {
          const response = await taskService.create(taskData);
          const newTask = response?.data?.task || response?.task || response;
          get().addTask(newTask);
          set({ loading: false });
          return newTask;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateTaskById: async (taskId, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await taskService.update(taskId, updates);
          const updatedTask = response?.data?.task || response?.task || response;
          get().updateTask(taskId, updatedTask);
          set({ loading: false });
          return updatedTask;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      deleteTaskById: async (taskId) => {
        set({ loading: true, error: null });
        try {
          await taskService.delete(taskId);
          get().removeTask(taskId);
          set({ loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchPhases: async (projectId) => {
        set({ loading: true, error: null });
        try {
          const phases = await taskEnterpriseService.getProjectPhases(projectId);
          set({ phases, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      createPhase: async (projectId, phaseData) => {
        set({ loading: true, error: null });
        try {
          const newPhase = await taskEnterpriseService.createPhase(projectId, phaseData);
          get().addPhase(newPhase);
          set({ loading: false });
          return newPhase;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchCriticalPath: async (projectId) => {
        set({ loading: true, error: null });
        try {
          const criticalPath = await taskEnterpriseService.getCriticalPath(projectId);
          set({ criticalPath, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchGanttData: async (projectId) => {
        set({ loading: true, error: null });
        try {
          const ganttData = await taskEnterpriseService.getGanttData(projectId);
          set({ ganttData, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // ============================================
      // COMPUTED VALUES
      // ============================================

      getFilteredTasks: () => {
        const { tasks, filters } = get();
        return tasks.filter(task => {
          // Status filter
          if (filters.status !== 'all' && task.status !== filters.status) {
            return false;
          }

          // Assignee filter
          if (filters.assignee !== 'all' && task.assignedTo !== filters.assignee) {
            return false;
          }

          // Phase filter
          if (filters.phase !== 'all' && task.phaseId !== filters.phase) {
            return false;
          }

          // Priority filter
          if (filters.priority !== 'all' && task.priority !== filters.priority) {
            return false;
          }

          // Search filter
          if (filters.search && !task.name.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
          }

          return true;
        });
      },

      getTasksByStatus: () => {
        const tasks = get().getFilteredTasks();
        return {
          pending: tasks.filter(t => t.status === 'PENDING'),
          assigned: tasks.filter(t => t.status === 'ASSIGNED'),
          in_progress: tasks.filter(t => t.status === 'IN_PROGRESS'),
          under_review: tasks.filter(t => t.status === 'UNDER_REVIEW'),
          completed: tasks.filter(t => t.status === 'COMPLETED'),
          blocked: tasks.filter(t => t.status === 'BLOCKED')
        };
      }
    }),
    { name: 'TaskStore' }
  )
);

export default useTaskStore;
