import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, FileText, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import useApprovalStore from '../../stores/approvalStore';

/**
 * ApprovalDashboard Component
 * Displays pending approvals with quick approve/reject actions
 * Includes SLA tracking and priority indicators
 */
const ApprovalDashboard = () => {
  const {
    pendingApprovals,
    fetchPendingApprovals,
    approveWorkflow,
    rejectWorkflow,
    requestRevisionWorkflow,
    conditionalApprovalWorkflow,
    getOverdueApprovals,
    loading
  } = useApprovalStore();

  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('approve'); // approve, reject, revision, conditional
  const [comments, setComments] = useState('');
  const [conditions, setConditions] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  const overdueApprovals = getOverdueApprovals();

  const openModal = (approval, type) => {
    setSelectedApproval(approval);
    setModalType(type);
    setComments('');
    setConditions([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApproval(null);
    setComments('');
    setConditions([]);
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;

    setProcessing(true);
    try {
      await approveWorkflow(selectedApproval.workflowId, {
        comments,
        approvedAt: new Date().toISOString()
      });
      toast.success('Task approved successfully!');
      closeModal();
    } catch (error) {
      console.error('Error approving task:', error);
      toast.error('Failed to approve task');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval) return;

    if (!comments.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      await rejectWorkflow(selectedApproval.workflowId, {
        comments,
        rejectedAt: new Date().toISOString()
      });
      toast.error('Task rejected');
      closeModal();
    } catch (error) {
      console.error('Error rejecting task:', error);
      toast.error('Failed to reject task');
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!selectedApproval) return;

    if (!comments.trim()) {
      toast.error('Please specify what needs to be revised');
      return;
    }

    setProcessing(true);
    try {
      await requestRevisionWorkflow(selectedApproval.workflowId, {
        comments,
        revisionRequestedAt: new Date().toISOString()
      });
      toast.info('Revision requested');
      closeModal();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast.error('Failed to request revision');
    } finally {
      setProcessing(false);
    }
  };

  const handleConditionalApproval = async () => {
    if (!selectedApproval) return;

    if (conditions.length === 0) {
      toast.error('Please specify at least one condition');
      return;
    }

    setProcessing(true);
    try {
      await conditionalApprovalWorkflow(selectedApproval.workflowId, {
        conditions,
        comments,
        approvedAt: new Date().toISOString()
      });
      toast.success('Conditionally approved');
      closeModal();
    } catch (error) {
      console.error('Error conditionally approving:', error);
      toast.error('Failed to approve with conditions');
    } finally {
      setProcessing(false);
    }
  };

  const addCondition = () => {
    const condition = prompt('Enter condition:');
    if (condition) {
      setConditions([...conditions, condition]);
    }
  };

  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'normal':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getTimeRemaining = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return { text: 'Overdue', class: 'text-red-600 font-semibold' };
    } else if (diffHours < 24) {
      return { text: `${diffHours}h remaining`, class: 'text-orange-600 font-semibold' };
    } else {
      return { text: `${diffDays}d remaining`, class: 'text-gray-600' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingApprovals.length}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueApprovals.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-orange-600">
                {pendingApprovals.filter(a => a.priority === 'high' || a.priority === 'urgent').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Due Today</p>
              <p className="text-2xl font-bold text-green-600">
                {pendingApprovals.filter(a => {
                  if (!a.deadline) return false;
                  const today = new Date().toISOString().split('T')[0];
                  const deadlineDate = new Date(a.deadline).toISOString().split('T')[0];
                  return today === deadlineDate;
                }).length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Approval List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {pendingApprovals.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm mt-1">No pending approvals at the moment</p>
            </div>
          ) : (
            pendingApprovals.map((approval) => {
              const timeRemaining = getTimeRemaining(approval.deadline);

              return (
                <div key={approval.workflowId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    {/* Left Side - Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{approval.taskName}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(approval.priority)}`}>
                          {approval.priority?.toUpperCase()}
                        </span>
                        {approval.approvalType && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                            {approval.approvalType.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>Project: {approval.projectName || 'N/A'}</span>
                        <span>•</span>
                        <span>Requested: {format(new Date(approval.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                        {timeRemaining && (
                          <>
                            <span>•</span>
                            <span className={timeRemaining.class}>
                              <Clock className="w-4 h-4 inline mr-1" />
                              {timeRemaining.text}
                            </span>
                          </>
                        )}
                      </div>

                      {approval.estimatedCost && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Estimated Cost:</span>
                          <span className="font-semibold text-gray-900">
                            ₹{Number(approval.estimatedCost).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => openModal(approval, 'approve')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => openModal(approval, 'conditional')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Conditional Approval"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Conditional</span>
                      </button>

                      <button
                        onClick={() => openModal(approval, 'revision')}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        title="Request Revision"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Revise</span>
                      </button>

                      <button
                        onClick={() => openModal(approval, 'reject')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => {
                          // Navigate to task details
                          window.location.href = `/tasks/${approval.taskId}`;
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedApproval && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeModal}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalType === 'approve' && 'Approve Task'}
                  {modalType === 'reject' && 'Reject Task'}
                  {modalType === 'revision' && 'Request Revision'}
                  {modalType === 'conditional' && 'Conditional Approval'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{selectedApproval.taskName}</p>
              </div>

              <div className="p-6 space-y-4">
                {modalType === 'conditional' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conditions
                    </label>
                    <button
                      type="button"
                      onClick={addCondition}
                      className="mb-3 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Add Condition
                    </button>
                    <div className="space-y-2">
                      {conditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded">
                          <span className="flex-1 text-sm">{condition}</span>
                          <button
                            onClick={() => removeCondition(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments {modalType === 'reject' || modalType === 'revision' ? '*' : '(Optional)'}
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="4"
                    placeholder={
                      modalType === 'reject'
                        ? 'Provide reason for rejection...'
                        : modalType === 'revision'
                        ? 'Specify what needs to be revised...'
                        : 'Add optional comments...'
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  disabled={processing}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    modalType === 'approve'
                      ? handleApprove
                      : modalType === 'reject'
                      ? handleReject
                      : modalType === 'revision'
                      ? handleRequestRevision
                      : handleConditionalApproval
                  }
                  disabled={processing}
                  className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                    modalType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : modalType === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : modalType === 'revision'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {processing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApprovalDashboard;
