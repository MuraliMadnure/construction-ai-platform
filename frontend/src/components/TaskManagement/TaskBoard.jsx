import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import useTaskStore from '../../stores/taskStore';
import TaskCard from './TaskCard';

/**
 * TaskBoard Component - Kanban View
 * Displays tasks in a Kanban board with drag-and-drop functionality
 * Supports filtering, searching, and real-time updates
 */
const TaskBoard = ({ projectId, socket }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

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
    { id: 'PENDING', title: 'Pending', tasks: tasksByStatus.pending, color: 'bg-gray-100 border-gray-300' },
    { id: 'ASSIGNED', title: 'Assigned', tasks: tasksByStatus.assigned, color: 'bg-blue-50 border-blue-300' },
    { id: 'IN_PROGRESS', title: 'In Progress', tasks: tasksByStatus.in_progress, color: 'bg-yellow-50 border-yellow-300' },
    { id: 'UNDER_REVIEW', title: 'Under Review', tasks: tasksByStatus.under_review, color: 'bg-purple-50 border-purple-300' },
    { id: 'COMPLETED', title: 'Completed', tasks: tasksByStatus.completed, color: 'bg-green-50 border-green-300' },
    { id: 'BLOCKED', title: 'Blocked', tasks: tasksByStatus.blocked, color: 'bg-red-50 border-red-300' }
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

    // Update task status via API
    try {
      const { updateTaskById } = useTaskStore.getState();
      await updateTaskById(draggedTask.id, { status: columnId });
    } catch (error) {
      console.error('Error updating task status:', error);
    }

    setDraggedTask(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          {/* Real-time Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-600">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => openTaskDrawer()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phase
              </label>
              <select
                value={filters.phase}
                onChange={(e) => setFilters({ phase: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Phases</option>
                {/* Phase options will be populated dynamically */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              <select
                value={filters.assignee}
                onChange={(e) => setFilters({ assignee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Assignees</option>
                {/* Assignee options will be populated dynamically */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  useTaskStore.getState().resetFilters();
                  setSearchQuery('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col w-80 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between p-3 rounded-t-lg border-t-4 ${column.color}`}>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-white rounded-full">
                    {column.tasks.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-3 bg-gray-50 rounded-b-lg border border-t-0 border-gray-200 overflow-y-auto">
                <div className="space-y-3">
                  {column.tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No tasks
                    </div>
                  ) : (
                    column.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDragStart={() => handleDragStart(task)}
                        onClick={() => {
                          openTaskDrawer(task);
                          subscribeToTask(task.id);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
