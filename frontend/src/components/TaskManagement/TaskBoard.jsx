import { useState, useEffect } from 'react';
import { Plus, Search, Filter, X, Columns3 } from 'lucide-react';
import useTaskStore from '../../stores/taskStore';
import TaskCard from './TaskCard';

/**
 * TaskBoard Component - Modern Kanban View
 * Displays tasks in a Kanban board with drag-and-drop functionality
 * Supports filtering, searching, and real-time updates with enhanced UI
 */
const TaskBoard = ({ projectId, socket }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  const {
    fetchTasks,
    getTasksByStatus,
    setFilters,
    filters,
    openTaskDrawer,
    loading
  } = useTaskStore();

  const {
    isConnected = false,
    subscribeToTask = () => {}
  } = socket || {};

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
    }
  }, [projectId, fetchTasks]);

  const tasksByStatus = getTasksByStatus();

  const columns = [
    {
      id: 'PENDING',
      title: 'Pending',
      description: 'Not started',
      tasks: tasksByStatus.pending,
      gradient: 'from-slate-50 to-slate-100',
      headerGradient: 'from-slate-600 to-slate-700',
      icon: '📋',
      color: 'text-slate-600'
    },
    {
      id: 'ASSIGNED',
      title: 'Assigned',
      description: 'Ready to start',
      tasks: tasksByStatus.assigned,
      gradient: 'from-blue-50 to-blue-100',
      headerGradient: 'from-blue-600 to-blue-700',
      icon: '👤',
      color: 'text-blue-600'
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      description: 'Currently working',
      tasks: tasksByStatus.in_progress,
      gradient: 'from-amber-50 to-amber-100',
      headerGradient: 'from-amber-500 to-amber-600',
      icon: '⚡',
      color: 'text-amber-600'
    },
    {
      id: 'UNDER_REVIEW',
      title: 'Review',
      description: 'Pending approval',
      tasks: tasksByStatus.under_review,
      gradient: 'from-purple-50 to-purple-100',
      headerGradient: 'from-purple-600 to-purple-700',
      icon: '👁️',
      color: 'text-purple-600'
    },
    {
      id: 'COMPLETED',
      title: 'Completed',
      description: 'Successfully finished',
      tasks: tasksByStatus.completed,
      gradient: 'from-emerald-50 to-emerald-100',
      headerGradient: 'from-emerald-600 to-emerald-700',
      icon: '✓',
      color: 'text-emerald-600'
    },
    {
      id: 'BLOCKED',
      title: 'Blocked',
      description: 'Waiting for resolution',
      tasks: tasksByStatus.blocked,
      gradient: 'from-red-50 to-red-100',
      headerGradient: 'from-red-600 to-red-700',
      icon: '🚫',
      color: 'text-red-600'
    }
  ];

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFilters({ search: query });
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (columnId) => {
    if (!draggedTask) return;

    try {
      const { updateTaskById } = useTaskStore.getState();
      await updateTaskById(draggedTask.id, { status: columnId });
    } catch (error) {
      console.error('Error updating task status:', error);
    }

    setDraggedTask(null);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...activeFilters, [filterKey]: value };
    setActiveFilters(newFilters);
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Controls */}
      <div className="mb-6 space-y-4">
        {/* Search & Filter Row */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks by name, code, or description..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-all ${
              showFilters
                ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          {/* View Options */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-all shadow-sm">
            <Columns3 className="w-4 h-4" />
            Columns
          </button>

          {/* Real-time Indicator */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className={`text-xs font-medium ${isConnected ? 'text-emerald-700' : 'text-gray-600'}`}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>

          {/* Add Task Button */}
          <button
            onClick={() => openTaskDrawer()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Priority
                </label>
                <select
                  value={activeFilters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Assignee
                </label>
                <select
                  value={activeFilters.assignee || ''}
                  onChange={(e) => handleFilterChange('assignee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Assignees</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Phase
                </label>
                <select
                  value={activeFilters.phase || ''}
                  onChange={(e) => handleFilterChange('phase', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Phases</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Risk Level
                </label>
                <select
                  value={activeFilters.risk || ''}
                  onChange={(e) => handleFilterChange('risk', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Levels</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={activeFilters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setActiveFilters({});
                    useTaskStore.getState().resetFilters();
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 h-full min-w-max pb-4">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col w-96 flex-shrink-0 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column Header */}
              <div className={`bg-gradient-to-r ${column.headerGradient} text-white p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{column.icon}</span>
                    <div>
                      <h3 className="font-bold text-base">{column.title}</h3>
                      <p className="text-xs opacity-90 mt-0.5">{column.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white border-opacity-20">
                  <span className="text-sm font-semibold">{column.tasks.length} tasks</span>
                  <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xs font-bold">
                    {column.tasks.length}
                  </div>
                </div>
              </div>

              {/* Column Content */}
              <div className={`flex-1 bg-gradient-to-b ${column.gradient} p-4 overflow-y-auto custom-scrollbar`}>
                {column.tasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-center">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">No tasks yet</p>
                      <p className="text-gray-400 text-xs mt-1">Drag tasks here or create new ones</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {column.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        columnId={column.id}
                        onDragStart={() => handleDragStart(task)}
                        onClick={() => {
                          openTaskDrawer(task);
                          subscribeToTask(task.id);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
