import { useState, useEffect } from 'react';
import { X, Edit2, Trash2, CheckCircle, Circle, MessageSquare, Paperclip, AlertTriangle, Package, Users, Calendar, DollarSign, TrendingUp, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import useTaskStore from '../../stores/taskStore';
import taskEnterpriseService from '../../services/task-enterprise.service';
import projectService from '../../services/project.service';

/**
 * TaskDetailDrawer Component
 * Full-featured task details sidebar with tabs for info, comments, checklist,
 * materials, dependencies, and progress reports
 */
const TaskDetailDrawer = ({ projectId }) => {
  const { selectedTask, isTaskDrawerOpen, closeTaskDrawer, updateTask, createTask } = useTaskStore();
  const [activeTab, setActiveTab] = useState('details');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [taskType, setTaskType] = useState('GENERAL');
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [location, setLocation] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [availableForAssignment, setAvailableForAssignment] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const isCreateMode = isTaskDrawerOpen && !selectedTask;

  useEffect(() => {
    if (isTaskDrawerOpen) {
      // Fetch project members for assignment
      if (projectId) {
        loadProjectMembers();
      }

      if (selectedTask) {
        loadTaskDetails();
        setName(selectedTask.name || '');
        setDescription(selectedTask.description || '');
        setPriority(selectedTask.priority || 'MEDIUM');
        setStartDate(selectedTask.startDate ? selectedTask.startDate.split('T')[0] : '');
        setEndDate(selectedTask.endDate ? selectedTask.endDate.split('T')[0] : '');
        setTaskType(selectedTask.taskType || 'GENERAL');
        setRiskLevel(selectedTask.riskLevel || 'LOW');
        setEstimatedHours(selectedTask.estimatedHours || '');
        setEstimatedCost(selectedTask.estimatedCost || '');
        setLocation(selectedTask.location || '');
        setRequiresApproval(selectedTask.requiresApproval !== false);
        setAvailableForAssignment(selectedTask.availableForAssignment || false);
        setSelectedAssignees(selectedTask.assignments?.map(a => a.userId) || []);
      } else {
        const today = new Date().toISOString().slice(0, 10);
        setName('');
        setDescription('');
        setPriority('MEDIUM');
        setStartDate(today);
        setEndDate(today);
        setTaskType('GENERAL');
        setRiskLevel('LOW');
        setEstimatedHours('');
        setEstimatedCost('');
        setLocation('');
        setRequiresApproval(true);
        setAvailableForAssignment(false);
        setSelectedAssignees([]);
        setComments([]);
        setChecklist([]);
        setMaterials([]);
        setDependencies([]);
        setAlerts([]);
      }
    }
  }, [selectedTask, isTaskDrawerOpen, projectId]);

  const loadTaskDetails = async () => {
    if (!selectedTask) return;

    setLoading(true);
    try {
      // Load all task-related data in parallel
      const [commentsData, materialsData, dependenciesData, alertsData] = await Promise.all([
        taskEnterpriseService.getTaskComments(selectedTask.id).catch(() => []),
        taskEnterpriseService.getTaskMaterials(selectedTask.id).catch(() => []),
        taskEnterpriseService.getTaskDependencies(selectedTask.id).catch(() => []),
        taskEnterpriseService.getTaskAlerts(selectedTask.id).catch(() => [])
      ]);

      setComments(commentsData);
      setMaterials(materialsData);
      setDependencies(dependenciesData);
      setAlerts(alertsData);
      setChecklist(selectedTask.checklistItems || []);
    } catch (error) {
      console.error('Error loading task details:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectMembers = async () => {
    if (!projectId) return;

    setLoadingMembers(true);
    try {
      const response = await projectService.getMembers(projectId);
      const members = response.data?.members || [];
      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading project members:', error);
      // Don't show error toast as this is secondary data
    } finally {
      setLoadingMembers(false);
    }
  };

  const toggleAssignee = (userId) => {
    setSelectedAssignees(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const filteredTeamMembers = teamMembers.filter(member => {
    if (!memberSearchQuery.trim()) return true;
    const searchLower = memberSearchQuery.toLowerCase();
    const fullName = `${member.user?.firstName} ${member.user?.lastName}`.toLowerCase();
    const email = member.user?.email?.toLowerCase() || '';
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (!projectId) {
      toast.error('Please select a project before creating a task.');
      return;
    }

    if (!name.trim()) {
      toast.error('Task name is required.');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Start date and end date are required.');
      return;
    }

    setSaving(true);
    try {
      const taskData = {
        projectId,
        name: name.trim(),
        description: description.trim(),
        priority,
        status: 'DRAFT',
        taskType,
        startDate,
        endDate,
        riskLevel,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
        location: location.trim(),
        requiresApproval,
        availableForAssignment,
        assigneeIds: selectedAssignees
      };

      await createTask(taskData);

      toast.success('Task created successfully');
      closeTaskDrawer();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;

    try {
      const comment = await taskEnterpriseService.addComment(selectedTask.id, {
        content: newComment
      });
      setComments([comment, ...comments]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleToggleChecklistItem = async (itemId, completed) => {
    try {
      await taskEnterpriseService.toggleChecklistItem(itemId);
      setChecklist(checklist.map(item =>
        item.id === itemId ? { ...item, completed: !completed } : item
      ));
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      toast.error('Failed to update checklist');
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await taskEnterpriseService.acknowledgeAlert(alertId);
      setAlerts(alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
      toast.success('Alert acknowledged');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  if (!isTaskDrawerOpen) {
    return null;
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: Edit2 },
    { id: 'comments', label: 'Comments', icon: MessageSquare, count: comments.length },
    { id: 'checklist', label: 'Checklist', icon: CheckCircle, count: checklist.length },
    { id: 'materials', label: 'Materials', icon: Package, count: materials.length },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, count: alerts.filter(a => !a.resolved).length }
  ];

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700'
  };

  const statusColors = {
    PENDING: 'bg-gray-100 text-gray-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    UNDER_REVIEW: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-green-100 text-green-700',
    BLOCKED: 'bg-red-100 text-red-700'
  };

  const createForm = (
    <form onSubmit={handleCreateTask} className="space-y-6">
      {/* BASIC INFORMATION SECTION */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task in detail. Include scope, deliverables, and any special instructions."
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GENERAL">General</option>
                <option value="INSPECTION">Inspection</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="INSTALLATION">Installation</option>
                <option value="APPROVAL">Approval</option>
                <option value="REVIEW">Review</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SCHEDULING SECTION */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Schedule</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours (duration)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="e.g., 40 hours"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Total hours needed to complete this task</p>
          </div>
        </div>
      </div>

      {/* PRIORITY & RISK SECTION */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Priority & Risk</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">🟢 Low</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="HIGH">🟠 High</option>
              <option value="CRITICAL">🔴 Critical</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Impact on project timeline</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">🟢 Low Risk</option>
              <option value="MEDIUM">🟡 Medium Risk</option>
              <option value="HIGH">🟠 High Risk</option>
              <option value="CRITICAL">🔴 Critical Risk</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Potential complications or uncertainties</p>
          </div>
        </div>
      </div>

      {/* BUDGET SECTION */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Budget</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost (₹)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="e.g., 50000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Budget allocated for this task</p>
        </div>
      </div>

      {/* LOCATION SECTION */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Location</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Building A, Floor 2, Room 201"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Specific location where this task will be executed</p>
        </div>
      </div>

      {/* TEAM ASSIGNMENT SECTION */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">👥 Assign to Team</h3>
          {selectedAssignees.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {selectedAssignees.length} selected
            </span>
          )}
        </div>

        <div>
          {loadingMembers ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-sm text-gray-500">Loading team members...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-2">No Team Members Yet</h4>
              <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
                Add team members to your project first to assign them to tasks.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeTaskDrawer();
                  window.location.href = `/projects/${projectId}?tab=team`;
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Go to Team Settings
              </button>
              <p className="text-xs text-gray-500 mt-3">You can continue without assigning and assign later</p>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search team members by name or email..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Users className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  {memberSearchQuery && (
                    <button
                      onClick={() => setMemberSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  {filteredTeamMembers.length} of {teamMembers.length} member(s) shown
                </p>
              </div>

              {/* Team Members List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredTeamMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No members match your search</p>
                  </div>
                ) : (
                  filteredTeamMembers.map(member => {
                    const isSelected = selectedAssignees.includes(member.user?.id);
                    return (
                      <label
                        key={member.id}
                        className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAssignee(member.user?.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />

                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                        }`}>
                          {getInitials(member.user?.firstName, member.user?.lastName)}
                        </div>

                        {/* Member Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                            {member.user?.firstName} {member.user?.lastName}
                          </p>
                          <p className={`text-xs truncate ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                            {member.user?.email}
                          </p>
                          {member.role && (
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                              isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {member.role}
                            </span>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                      </label>
                    );
                  })
                )}
              </div>

              {/* Selection Summary */}
              {selectedAssignees.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        {selectedAssignees.length} team member{selectedAssignees.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAssignees([])}
                      className="text-sm text-blue-700 hover:text-blue-900 font-medium underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    {selectedAssignees.length === 1 ? 'This member' : 'These members'} will be assigned to the task
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* SETTINGS SECTION */}
      <div className="pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Settings</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-700">Requires Approval</span>
              <p className="text-xs text-gray-500">Task must be approved before starting</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={availableForAssignment}
              onChange={(e) => setAvailableForAssignment(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-700">Available for Assignment</span>
              <p className="text-xs text-gray-500">Can be assigned to team members</p>
            </div>
          </label>
        </div>
      </div>

      {/* FORM ACTIONS */}
      <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t">
        <button
          type="button"
          onClick={closeTaskDrawer}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name.trim() || !startDate || !endDate}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {saving ? '⏳ Creating...' : '✨ Create Task'}
        </button>
      </div>
    </form>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeTaskDrawer}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {isCreateMode ? 'Create Task' : selectedTask.name}
            </h2>
            {!isCreateMode && selectedTask.taskCode && (
              <p className="text-sm text-gray-500 mt-1">{selectedTask.taskCode}</p>
            )}
          </div>
          <button
            onClick={closeTaskDrawer}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {!isCreateMode && (
          <div className="flex border-b border-gray-200 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (isCreateMode ? createForm : (
            <>
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Status & Priority */}
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded ${statusColors[selectedTask.status]}`}>
                      {selectedTask.status?.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded ${priorityColors[selectedTask.priority]}`}>
                      {selectedTask.priority} Priority
                    </span>
                    {selectedTask.isCriticalPath && (
                      <span className="px-3 py-1 text-sm font-medium rounded bg-red-100 text-red-700">
                        Critical Path
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {selectedTask.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700">{selectedTask.description}</p>
                    </div>
                  )}

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">Progress</h3>
                      <span className="text-sm font-medium text-gray-900">{Math.round(selectedTask.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-blue-600 transition-all"
                        style={{ width: `${selectedTask.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Assignee */}
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Assignee</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedTask.assigneeName || 'Unassigned'}
                        </p>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedTask.startDate ? format(new Date(selectedTask.startDate), 'MMM dd, yyyy') : 'Not set'}
                        </p>
                      </div>
                    </div>

                    {/* End Date */}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedTask.endDate ? format(new Date(selectedTask.endDate), 'MMM dd, yyyy') : 'Not set'}
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedTask.duration ? `${selectedTask.duration} days` : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Budget</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Estimated</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{Number(selectedTask.estimatedCost || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Actual</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{Number(selectedTask.actualCost || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Variance</p>
                        <p className={`text-lg font-semibold ${
                          selectedTask.actualCost > selectedTask.estimatedCost ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ₹{Number((selectedTask.actualCost || 0) - (selectedTask.estimatedCost || 0)).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No comments yet</p>
                    ) : (
                      comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{comment.userName}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Checklist Tab */}
              {activeTab === 'checklist' && (
                <div className="space-y-3">
                  {checklist.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No checklist items</p>
                  ) : (
                    checklist.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleToggleChecklistItem(item.id, item.completed)}
                      >
                        {item.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.title}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Materials Tab */}
              {activeTab === 'materials' && (
                <div className="space-y-3">
                  {materials.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No materials assigned</p>
                  ) : (
                    materials.map(material => (
                      <div key={material.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{material.materialName}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Quantity: {material.requiredQuantity} {material.unit}
                            </p>
                            <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                              material.reservationStatus === 'RESERVED' ? 'bg-green-100 text-green-700' :
                              material.reservationStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {material.reservationStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Alerts Tab */}
              {activeTab === 'alerts' && (
                <div className="space-y-3">
                  {alerts.filter(a => !a.resolved).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No active alerts</p>
                  ) : (
                    alerts.filter(a => !a.resolved).map(alert => (
                      <div key={alert.id} className={`rounded-lg p-4 border-l-4 ${
                        alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-500' :
                        alert.severity === 'WARNING' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className={`w-5 h-5 ${
                                alert.severity === 'CRITICAL' ? 'text-red-600' :
                                alert.severity === 'WARNING' ? 'text-yellow-600' :
                                'text-blue-600'
                              }`} />
                              <span className={`text-xs font-medium ${
                                alert.severity === 'CRITICAL' ? 'text-red-700' :
                                alert.severity === 'WARNING' ? 'text-yellow-700' :
                                'text-blue-700'
                              }`}>
                                {alert.severity}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900">{alert.message}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                          {!alert.acknowledged && (
                            <button
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              className="ml-4 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ))}
        </div>
      </div>
    </>
  );
};

export default TaskDetailDrawer;
