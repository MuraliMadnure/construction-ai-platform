import { useState, useEffect, useMemo } from 'react';
import {
  ChevronUp, ChevronDown, Filter, Search, Download, Eye, EyeOff,
  AlertTriangle, CheckCircle2, Clock, Zap, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import useTaskStore from '../../stores/taskStore';

/**
 * ListView Component - Professional Table View
 * Displays tasks in a sophisticated table format with sorting, filtering, and column visibility
 */
const ListView = ({ projectId, socket }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState({
    taskCode: true,
    name: true,
    status: true,
    priority: true,
    assignee: true,
    startDate: true,
    endDate: true,
    progress: true,
    risk: true,
    budget: true
  });
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const { fetchTasks, tasks, openTaskDrawer } = useTaskStore();
  const { isConnected = false } = socket || {};

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
    }
  }, [projectId, fetchTasks]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task =>
      task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortConfig.direction === 'asc'
        ? aVal - bVal
        : bVal - aVal;
    });

    return filtered;
  }, [tasks, searchQuery, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const toggleColumnVisibility = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-slate-100 text-slate-700 border-slate-300',
      ASSIGNED: 'bg-blue-100 text-blue-700 border-blue-300',
      IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-300',
      UNDER_REVIEW: 'bg-purple-100 text-purple-700 border-purple-300',
      COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      BLOCKED: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[status] || colors.PENDING;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'bg-blue-50 text-blue-700',
      MEDIUM: 'bg-amber-50 text-amber-700',
      HIGH: 'bg-orange-50 text-orange-700',
      URGENT: 'bg-red-50 text-red-700'
    };
    return colors[priority] || colors.MEDIUM;
  };

  const getRiskColor = (risk) => {
    const colors = {
      LOW: 'text-emerald-600',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      CRITICAL: 'text-red-600'
    };
    return colors[risk] || colors.LOW;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-emerald-600';
    if (progress >= 50) return 'text-blue-600';
    if (progress >= 25) return 'text-amber-600';
    return 'text-red-600';
  };

  const isOverdue = (endDate) => {
    return endDate && new Date(endDate) < new Date();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <div className="w-4 h-4" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  const ColumnHeader = ({ column, label }) => (
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors select-none">
      <div className="flex items-center gap-2" onClick={() => handleSort(column)}>
        <span>{label}</span>
        <SortIcon column={column} />
      </div>
    </th>
  );

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header Controls */}
      <div className="p-6 border-b border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Task List</h2>
            <p className="text-sm text-gray-600 mt-1">{filteredAndSortedTasks.length} tasks found</p>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className={`text-sm font-medium ${isConnected ? 'text-emerald-700' : 'text-gray-600'}`}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Column Settings */}
          <div className="relative">
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Columns
            </button>

            {showColumnSettings && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 min-w-max">
                <div className="space-y-2">
                  {Object.entries(visibleColumns).map(([col, visible]) => (
                    <label key={col} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => toggleColumnVisibility(col)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {col === 'taskCode' && 'Task Code'}
                        {col === 'startDate' && 'Start Date'}
                        {col === 'endDate' && 'Due Date'}
                        {col !== 'taskCode' && col !== 'startDate' && col !== 'endDate' && col}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-10 text-center">#</th>

              {visibleColumns.taskCode && (
                <ColumnHeader column="taskCode" label="Code" />
              )}

              {visibleColumns.name && (
                <ColumnHeader column="name" label="Task Name" />
              )}

              {visibleColumns.status && (
                <ColumnHeader column="status" label="Status" />
              )}

              {visibleColumns.priority && (
                <ColumnHeader column="priority" label="Priority" />
              )}

              {visibleColumns.assignee && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-100">
                  Assignee
                </th>
              )}

              {visibleColumns.startDate && (
                <ColumnHeader column="startDate" label="Start Date" />
              )}

              {visibleColumns.endDate && (
                <ColumnHeader column="endDate" label="Due Date" />
              )}

              {visibleColumns.progress && (
                <ColumnHeader column="progress" label="Progress" />
              )}

              {visibleColumns.risk && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-100">
                  Risk Level
                </th>
              )}

              {visibleColumns.budget && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-100">
                  Budget
                </th>
              )}

              <th className="px-6 py-3 w-10 text-center text-xs font-semibold text-gray-700 bg-gray-100">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedTasks.length === 0 ? (
              <tr>
                <td colSpan="12" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="font-medium text-lg mb-1">No tasks found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedTasks.map((task, index) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => openTaskDrawer(task)}
                >
                  <td className="px-4 py-3 text-center text-gray-600 font-medium">
                    {index + 1}
                  </td>

                  {visibleColumns.taskCode && (
                    <td className="px-6 py-3">
                      <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {task.taskCode || '-'}
                      </span>
                    </td>
                  )}

                  {visibleColumns.name && (
                    <td className="px-6 py-3">
                      <div className="max-w-xs">
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {task.name}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </td>
                  )}

                  {visibleColumns.status && (
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </td>
                  )}

                  {visibleColumns.priority && (
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                  )}

                  {visibleColumns.assignee && (
                    <td className="px-6 py-3">
                      {task.assigneeName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(task.assigneeName)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {task.assigneeName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Unassigned</span>
                      )}
                    </td>
                  )}

                  {visibleColumns.startDate && (
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {task.startDate ? format(new Date(task.startDate), 'MMM dd, yyyy') : '-'}
                    </td>
                  )}

                  {visibleColumns.endDate && (
                    <td className="px-6 py-3">
                      <div className={`text-sm font-medium ${isOverdue(task.endDate) ? 'text-red-600' : 'text-gray-600'}`}>
                        {task.endDate ? format(new Date(task.endDate), 'MMM dd, yyyy') : '-'}
                        {isOverdue(task.endDate) && (
                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </td>
                  )}

                  {visibleColumns.progress && (
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              task.progress >= 80 ? 'bg-emerald-500' :
                              task.progress >= 50 ? 'bg-blue-500' :
                              task.progress >= 25 ? 'bg-amber-500' : 'bg-red-400'
                            }`}
                            style={{ width: `${task.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold ${getProgressColor(task.progress || 0)}`}>
                          {Math.round(task.progress || 0)}%
                        </span>
                      </div>
                    </td>
                  )}

                  {visibleColumns.risk && (
                    <td className="px-6 py-3">
                      {task.riskLevel ? (
                        <div className={`inline-flex items-center gap-1 font-semibold text-sm ${getRiskColor(task.riskLevel)}`}>
                          {task.riskLevel === 'CRITICAL' && <AlertTriangle className="w-4 h-4" />}
                          {task.riskLevel === 'HIGH' && <Zap className="w-4 h-4" />}
                          {task.riskLevel}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                  )}

                  {visibleColumns.budget && (
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {task.estimatedCost ? (
                        <div className="font-medium">
                          <span>₹{(Number(task.estimatedCost) / 100000).toFixed(1)}L</span>
                          {task.actualCost > 0 && (
                            <span className="text-gray-500 text-xs"> / ₹{(Number(task.actualCost) / 100000).toFixed(1)}L</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  )}

                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openTaskDrawer(task);
                      }}
                      className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing <span className="font-semibold">{filteredAndSortedTasks.length}</span> of <span className="font-semibold">{tasks.length}</span> tasks
        </div>
        <div className="flex gap-6">
          <div>
            <span className="font-semibold">{tasks.filter(t => t.status === 'COMPLETED').length}</span> completed
          </div>
          <div>
            <span className="font-semibold">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</span> in progress
          </div>
          <div>
            <span className="font-semibold">{tasks.filter(t => t.status === 'BLOCKED' || t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length}</span> at risk
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListView;
