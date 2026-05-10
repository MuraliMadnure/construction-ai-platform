import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import projectService from '../services/project.service';

const ProjectsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [projectToClose, setProjectToClose] = useState(null);
  const [closeReason, setCloseReason] = useState('COMPLETED');
  const [closeRemarks, setCloseRemarks] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'PLANNING',
    projectType: 'RESIDENTIAL',
    priority: 'MEDIUM',

    // Client Information
    clientName: '',
    clientContact: '',
    clientEmail: '',
    clientAddress: '',

    // Contractor Information
    contractorName: '',
    contractorContact: '',
    contractorLicense: '',

    // Project Specifications
    totalArea: '',
    builtUpArea: '',
    numberOfFloors: '',
    numberOfUnits: '',
    constructionType: 'RCC',

    // Team
    projectManager: '',
    siteEngineer: '',
    architectName: '',
    estimatedWorkers: '',

    // Compliance & Safety
    safetyRequirements: '',
    environmentalRequirements: '',
    permits: '',
    qualityStandards: 'IS_CODES',

    // Financial
    paymentTerms: '',
    contractType: 'LUMP_SUM',
    warrantyPeriod: '12',

    // Additional
    riskLevel: 'LOW',
    insuranceDetails: '',
    remarks: ''
  });

  const [currentSection, setCurrentSection] = useState(0);

  // Fetch projects from API
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectService.create(formData);
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      setCurrentSection(0);
      setFormData({
        // Basic Information
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        budget: '',
        status: 'PLANNING',
        projectType: 'RESIDENTIAL',
        priority: 'MEDIUM',
        clientName: '',
        clientContact: '',
        clientEmail: '',
        clientAddress: '',
        contractorName: '',
        contractorContact: '',
        contractorLicense: '',
        totalArea: '',
        builtUpArea: '',
        numberOfFloors: '',
        numberOfUnits: '',
        constructionType: 'RCC',
        projectManager: '',
        siteEngineer: '',
        architectName: '',
        estimatedWorkers: '',
        safetyRequirements: '',
        environmentalRequirements: '',
        permits: '',
        qualityStandards: 'IS_CODES',
        paymentTerms: '',
        contractType: 'LUMP_SUM',
        warrantyPeriod: '12',
        riskLevel: 'LOW',
        insuranceDetails: '',
        remarks: ''
      });
      loadProjects(); // Reload projects
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleCloseProject = async () => {
    if (!projectToClose) return;
    try {
      await projectService.update(projectToClose.id, {
        status: closeReason,
        closedAt: new Date().toISOString(),
        closeRemarks: closeRemarks
      });
      toast.success(`Project ${closeReason === 'COMPLETED' ? 'completed' : 'cancelled'} successfully!`);
      setShowCloseModal(false);
      setProjectToClose(null);
      setCloseReason('COMPLETED');
      setCloseRemarks('');
      loadProjects();
    } catch (error) {
      console.error('Failed to close project:', error);
      toast.error(error.response?.data?.message || 'Failed to close project');
    }
  };

  const openEditModal = (project) => {
    const details = project.details || {};
    setEditData({
      id: project.id,
      name: project.name || '',
      description: project.description || '',
      location: project.location || '',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      budget: project.budget || '',
      status: project.status || 'PLANNING',
      projectType: details.projectType || 'RESIDENTIAL',
      priority: details.priority || 'MEDIUM',
      clientName: details.clientName || '',
      clientContact: details.clientContact || '',
      clientEmail: details.clientEmail || '',
      contractorName: details.contractorName || '',
      contractorContact: details.contractorContact || '',
    });
    setShowEditModal(true);
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      const { id, ...updateData } = editData;
      await projectService.update(id, updateData);
      toast.success('Project updated successfully!');
      setShowEditModal(false);
      setEditData({});
      loadProjects();
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error(error.response?.data?.message || 'Failed to update project');
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    const colors = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      completed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
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
      on_hold: 'On Hold',
      cancelled: 'Cancelled'
    };
    return labels[statusLower] || status;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</h3>
          <p className="text-3xl font-bold mt-2">{projects.length}</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {projects.filter(p => p.status?.toUpperCase() === 'PLANNING').length} planning
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {projects.filter(p => p.status?.toUpperCase() === 'ACTIVE').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">In progress</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</h3>
          <p className="text-3xl font-bold mt-2">
            ₹{(projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0) / 100000).toFixed(1)}L
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Across all projects</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Progress</h3>
          <p className="text-3xl font-bold mt-2">
            {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + parseFloat(p.progress || 0), 0) / projects.length) : 0}%
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div
              className="bg-primary-600 h-1.5 rounded-full"
              style={{ width: `${projects.length > 0 ? projects.reduce((sum, p) => sum + parseFloat(p.progress || 0), 0) / projects.length : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <input
              type="text"
              placeholder="Search projects..."
              className="input flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="input md:w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            className="btn-primary whitespace-nowrap"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map(project => {
          const progress = parseFloat(project.progress || 0);
          const isOverdue = project.endDate && new Date(project.endDate) < new Date() && progress < 100;
          return (
            <div key={project.id} className="card hover:shadow-lg transition-all hover:-translate-y-0.5 group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold truncate">{project.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{project.location || 'Location not set'}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className={`font-semibold ${isOverdue ? 'text-red-600' : ''}`}>
                      {progress.toFixed(0)}%
                      {isOverdue && <span className="text-xs ml-1">⚠ Overdue</span>}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${isOverdue ? 'bg-red-500' : 'bg-primary-600'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                    <p className="font-semibold text-sm">₹{(parseFloat(project.budget || 0) / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Timeline</p>
                    <p className="text-sm">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}
                      {' → '}
                      {project.endDate ? new Date(project.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tasks</p>
                    <p className="text-sm font-medium">{project._count?.tasks || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Team</p>
                    <p className="text-sm font-medium">{project._count?.members || 0} members</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Link to={`/projects/${project.id}`} className="btn-primary flex-1 text-center text-sm py-2">
                  Open
                </Link>
                <button className="btn-ghost text-sm py-2" onClick={() => openEditModal(project)}>Edit</button>
                {project.status?.toUpperCase() !== 'COMPLETED' && project.status?.toUpperCase() !== 'CANCELLED' && (
                  <button
                    className="btn-ghost text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm py-2"
                    onClick={() => {
                      setProjectToClose(project);
                      setShowCloseModal(true);
                    }}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="card text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No projects found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first project to get started'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button className="btn-primary mt-4" onClick={() => setShowCreateModal(true)}>
              + Create Project
            </button>
          )}
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Edit Project</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleEditProject} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name *</label>
                <input
                  type="text"
                  className="input"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    className="input"
                    value={editData.status}
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Type</label>
                  <select
                    className="input"
                    value={editData.projectType}
                    onChange={(e) => setEditData({...editData, projectType: e.target.value})}
                  >
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="INDUSTRIAL">Industrial</option>
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                    <option value="RENOVATION">Renovation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    className="input"
                    value={editData.priority}
                    onChange={(e) => setEditData({...editData, priority: e.target.value})}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  className="input"
                  value={editData.location}
                  onChange={(e) => setEditData({...editData, location: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    className="input"
                    value={editData.startDate}
                    onChange={(e) => setEditData({...editData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    className="input"
                    value={editData.endDate}
                    onChange={(e) => setEditData({...editData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Budget (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={editData.budget}
                  onChange={(e) => setEditData({...editData, budget: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="input"
                  rows="3"
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Client Name</label>
                  <input
                    type="text"
                    className="input"
                    value={editData.clientName}
                    onChange={(e) => setEditData({...editData, clientName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Client Contact</label>
                  <input
                    type="text"
                    className="input"
                    value={editData.clientContact}
                    onChange={(e) => setEditData({...editData, clientContact: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Contractor Name</label>
                  <input
                    type="text"
                    className="input"
                    value={editData.contractorName}
                    onChange={(e) => setEditData({...editData, contractorName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contractor Contact</label>
                  <input
                    type="text"
                    className="input"
                    value={editData.contractorContact}
                    onChange={(e) => setEditData({...editData, contractorContact: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Project Modal */}
      {showCloseModal && projectToClose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Close Project</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                You are closing: <span className="font-semibold text-gray-700 dark:text-gray-200">{projectToClose.name}</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Closure Type *</label>
                  <select
                    className="input"
                    value={closeReason}
                    onChange={(e) => setCloseReason(e.target.value)}
                  >
                    <option value="COMPLETED">Completed - Project finished successfully</option>
                    <option value="CANCELLED">Cancelled - Project terminated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Remarks</label>
                  <textarea
                    className="input"
                    rows="3"
                    placeholder="Reason for closing, final notes..."
                    value={closeRemarks}
                    onChange={(e) => setCloseRemarks(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                className="btn-ghost"
                onClick={() => {
                  setShowCloseModal(false);
                  setProjectToClose(null);
                  setCloseReason('COMPLETED');
                  setCloseRemarks('');
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium text-white ${
                  closeReason === 'COMPLETED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                onClick={handleCloseProject}
              >
                {closeReason === 'COMPLETED' ? 'Mark as Completed' : 'Cancel Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal - Comprehensive */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Create New Project</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Provide comprehensive project details for better management
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCurrentSection(0);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              {[
                { id: 0, label: '📋 Basic', icon: '📋' },
                { id: 1, label: '👤 Client', icon: '👤' },
                { id: 2, label: '🏗️ Contractor', icon: '🏗️' },
                { id: 3, label: '📐 Specifications', icon: '📐' },
                { id: 4, label: '👷 Team', icon: '👷' },
                { id: 5, label: '🛡️ Compliance', icon: '🛡️' },
                { id: 6, label: '💰 Financial', icon: '💰' }
              ].map(section => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setCurrentSection(section.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                    currentSection === section.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            {/* Form Content */}
            <form onSubmit={handleCreateProject} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Section 0: Basic Information */}
                {currentSection === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Basic Project Information</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Project Name *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="E.g., Green Valley Residential Complex"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Project Type *</label>
                        <select
                          className="input"
                          value={formData.projectType}
                          onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                          required
                        >
                          <option value="RESIDENTIAL">🏠 Residential</option>
                          <option value="COMMERCIAL">🏢 Commercial</option>
                          <option value="INDUSTRIAL">🏭 Industrial</option>
                          <option value="INFRASTRUCTURE">🌉 Infrastructure</option>
                          <option value="RENOVATION">🔧 Renovation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Status *</label>
                        <select
                          className="input"
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          required
                        >
                          <option value="PLANNING">Planning</option>
                          <option value="ACTIVE">Active</option>
                          <option value="ON_HOLD">On Hold</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Priority *</label>
                        <select
                          className="input"
                          value={formData.priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          required
                        >
                          <option value="LOW">🟢 Low</option>
                          <option value="MEDIUM">🟡 Medium</option>
                          <option value="HIGH">🟠 High</option>
                          <option value="CRITICAL">🔴 Critical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Location *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Complete address with city, state, PIN"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Start Date *</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Expected End Date *</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Budget (₹) *</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="Total project budget in rupees"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description *</label>
                      <textarea
                        className="input"
                        rows="4"
                        placeholder="Detailed project description, scope, and objectives..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* Section 1: Client Information */}
                {currentSection === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Client Information</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Client Name</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Individual or company name"
                        value={formData.clientName}
                        onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Contact Number</label>
                        <input
                          type="tel"
                          className="input"
                          placeholder="+91 XXXXX XXXXX"
                          value={formData.clientContact}
                          onChange={(e) => setFormData({...formData, clientContact: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <input
                          type="email"
                          className="input"
                          placeholder="client@example.com"
                          value={formData.clientEmail}
                          onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Client Address</label>
                      <textarea
                        className="input"
                        rows="3"
                        placeholder="Complete address of the client"
                        value={formData.clientAddress}
                        onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* Section 2: Contractor Information */}
                {currentSection === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Contractor Information</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Contractor Name</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Main contractor or firm name"
                        value={formData.contractorName}
                        onChange={(e) => setFormData({...formData, contractorName: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Contact Number</label>
                        <input
                          type="tel"
                          className="input"
                          placeholder="+91 XXXXX XXXXX"
                          value={formData.contractorContact}
                          onChange={(e) => setFormData({...formData, contractorContact: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">License Number</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="Contractor registration/license number"
                          value={formData.contractorLicense}
                          onChange={(e) => setFormData({...formData, contractorLicense: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 3: Project Specifications */}
                {currentSection === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Project Specifications</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Total Area (sq.ft)</label>
                        <input
                          type="number"
                          className="input"
                          placeholder="Total plot area"
                          value={formData.totalArea}
                          onChange={(e) => setFormData({...formData, totalArea: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Built-up Area (sq.ft)</label>
                        <input
                          type="number"
                          className="input"
                          placeholder="Total construction area"
                          value={formData.builtUpArea}
                          onChange={(e) => setFormData({...formData, builtUpArea: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Floors</label>
                        <input
                          type="number"
                          className="input"
                          placeholder="E.g., 5"
                          value={formData.numberOfFloors}
                          onChange={(e) => setFormData({...formData, numberOfFloors: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Units</label>
                        <input
                          type="number"
                          className="input"
                          placeholder="Apartments/shops"
                          value={formData.numberOfUnits}
                          onChange={(e) => setFormData({...formData, numberOfUnits: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Construction Type</label>
                        <select
                          className="input"
                          value={formData.constructionType}
                          onChange={(e) => setFormData({...formData, constructionType: e.target.value})}
                        >
                          <option value="RCC">RCC Frame</option>
                          <option value="STEEL">Steel Structure</option>
                          <option value="LOAD_BEARING">Load Bearing</option>
                          <option value="PREFAB">Prefab/Modular</option>
                          <option value="MIXED">Mixed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 4: Team Information */}
                {currentSection === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Project Team</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Project Manager</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="PM name or email"
                          value={formData.projectManager}
                          onChange={(e) => setFormData({...formData, projectManager: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Site Engineer</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="Engineer name or email"
                          value={formData.siteEngineer}
                          onChange={(e) => setFormData({...formData, siteEngineer: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Architect Name</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="Architect or firm name"
                          value={formData.architectName}
                          onChange={(e) => setFormData({...formData, architectName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Estimated Workers</label>
                        <input
                          type="number"
                          className="input"
                          placeholder="Average workforce count"
                          value={formData.estimatedWorkers}
                          onChange={(e) => setFormData({...formData, estimatedWorkers: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 5: Compliance & Safety */}
                {currentSection === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Compliance & Safety</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Safety Requirements</label>
                      <textarea
                        className="input"
                        rows="3"
                        placeholder="Safety protocols, PPE requirements, emergency procedures..."
                        value={formData.safetyRequirements}
                        onChange={(e) => setFormData({...formData, safetyRequirements: e.target.value})}
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Environmental Requirements</label>
                      <textarea
                        className="input"
                        rows="3"
                        placeholder="Environmental clearances, green building norms, waste management..."
                        value={formData.environmentalRequirements}
                        onChange={(e) => setFormData({...formData, environmentalRequirements: e.target.value})}
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Permits & Licenses</label>
                        <textarea
                          className="input"
                          rows="3"
                          placeholder="Building permits, NOCs, approvals obtained..."
                          value={formData.permits}
                          onChange={(e) => setFormData({...formData, permits: e.target.value})}
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Quality Standards</label>
                        <select
                          className="input"
                          value={formData.qualityStandards}
                          onChange={(e) => setFormData({...formData, qualityStandards: e.target.value})}
                        >
                          <option value="IS_CODES">IS Codes</option>
                          <option value="ISO_9001">ISO 9001</option>
                          <option value="LEED">LEED Certified</option>
                          <option value="GRIHA">GRIHA Rating</option>
                          <option value="CUSTOM">Custom Standards</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Risk Level</label>
                      <select
                        className="input"
                        value={formData.riskLevel}
                        onChange={(e) => setFormData({...formData, riskLevel: e.target.value})}
                      >
                        <option value="LOW">🟢 Low Risk</option>
                        <option value="MEDIUM">🟡 Medium Risk</option>
                        <option value="HIGH">🟠 High Risk</option>
                        <option value="CRITICAL">🔴 Critical Risk</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Section 6: Financial Details */}
                {currentSection === 6 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Financial Details</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Contract Type</label>
                      <select
                        className="input"
                        value={formData.contractType}
                        onChange={(e) => setFormData({...formData, contractType: e.target.value})}
                      >
                        <option value="LUMP_SUM">Lump Sum</option>
                        <option value="UNIT_RATE">Unit Rate</option>
                        <option value="COST_PLUS">Cost Plus</option>
                        <option value="TIME_MATERIAL">Time & Material</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Payment Terms</label>
                      <textarea
                        className="input"
                        rows="3"
                        placeholder="Payment schedule, milestones, retention terms..."
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Warranty Period (months)</label>
                        <input
                          type="number"
                          className="input"
                          placeholder="E.g., 12"
                          value={formData.warrantyPeriod}
                          onChange={(e) => setFormData({...formData, warrantyPeriod: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Insurance Details</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="Insurance policy numbers, coverage"
                          value={formData.insuranceDetails}
                          onChange={(e) => setFormData({...formData, insuranceDetails: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Remarks</label>
                      <textarea
                        className="input"
                        rows="4"
                        placeholder="Any additional information, special notes, or important details..."
                        value={formData.remarks}
                        onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Step {currentSection + 1} of 7
                  </div>
                  <div className="flex gap-3">
                    {currentSection > 0 && (
                      <button
                        type="button"
                        onClick={() => setCurrentSection(currentSection - 1)}
                        className="btn-ghost"
                      >
                        ← Previous
                      </button>
                    )}
                    {currentSection < 6 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentSection(currentSection + 1)}
                        className="btn-primary"
                      >
                        Next →
                      </button>
                    ) : (
                      <button type="submit" className="btn-primary">
                        ✓ Create Project
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => {
                        setShowCreateModal(false);
                        setCurrentSection(0);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default ProjectsPage;
