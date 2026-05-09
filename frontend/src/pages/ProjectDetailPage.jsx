import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RotateCcw, Save, Target, TrendingUp, X, UserPlus, Mail, Shield } from 'lucide-react';
import projectService from '../services/project.service';
import taskService from '../services/task.service';

const clampProgress = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(100, Math.max(0, numericValue));
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Get tab from URL query params if available
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [progressDraft, setProgressDraft] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('VIEWER');
  const [addingMember, setAddingMember] = useState(false);

  const loadProjectData = useCallback(async () => {
    // Check if ID is valid
    if (!id || id === 'null' || id === 'undefined') {
      toast.error('Invalid project ID');
      navigate('/projects');
      return;
    }

    try {
      setLoading(true);
      const [projectResponse, tasksResponse] = await Promise.all([
        projectService.getById(id),
        taskService.getAll({ projectId: id })
      ]);

      setProject(projectResponse.data.project);
      setTasks(tasksResponse.data.tasks || []);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project details');
      if (error.response?.status === 404) {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  useEffect(() => {
    if (project) {
      setProgressDraft(clampProgress(project.progress));
    }
  }, [project]);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    const colors = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      completed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    };
    return colors[statusLower] || colors.planning;
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Planning';
    const statusLower = status.toLowerCase();
    const labels = {
      active: 'Active',
      planning: 'Planning',
      completed: 'Completed',
      on_hold: 'On Hold'
    };
    return labels[statusLower] || status;
  };

  const getTaskStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      BLOCKED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status] || colors.PENDING;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'text-gray-600 dark:text-gray-400',
      MEDIUM: 'text-yellow-600 dark:text-yellow-400',
      HIGH: 'text-orange-600 dark:text-orange-400',
      CRITICAL: 'text-red-600 dark:text-red-400'
    };
    return colors[priority] || colors.MEDIUM;
  };

  const handleProgressSave = async () => {
    const nextProgress = clampProgress(progressDraft);

    try {
      setSavingProgress(true);
      const response = await projectService.update(id, { progress: nextProgress });
      setProject(response.data.project);
      setProgressDraft(nextProgress);
      toast.success('Project progress updated');
    } catch (error) {
      console.error('Failed to update project progress:', error);
      toast.error('Failed to update project progress');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!memberEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setAddingMember(true);
      await projectService.addMember(id, {
        email: memberEmail.trim(),
        role: memberRole
      });
      toast.success('Team member added successfully');
      setShowAddMemberModal(false);
      setMemberEmail('');
      setMemberRole('VIEWER');
      loadProjectData(); // Reload to show new member
    } catch (error) {
      console.error('Failed to add team member:', error);
      toast.error(error.response?.data?.message || 'Failed to add team member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      await projectService.removeMember(id, memberId);
      toast.success('Team member removed');
      loadProjectData(); // Reload to update list
    } catch (error) {
      console.error('Failed to remove team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Project not found</p>
        <button onClick={() => navigate('/projects')} className="btn-primary mt-4">
          Back to Projects
        </button>
      </div>
    );
  }

  const budgetPercentage = project.budget > 0 ? (parseFloat(project.spentAmount || 0) / parseFloat(project.budget)) * 100 : 0;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const projectProgress = clampProgress(project.progress);
  const progressChanged = Math.abs(progressDraft - projectProgress) > 0.01;
  const progressDelta = Math.round(progressDraft - taskCompletionRate);
  const progressComparisonText = progressDelta === 0
    ? 'Manual progress matches task completion.'
    : `Manual progress is ${Math.abs(progressDelta)}% ${progressDelta > 0 ? 'ahead of' : 'behind'} task completion.`;
  const progressQuickValues = [0, 25, 50, 75, 100];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {getStatusLabel(project.status)}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{project.description || 'No description'}</p>
            {project.location && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">📍 {project.location}</p>
            )}
          </div>
          <button onClick={() => navigate('/projects')} className="btn-ghost">
            ← Back to Projects
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
            <p className="text-2xl font-bold">{parseFloat(project.progress || 0).toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
            <p className="text-2xl font-bold">₹{parseFloat(project.budget || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tasks</p>
            <p className="text-2xl font-bold">{tasks.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{completedTasks} completed</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Team Size</p>
            <p className="text-2xl font-bold">{project.members?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          {['overview', 'tasks', 'team', 'budget'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Progress Overview */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Project Progress</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tasks.length > 0
                        ? `${completedTasks} of ${tasks.length} tasks completed`
                        : 'No tasks have been added yet'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>{Math.round(progressDraft)}%</span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span className="font-semibold">{Math.round(progressDraft)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary-600 h-3 rounded-full transition-all"
                        style={{ width: `${progressDraft}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_120px] gap-4 mt-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={progressDraft}
                        onChange={(event) => setProgressDraft(clampProgress(event.target.value))}
                        className="w-full accent-primary-600"
                        aria-label="Project progress"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={Math.round(progressDraft)}
                          onChange={(event) => setProgressDraft(clampProgress(event.target.value))}
                          className="input h-10 text-center"
                          aria-label="Project progress percentage"
                        />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">%</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {progressQuickValues.map(value => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setProgressDraft(value)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            Math.round(progressDraft) === value
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {value}%
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setProgressDraft(clampProgress(taskCompletionRate))}
                        disabled={tasks.length === 0}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                      >
                        <Target className="w-4 h-4" />
                        Match tasks
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {tasks.length > 0
                          ? progressComparisonText
                          : 'Add tasks to compare manual progress against completed work.'}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setProgressDraft(projectProgress)}
                          disabled={!progressChanged || savingProgress}
                          className="btn-ghost h-10"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={handleProgressSave}
                          disabled={!progressChanged || savingProgress}
                          className="btn-primary h-10"
                        >
                          {savingProgress ? (
                            <span className="spinner mr-2"></span>
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Task Completion</span>
                      <span className="font-semibold">{taskCompletionRate.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${taskCompletionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Start Date</span>
                      <span className="font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">End Date</span>
                      <span className="font-medium">{new Date(project.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                      <span className="font-medium">
                        {Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Project Manager</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-semibold">
                        {project.creator?.firstName?.[0]}{project.creator?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{project.creator?.firstName} {project.creator?.lastName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{project.creator?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">Pending Tasks</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {tasks.filter(t => t.status === 'PENDING').length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {completedTasks}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">Blocked</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {tasks.filter(t => t.status === 'BLOCKED').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Project Tasks</h3>
                <button className="btn-primary" onClick={() => navigate('/tasks')}>
                  View All Tasks
                </button>
              </div>
              {tasks.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No tasks found</p>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 10).map(task => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => navigate(`/tasks?task=${task.id}`)}
                      className="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{task.name}</h4>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                      )}
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                        <span>Due: {new Date(task.endDate).toLocaleDateString()}</span>
                        {task.estimatedHours && <span>{task.estimatedHours}h estimated</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage team members and their roles
                  </p>
                </div>
                <button
                  className="btn-primary inline-flex items-center gap-2"
                  onClick={() => setShowAddMemberModal(true)}
                >
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </button>
              </div>
              {project.members?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="bg-white dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <UserPlus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-base font-semibold mb-2">No Team Members Yet</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-sm mx-auto">
                    Start building your team by adding members to this project.
                  </p>
                  <button
                    className="btn-primary inline-flex items-center gap-2"
                    onClick={() => setShowAddMemberModal(true)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add First Member
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.members?.map(member => (
                    <div key={member.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold">
                            {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {member.user?.firstName} {member.user?.lastName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {member.user?.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                              <Shield className="w-3 h-3" />
                              {member.role}
                            </span>
                            {member.joinedAt && (
                              <span className="text-xs text-gray-500">
                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Total Budget</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                      ₹{parseFloat(project.budget || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">Spent</p>
                    <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                      ₹{parseFloat(project.spentAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-2">Remaining</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                      ₹{(parseFloat(project.budget || 0) - parseFloat(project.spentAmount || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Budget Utilization</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Budget Used</span>
                    <span className="font-semibold">{budgetPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        budgetPercentage > 90 ? 'bg-red-600' : budgetPercentage > 75 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    ></div>
                  </div>
                  {budgetPercentage > 90 && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">⚠️ Budget utilization is high</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No expenses recorded yet. Expenses will appear here once added.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowAddMemberModal(false)}
          ></div>

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Team Member</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Invite a member to this project</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddMember} className="p-6 space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="member@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    The user must have an account with this email
                  </p>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Role *
                  </label>
                  <div className="relative">
                    <Shield className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="ADMIN">Admin - Full project access</option>
                      <option value="MANAGER">Manager - Can manage tasks and team</option>
                      <option value="MEMBER">Member - Can work on assigned tasks</option>
                      <option value="VIEWER">Viewer - Read-only access</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    Defines what this member can do in the project
                  </p>
                </div>

                {/* Role Permissions Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2">
                    📋 {memberRole} Permissions:
                  </p>
                  <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                    {memberRole === 'ADMIN' && (
                      <>
                        <li>• Full project management access</li>
                        <li>• Can add/remove team members</li>
                        <li>• Can delete project</li>
                      </>
                    )}
                    {memberRole === 'MANAGER' && (
                      <>
                        <li>• Create and assign tasks</li>
                        <li>• Manage project settings</li>
                        <li>• View all reports</li>
                      </>
                    )}
                    {memberRole === 'MEMBER' && (
                      <>
                        <li>• Work on assigned tasks</li>
                        <li>• Submit reports and updates</li>
                        <li>• View project progress</li>
                      </>
                    )}
                    {memberRole === 'VIEWER' && (
                      <>
                        <li>• View project details</li>
                        <li>• View tasks and progress</li>
                        <li>• Cannot make changes</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingMember || !memberEmail.trim()}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors inline-flex items-center justify-center gap-2"
                  >
                    {addingMember ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Add Member
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectDetailPage;
