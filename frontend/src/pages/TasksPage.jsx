import { useState, useEffect } from 'react';
import { LayoutGrid, Calendar, CheckSquare, FileText, FolderTree, BarChart3 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import TaskBoard from '../components/TaskManagement/TaskBoard';
import TaskDetailDrawer from '../components/TaskManagement/TaskDetailDrawer';
import ApprovalDashboard from '../components/TaskManagement/ApprovalDashboard';
import DailyProgressForm from '../components/TaskManagement/DailyProgressForm';
import GanttChart from '../components/TaskManagement/GanttChart';
import PhaseManagement from '../components/TaskManagement/PhaseManagement';
import ProgressAnalytics from '../components/TaskManagement/ProgressAnalytics';
import useTaskStore from '../stores/taskStore';
import useSocket from '../hooks/useSocket';

/**
 * TasksPage - Enterprise Task Management
 * Complete page with Board, Gantt, Phases, Approvals, Reports, and Analytics
 */
const TasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [selectedTaskForProgress, setSelectedTaskForProgress] = useState(null);

  const activeTab = searchParams.get('view') || 'board';

  // Initialize shared Socket.IO connection for the current project
  const socket = useSocket(currentProjectId);

  const { tasks } = useTaskStore();

  // Get project ID from URL or localStorage
  useEffect(() => {
    const projectIdFromStorage = localStorage.getItem('selectedProjectId');
    if (projectIdFromStorage) {
      setCurrentProjectId(projectIdFromStorage);
    }
  }, []);

  const setActiveTab = (tab) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', tab);
    setSearchParams(params);
  };

  const tabs = [
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'gantt', label: 'Timeline', icon: Calendar },
    { id: 'phases', label: 'Phases', icon: FolderTree },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const openProgressForm = (taskId) => {
    setSelectedTaskForProgress(taskId);
    setShowProgressForm(true);
  };

  const closeProgressForm = () => {
    setShowProgressForm(false);
    setSelectedTaskForProgress(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const taskId = tasks[0]?.id;
                if (taskId) {
                  openProgressForm(taskId);
                } else {
                  alert('No tasks available. Please create a task first.');
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Submit Daily Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'board' && (
          <TaskBoard projectId={currentProjectId} socket={socket} />
        )}

        {activeTab === 'gantt' && (
          <GanttChart projectId={currentProjectId} socket={socket} />
        )}

        {activeTab === 'phases' && (
          <PhaseManagement projectId={currentProjectId} />
        )}

        {activeTab === 'approvals' && (
          <ApprovalDashboard />
        )}

        {activeTab === 'analytics' && (
          <ProgressAnalytics projectId={currentProjectId} />
        )}
      </div>

      {/* Task Detail Drawer (Global) */}
      <TaskDetailDrawer projectId={currentProjectId} />

      {/* Daily Progress Form Modal */}
      {showProgressForm && selectedTaskForProgress && (
        <DailyProgressForm
          taskId={selectedTaskForProgress}
          onClose={closeProgressForm}
        />
      )}
    </div>
  );
};

export default TasksPage;
