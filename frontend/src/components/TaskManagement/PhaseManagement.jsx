import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, FolderOpen, Folder, CheckSquare, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import useTaskStore from '../../stores/taskStore';
import taskEnterpriseService from '../../services/task-enterprise.service';

/**
 * PhaseManagement Component
 * WBS (Work Breakdown Structure) hierarchy editor
 * Drag-and-drop reorganization
 */
const PhaseManagement = ({ projectId }) => {
  const { phases, subphases, tasks, fetchPhases, fetchTasks, createPhase, updatePhase, removePhase } = useTaskStore();

  const [expandedPhases, setExpandedPhases] = useState(new Set());
  const [expandedSubphases, setExpandedSubphases] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('phase'); // phase, subphase, task
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    estimatedCost: ''
  });
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchPhases(projectId);
      fetchTasks(projectId);
    }
  }, [projectId]);

  // Toggle expand/collapse
  const togglePhase = (phaseId) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const toggleSubphase = (subphaseId) => {
    const newExpanded = new Set(expandedSubphases);
    if (newExpanded.has(subphaseId)) {
      newExpanded.delete(subphaseId);
    } else {
      newExpanded.add(subphaseId);
    }
    setExpandedSubphases(newExpanded);
  };

  // Open add modal
  const openAddModal = (type, parent = null) => {
    setModalType(type);
    setSelectedParent(parent);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      estimatedCost: ''
    });
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = (item, type) => {
    setModalType(type);
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
      estimatedCost: item.estimatedCost || ''
    });
    setShowAddModal(true);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === 'phase') {
        if (editingItem) {
          await taskEnterpriseService.updatePhase(editingItem.id, formData);
          updatePhase(editingItem.id, formData);
          toast.success('Phase updated successfully');
        } else {
          const newPhase = await createPhase(projectId, formData);
          toast.success('Phase created successfully');
        }
      } else if (modalType === 'subphase') {
        if (editingItem) {
          await taskEnterpriseService.updateSubphase(editingItem.id, formData);
          toast.success('Subphase updated successfully');
        } else {
          await taskEnterpriseService.createSubphase(selectedParent.id, formData);
          toast.success('Subphase created successfully');
        }
        fetchPhases(projectId); // Reload
      }

      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        estimatedCost: ''
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save');
    }
  };

  // Handle delete
  const handleDelete = async (item, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      if (type === 'phase') {
        await taskEnterpriseService.deletePhase(item.id);
        removePhase(item.id);
        toast.success('Phase deleted');
      } else if (type === 'subphase') {
        await taskEnterpriseService.deleteSubphase(item.id);
        toast.success('Subphase deleted');
        fetchPhases(projectId);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  // Calculate phase statistics
  const getPhaseStats = (phaseId) => {
    const phaseTasks = tasks.filter(t => t.phaseId === phaseId);
    const totalTasks = phaseTasks.length;
    const completedTasks = phaseTasks.filter(t => t.status === 'COMPLETED').length;
    const avgProgress = totalTasks > 0
      ? phaseTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / totalTasks
      : 0;
    const totalCost = phaseTasks.reduce((sum, t) => sum + Number(t.estimatedCost || 0), 0);

    return { totalTasks, completedTasks, avgProgress, totalCost };
  };

  const getSubphaseStats = (subphaseId) => {
    const subphaseTasks = tasks.filter(t => t.subphaseId === subphaseId);
    const totalTasks = subphaseTasks.length;
    const completedTasks = subphaseTasks.filter(t => t.status === 'COMPLETED').length;
    const avgProgress = totalTasks > 0
      ? subphaseTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / totalTasks
      : 0;

    return { totalTasks, completedTasks, avgProgress };
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Work Breakdown Structure</h2>
          <p className="text-sm text-gray-600 mt-1">Organize project phases, subphases, and tasks</p>
        </div>
        <button
          onClick={() => openAddModal('phase')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Phase
        </button>
      </div>

      {/* WBS Tree */}
      <div className="p-6">
        {phases.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No phases yet</p>
            <p className="text-sm mt-1">Create your first phase to organize tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {phases.map((phase) => {
              const isExpanded = expandedPhases.has(phase.id);
              const stats = getPhaseStats(phase.id);
              const phaseSubphases = subphases.filter(sp => sp.phaseId === phase.id);

              return (
                <div key={phase.id} className="border border-gray-200 rounded-lg">
                  {/* Phase Row */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className="p-1 hover:bg-blue-200 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-700" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      )}
                    </button>

                    <Folder className="w-5 h-5 text-blue-600" />

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                      {phase.description && (
                        <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-600">Tasks</div>
                        <div className="font-semibold">{stats.completedTasks}/{stats.totalTasks}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Progress</div>
                        <div className="font-semibold">{Math.round(stats.avgProgress)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Budget</div>
                        <div className="font-semibold">₹{(stats.totalCost / 100000).toFixed(1)}L</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-32">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all"
                          style={{ width: `${stats.avgProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openAddModal('subphase', phase)}
                        className="p-2 hover:bg-blue-200 rounded transition-colors"
                        title="Add Subphase"
                      >
                        <Plus className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => openEditModal(phase, 'phase')}
                        className="p-2 hover:bg-blue-200 rounded transition-colors"
                        title="Edit Phase"
                      >
                        <Edit2 className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDelete(phase, 'phase')}
                        className="p-2 hover:bg-red-100 rounded transition-colors"
                        title="Delete Phase"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Subphases */}
                  {isExpanded && phaseSubphases.length > 0 && (
                    <div className="ml-8 border-t border-gray-200">
                      {phaseSubphases.map((subphase) => {
                        const isSubExpanded = expandedSubphases.has(subphase.id);
                        const subStats = getSubphaseStats(subphase.id);
                        const subphaseTasks = tasks.filter(t => t.subphaseId === subphase.id);

                        return (
                          <div key={subphase.id} className="border-b border-gray-200 last:border-b-0">
                            {/* Subphase Row */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                              <button
                                onClick={() => toggleSubphase(subphase.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {isSubExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-700" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-700" />
                                )}
                              </button>

                              <Folder className="w-4 h-4 text-gray-600" />

                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{subphase.name}</h4>
                                {subphase.description && (
                                  <p className="text-xs text-gray-600 mt-1">{subphase.description}</p>
                                )}
                              </div>

                              {/* Subphase Stats */}
                              <div className="flex items-center gap-3 text-xs">
                                <div>
                                  <span className="text-gray-600">Tasks: </span>
                                  <span className="font-semibold">{subStats.completedTasks}/{subStats.totalTasks}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Progress: </span>
                                  <span className="font-semibold">{Math.round(subStats.avgProgress)}%</span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditModal(subphase, 'subphase')}
                                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                  title="Edit Subphase"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-gray-700" />
                                </button>
                                <button
                                  onClick={() => handleDelete(subphase, 'subphase')}
                                  className="p-1.5 hover:bg-red-100 rounded transition-colors"
                                  title="Delete Subphase"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                </button>
                              </div>
                            </div>

                            {/* Tasks under Subphase */}
                            {isSubExpanded && subphaseTasks.length > 0 && (
                              <div className="ml-8 bg-white">
                                {subphaseTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="flex items-center gap-3 p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                  >
                                    <CheckSquare className="w-4 h-4 text-gray-400" />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900">{task.name}</div>
                                    </div>
                                    <div className="text-xs text-gray-600">{Math.round(task.progress)}%</div>
                                    <div className="w-20">
                                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-green-500"
                                          style={{ width: `${task.progress}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tasks under Phase (no subphase) */}
                  {isExpanded && (
                    <div className="ml-8 border-t border-gray-200">
                      {tasks
                        .filter(t => t.phaseId === phase.id && !t.subphaseId)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                          >
                            <CheckSquare className="w-4 h-4 text-gray-400" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{task.name}</div>
                            </div>
                            <div className="text-xs text-gray-600">{Math.round(task.progress)}%</div>
                            <div className="w-20">
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500"
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowAddModal(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingItem ? `Edit ${modalType}` : `Add ${modalType}`}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter ${modalType} name`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="Optional description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {modalType === 'phase' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Budget (₹)</label>
                    <input
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingItem ? 'Update' : 'Create'}
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

export default PhaseManagement;
