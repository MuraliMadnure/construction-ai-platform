import { Clock, AlertTriangle, CheckCircle, Users, Calendar, Zap, Flag } from 'lucide-react';
import { format } from 'date-fns';

/**
 * TaskCard Component - Enterprise Design
 * Displays a task card in the Kanban board with modern styling, avatars, and better info density
 */
const TaskCard = ({ task, columnId, onDragStart, onClick }) => {
  const priorityConfig = {
    LOW: { color: 'bg-blue-50 border-blue-200 text-blue-700', badge: 'bg-blue-100 text-blue-700', icon: '↓' },
    MEDIUM: { color: 'bg-amber-50 border-amber-200 text-amber-700', badge: 'bg-amber-100 text-amber-700', icon: '→' },
    HIGH: { color: 'bg-orange-50 border-orange-200 text-orange-700', badge: 'bg-orange-100 text-orange-700', icon: '↑' },
    URGENT: { color: 'bg-red-50 border-red-200 text-red-700', badge: 'bg-red-100 text-red-700', icon: '!!' }
  };

  const riskColors = {
    LOW: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    MEDIUM: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-amber-500';
    return 'bg-red-400';
  };

  const getProgressText = (progress) => {
    if (progress >= 80) return 'text-emerald-700';
    if (progress >= 50) return 'text-blue-700';
    if (progress >= 25) return 'text-amber-700';
    return 'text-red-700';
  };

  const isOverdue = task.endDate && new Date(task.endDate) < new Date();
  const daysUntilDue = task.endDate ? Math.ceil((new Date(task.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;

  // Get initials from assignee name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const priorityConfig_item = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const riskConfig = riskColors[task.riskLevel] || riskColors.LOW;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`bg-white rounded-lg border-2 ${priorityConfig_item.color} shadow-sm hover:shadow-lg transition-all cursor-move group hover:border-opacity-100 border-opacity-60`}
    >
      {/* Card Top Section - Priority & Status */}
      <div className="flex items-center justify-between px-3 pt-3">
        <div className="flex items-center gap-2">
          {/* Priority Badge */}
          <span className={`w-6 h-6 rounded-full ${priorityConfig_item.badge} flex items-center justify-center text-xs font-bold`}>
            {priorityConfig_item.icon}
          </span>

          {/* Critical Path Badge */}
          {task.isCriticalPath && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              <Zap className="w-3 h-3" />
              Critical
            </span>
          )}
        </div>

        {/* Task Code */}
        {task.taskCode && (
          <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {task.taskCode}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="px-3 py-2">
        {/* Task Title */}
        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-tight">
          {task.name}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-1">
            {task.description}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      {task.progress !== undefined && (
        <div className="px-3 py-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className={`text-xs font-bold ${getProgressText(task.progress)}`}>
              {Math.round(task.progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(task.progress)}`}
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="px-3 py-2 space-y-1 border-t border-gray-100 text-xs">
        {/* Dates Row */}
        {task.endDate && (
          <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-gray-600'}`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(task.endDate), 'MMM dd')}</span>
            {isOverdue && <span className="text-red-600 font-bold">OVERDUE</span>}
            {isDueSoon && !isOverdue && <span className="text-amber-600 font-bold">In {daysUntilDue}d</span>}
          </div>
        )}

        {/* Risk Level Badge */}
        {task.riskLevel && task.riskLevel !== 'LOW' && (
          <div className={`flex items-center gap-1.5 font-medium ${riskConfig.text} px-2 py-0.5 rounded ${riskConfig.bg}`}>
            <AlertTriangle className="w-3 h-3" />
            <span>{task.riskLevel} Risk</span>
          </div>
        )}

        {/* Material Status */}
        {task.materialReadinessStatus && task.materialReadinessStatus !== 'READY' && (
          <div className="flex items-center gap-1.5 text-orange-600 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Materials Pending</span>
          </div>
        )}
      </div>

      {/* Bottom Info & Assignee */}
      <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
        {/* Budget Info */}
        <div className="text-xs">
          {task.estimatedCost && (
            <div className="font-medium text-gray-700">
              <span className="font-bold">₹{(Number(task.estimatedCost) / 100000).toFixed(1)}L</span>
              {task.actualCost > 0 && (
                <span className="text-gray-500 text-xs"> / ₹{(Number(task.actualCost) / 100000).toFixed(1)}L</span>
              )}
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assigneeName ? (
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold border border-blue-700">
              {getInitials(task.assigneeName)}
            </div>
            <span className="text-xs text-gray-600 font-medium truncate max-w-[80px]">
              {task.assigneeName.split(' ')[0]}
            </span>
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border border-gray-300">
            ?
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      {(task.checklistItems?.length > 0 || task.attachments?.length > 0) && (
        <div className="px-3 py-1.5 bg-gray-50 rounded-b-lg flex items-center justify-between text-xs">
          {task.checklistItems && task.checklistItems.length > 0 && (
            <div className="flex items-center gap-1 text-blue-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{task.checklistItems.filter(item => item.completed).length}/{task.checklistItems.length}</span>
            </div>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <div className="text-gray-500 font-medium">
              📎 {task.attachments.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
