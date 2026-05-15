import { useState, useEffect } from 'react';
import {
  LayoutGrid, Calendar, CheckSquare, FileText, FolderTree, BarChart3,
  List, ListTodo, Clock, CheckCircle2, AlertCircle, Users, Zap
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import TaskBoard from '../components/TaskManagement/TaskBoard';
import TaskDetailDrawer from '../components/TaskManagement/TaskDetailDrawer';
import ApprovalDashboard from '../components/TaskManagement/ApprovalDashboard';
import DailyProgressForm from '../components/TaskManagement/DailyProgressForm';
import GanttChart from '../components/TaskManagement/GanttChart';
import PhaseManagement from '../components/TaskManagement/PhaseManagement';
import ProgressAnalytics from '../components/TaskManagement/ProgressAnalytics';
import ListView from '../components/TaskManagement/ListView';
import projectService from '../services/project.service';
import useTaskStore from '../stores/taskStore';
import useSocket from '../hooks/useSocket';

/**
 * TasksPage - Enterprise Task Management
 * Complete page with Board, Gantt, Phases, Approvals, Reports, and Analytics
 */
const TasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [selectedTaskForProgress, setSelectedTaskForProgress] = useState(null);

  const activeTab = searchParams.get('view') || 'board';

  // Initialize shared Socket.IO connection for the current project
  const socket = useSocket(currentProjectId);

  const { tasks } = useTaskStore();

  // Load projects and restore selected project from storage
  useEffect(() => {
    const projectIdFromStorage = localStorage.getItem('selectedProjectId');
    if (projectIdFromStorage) {
      setCurrentProjectId(projectIdFromStorage);
    }

    const loadProjects = async () => {
      setProjectsLoading(true);
      try {
        const response = await projectService.getAll({ limit: 100 });
        const projectList = response.data?.projects || [];
        setProjects(projectList);

        const storedId = localStorage.getItem('selectedProjectId');
        const validStoredId = storedId && projectList.some((project) => project.id === storedId);
        const initialProjectId = validStoredId ? storedId : projectList[0]?.id || null;

        if (initialProjectId) {
          setCurrentProjectId(initialProjectId);
          localStorage.setItem('selectedProjectId', initialProjectId);
        } else {
          setCurrentProjectId(null);
          localStorage.removeItem('selectedProjectId');
        }
      } catch (error) {
        console.error('Failed to load projects', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('selectedProjectId', currentProjectId);
    }
  }, [currentProjectId]);

  const setActiveTab = (tab) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', tab);
    setSearchParams(params);
  };

  const tabs = [
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'list', label: 'List View', icon: List },
    { id: 'gantt', label: 'Timeline', icon: Calendar },
    { id: 'phases', label: 'Phases', icon: FolderTree },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  // Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    blockedOrAtRisk: tasks.filter(t => t.status === 'BLOCKED' || t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100) : 0
  };

  const openProgressForm = (taskId) => {
    setSelectedTaskForProgress(taskId);
    setShowProgressForm(true);
  };

  const closeProgressForm = () => {
    setShowProgressForm(false);
    setSelectedTaskForProgress(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
              <p className="text-slate-300 text-sm mt-1">Manage and track project deliverables</p>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <label className="text-sm text-slate-300 font-medium">Project</label>
                <div>
                  <select
                    value={currentProjectId || ''}
                    onChange={(e) => setCurrentProjectId(e.target.value)}
                    disabled={projectsLoading || projects.length === 0}
                    className="mt-2 sm:mt-0 w-full sm:w-72 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    {projectsLoading ? (
                      <option>Loading projects...</option>
                    ) : projects.length === 0 ? (
                      <option value="">No projects available</option>
                    ) : (
                      [
                        <option key="placeholder" value="">Select a project</option>,
                        ...projects.map((project) => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        ))
                      ]
                    )}
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const taskId = tasks[0]?.id;
                if (taskId) {
                  openProgressForm(taskId);
                } else {
                  alert('No tasks available. Please create a task first.');
                }
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Submit Daily Report
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-xs font-medium tracking-wide">TOTAL TASKS</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <ListTodo className="w-8 h-8 text-slate-400" />
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-xs font-medium tracking-wide">IN PROGRESS</p>
                  <p className="text-3xl font-bold mt-1">{stats.inProgress}</p>
                </div>
                <Zap className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-xs font-medium tracking-wide">COMPLETED</p>
                  <p className="text-3xl font-bold mt-1">{stats.completed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-xs font-medium tracking-wide">AT RISK</p>
                  <p className="text-3xl font-bold mt-1">{stats.blockedOrAtRisk}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-4 border border-blue-400 border-opacity-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-100 text-xs font-medium tracking-wide">COMPLETION</p>
                  <p className="text-3xl font-bold mt-1">{stats.completionRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-white border-opacity-30 flex items-center justify-center">
                  <span className="text-lg font-semibold">{stats.completionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="flex border-t border-slate-700 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap relative group ${
                activeTab === tab.id
                  ? 'text-white bg-slate-700 bg-opacity-50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:bg-opacity-30'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto px-8 py-6">
          {activeTab === 'board' && (
            <TaskBoard projectId={currentProjectId} socket={socket} />
          )}

          {activeTab === 'list' && (
            <ListView projectId={currentProjectId} socket={socket} />
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
      </div>

      {/* Task Detail Drawer (Global) */}
      <TaskDetailDrawer projectId={currentProjectId} projectOptions={projects} />

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
