import { Clock, AlertTriangle, CheckCircle, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

/**
 * TaskCard Component
 * Displays a task card in the Kanban board with drag-and-drop support
 */
const TaskCard = ({ task, onDragStart, onClick }) => {
  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700'
  };

  const riskColors = {
    LOW: 'text-green-600',
    MEDIUM: 'text-yellow-600',
    HIGH: 'text-orange-600',
    CRITICAL: 'text-red-600'
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const isOverdue = task.endDate && new Date(task.endDate) < new Date();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {task.name}
          </h4>
          {task.taskCode && (
            <p className="text-xs text-gray-500 mt-1">{task.taskCode}</p>
          )}
        </div>

        {/* Priority Badge */}
        <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Progress Bar */}
      {task.progress !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span className="font-medium">{Math.round(task.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(task.progress)}`}
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-2">
        {/* Dates */}
        {task.endDate && (
          <div className={`flex items-center gap-2 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>Due: {format(new Date(task.endDate), 'MMM dd, yyyy')}</span>
            {isOverdue && (
              <span className="text-red-600 font-medium">(Overdue)</span>
            )}
          </div>
        )}

        {/* Assignee */}
        {task.assigneeName && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Users className="w-3.5 h-3.5" />
            <span>{task.assigneeName}</span>
          </div>
        )}

        {/* Critical Path Indicator */}
        {task.isCriticalPath && (
          <div className="flex items-center gap-2 text-xs text-red-600 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Critical Path</span>
          </div>
        )}

        {/* Risk Level */}
        {task.riskLevel && task.riskLevel !== 'LOW' && (
          <div className={`flex items-center gap-2 text-xs font-medium ${riskColors[task.riskLevel]}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{task.riskLevel} Risk</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        {/* Budget */}
        {task.estimatedCost && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">₹{Number(task.estimatedCost).toLocaleString('en-IN')}</span>
            {task.actualCost > 0 && (
              <span className="text-gray-500"> / ₹{Number(task.actualCost).toLocaleString('en-IN')}</span>
            )}
          </div>
        )}

        {/* Checklist Progress */}
        {task.checklistItems && task.checklistItems.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>
              {task.checklistItems.filter(item => item.completed).length}/{task.checklistItems.length}
            </span>
          </div>
        )}

        {/* Material Readiness */}
        {task.materialReadinessStatus && task.materialReadinessStatus !== 'READY' && (
          <div className="flex items-center gap-1 text-xs text-orange-600">
            <Clock className="w-3.5 h-3.5" />
            <span>Materials Pending</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
