import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameDay } from 'date-fns';
import {
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Calendar,
  AlertTriangle, Clock, Users, Flag, Layers, Filter, Download
} from 'lucide-react';
import { toast } from 'sonner';
import useTaskStore from '../../stores/taskStore';
import taskEnterpriseService from '../../services/task-enterprise.service';

/**
 * GanttChart Component - Enterprise Timeline View
 * Professional project timeline with dependencies, milestones, drag-to-reschedule,
 * progress visualization, and critical path highlighting
 */
const GanttChart = ({ projectId, socket }) => {
  const { tasks, dependencies, fetchTasks, updateTask, criticalPath, fetchCriticalPath } = useTaskStore();
  const { emitGanttTaskMoved = () => {} } = socket || {};

  const [viewMode, setViewMode] = useState('weeks');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartDate, setDragStartDate] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showMilestones, setShowMilestones] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const ganttRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
      fetchCriticalPath(projectId);
    }
  }, [projectId]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (filterStatus === 'all') return tasks;
    return tasks.filter(t => t.status === filterStatus);
  }, [tasks, filterStatus]);

  // Calculate date range
  const { rangeStart, rangeEnd, totalDays, days } = useMemo(() => {
    let start = new Date(currentDate);
    let end = new Date(currentDate);

    if (viewMode === 'days') {
      start = addDays(start, -7);
      end = addDays(end, 30);
    } else if (viewMode === 'weeks') {
      start = addDays(start, -14);
      end = addDays(end, 75);
    } else {
      start = startOfMonth(addDays(start, -30));
      end = endOfMonth(addDays(end, 150));
    }

    tasks.forEach(task => {
      if (task.startDate) {
        const taskStart = new Date(task.startDate);
        if (taskStart < start) start = addDays(taskStart, -7);
      }
      if (task.endDate) {
        const taskEnd = new Date(task.endDate);
        if (taskEnd > end) end = addDays(taskEnd, 14);
      }
    });

    return {
      rangeStart: start,
      rangeEnd: end,
      totalDays: Math.max(differenceInDays(end, start), 1),
      days: eachDayOfInterval({ start, end })
    };
  }, [currentDate, viewMode, tasks]);

  // Task position calculator
  const getTaskPosition = (task) => {
    if (!task.startDate || !task.endDate) return null;
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const daysFromStart = differenceInDays(taskStart, rangeStart);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    const left = (daysFromStart / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 0.8)}%` };
  };

  // Task bar colors with gradients
  const getTaskBarStyle = (task) => {
    const isCritical = criticalPath.includes(task.id);
    if (isCritical) return { background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: '2px solid #b91c1c' };
    switch (task.status) {
      case 'COMPLETED':
        return { background: 'linear-gradient(135deg, #10b981, #059669)', border: '2px solid #047857' };
      case 'IN_PROGRESS':
        return { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: '2px solid #1d4ed8' };
      case 'BLOCKED':
        return { background: 'linear-gradient(135deg, #f87171, #ef4444)', border: '2px solid #dc2626' };
      case 'UNDER_REVIEW':
        return { background: 'linear-gradient(135deg, #a855f7, #9333ea)', border: '2px solid #7c3aed' };
      case 'ASSIGNED':
        return { background: 'linear-gradient(135deg, #06b6d4, #0891b2)', border: '2px solid #0e7490' };
      default:
        return { background: 'linear-gradient(135deg, #94a3b8, #64748b)', border: '2px solid #475569' };
    }
  };

  // Priority indicator
  const getPriorityIndicator = (priority) => {
    const config = {
      URGENT: { color: '#ef4444', label: 'Urgent' },
      HIGH: { color: '#f97316', label: 'High' },
      MEDIUM: { color: '#eab308', label: 'Medium' },
      LOW: { color: '#22c55e', label: 'Low' }
    };
    return config[priority] || config.MEDIUM;
  };

  // Drag handlers
  const handleDragStart = (e, task) => {
    if (!task.startDate || !task.endDate) return;
    setDraggedTask(task);
    setDragStartX(e.clientX);
    setDragStartDate(new Date(task.startDate));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (!draggedTask) return;

    const rect = ganttRef.current.getBoundingClientRect();
    const dayWidth = rect.width / totalDays;
    const daysMoved = Math.round((e.clientX - dragStartX) / dayWidth);

    if (daysMoved !== 0) {
      const newStartDate = addDays(dragStartDate, daysMoved);
      const duration = differenceInDays(new Date(draggedTask.endDate), new Date(draggedTask.startDate));
      const newEndDate = addDays(newStartDate, duration);

      try {
        await taskEnterpriseService.updateTaskDates(
          draggedTask.id,
          newStartDate.toISOString(),
          newEndDate.toISOString()
        );
        updateTask(draggedTask.id, {
          startDate: newStartDate.toISOString(),
          endDate: newEndDate.toISOString()
        });
        emitGanttTaskMoved(projectId, draggedTask.id, newStartDate.toISOString(), newEndDate.toISOString(), duration);
        toast.success('Task rescheduled successfully');
      } catch (error) {
        console.error('Error updating task dates:', error);
        toast.error('Failed to reschedule task');
      }
    }

    setDraggedTask(null);
    setDragStartX(0);
    setDragStartDate(null);
  };

  // Dependency path drawing
  const getDependencyPath = (fromTask, toTask) => {
    const fromPos = getTaskPosition(fromTask);
    const toPos = getTaskPosition(toTask);
    if (!fromPos || !toPos) return null;

    const fromIndex = filteredTasks.findIndex(t => t.id === fromTask.id);
    const toIndex = filteredTasks.findIndex(t => t.id === toTask.id);
    if (fromIndex === -1 || toIndex === -1) return null;

    const fromX = parseFloat(fromPos.left) + parseFloat(fromPos.width);
    const fromY = (fromIndex * 52) + 26;
    const toX = parseFloat(toPos.left);
    const toY = (toIndex * 52) + 26;

    const midX = fromX + ((toX - fromX) * 0.5);
    const path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
    return { path };
  };

  // Navigate
  const navigateTimeline = (direction) => {
    const offset = viewMode === 'days' ? 7 : viewMode === 'weeks' ? 14 : 60;
    setCurrentDate(addDays(currentDate, direction === 'prev' ? -offset : offset));
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  // Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    withDates: tasks.filter(t => t.startDate && t.endDate).length,
    critical: criticalPath.length,
    overdue: tasks.filter(t => t.endDate && new Date(t.endDate) < new Date() && t.status !== 'COMPLETED').length
  }), [tasks, criticalPath]);

  // Timeline header rendering
  const renderTimelineHeader = () => {
    if (viewMode === 'days') {
      return days.map((day, index) => {
        const isToday = isSameDay(day, new Date());
        const isWkend = isWeekend(day);
        return (
          <div
            key={index}
            className={`flex-shrink-0 border-r text-center py-1.5 ${
              isToday ? 'bg-blue-100 border-blue-300' : isWkend ? 'bg-gray-100' : 'border-gray-200'
            }`}
            style={{ width: `${100 / totalDays}%` }}
          >
            <div className={`text-[10px] font-medium ${isToday ? 'text-blue-700' : isWkend ? 'text-gray-400' : 'text-gray-500'}`}>
              {format(day, 'EEE')}
            </div>
            <div className={`text-xs font-bold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
              {format(day, 'dd')}
            </div>
          </div>
        );
      });
    } else if (viewMode === 'weeks') {
      const weeks = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(days[i]);
      }
      return weeks.map((week, index) => (
        <div
          key={index}
          className="flex-shrink-0 border-r border-gray-200 text-center py-2"
          style={{ width: `${(7 / totalDays) * 100}%` }}
        >
          <div className="text-[10px] text-gray-500 font-medium">{format(week, 'MMM')}</div>
          <div className="text-xs font-bold text-gray-700">{format(week, 'dd')} - {format(addDays(week, 6), 'dd')}</div>
        </div>
      ));
    } else {
      const months = [];
      let currentMonth = null;
      days.forEach(day => {
        const month = format(day, 'MMM yyyy');
        if (month !== currentMonth) {
          months.push(day);
          currentMonth = month;
        }
      });
      return months.map((month, index) => {
        const monthDays = days.filter(d => format(d, 'MMM yyyy') === format(month, 'MMM yyyy')).length;
        return (
          <div
            key={index}
            className="flex-shrink-0 border-r border-gray-200 text-center py-2"
            style={{ width: `${(monthDays / totalDays) * 100}%` }}
          >
            <div className="text-xs font-bold text-gray-700">{format(month, 'MMMM yyyy')}</div>
          </div>
        );
      });
    }
  };

  const ROW_HEIGHT = 52;
  const chartHeight = Math.max(filteredTasks.length * ROW_HEIGHT, 320);

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      }`}
    >
      {/* Premium Header */}
      <div className="border-b border-gray-200">
        {/* Top bar with stats */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Project Timeline</h3>
              <p className="text-xs text-gray-500 mt-0.5">Drag tasks to reschedule | Click for details</p>
            </div>

            {/* Inline Stats */}
            <div className="hidden lg:flex items-center gap-4 ml-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-xs font-semibold text-slate-700">{stats.withDates}/{stats.total} scheduled</span>
              </div>
              {stats.critical > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-xs font-semibold text-red-700">{stats.critical} critical</span>
                </div>
              )}
              {stats.overdue > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">{stats.overdue} overdue</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Tasks</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
            </select>

            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            {/* Navigation */}
            <button
              onClick={() => navigateTimeline('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 shadow-sm"
            >
              Today
            </button>
            <button
              onClick={() => navigateTimeline('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            {/* View Mode */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              {['days', 'weeks', 'months'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    viewMode === mode
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-gray-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Chart Body */}
      <div className="flex flex-1 overflow-hidden" style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '550px' }}>
        {/* Task List Panel (Left) */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">
          {/* Panel Header */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Task</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Duration</span>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</span>
            </div>
          </div>

          {/* Task Rows */}
          <div className="flex-1 overflow-y-auto">
            {filteredTasks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-center px-4">
                <p className="text-sm text-gray-500">No tasks to display</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isCritical = criticalPath.includes(task.id);
                const isOverdue = task.endDate && new Date(task.endDate) < new Date() && task.status !== 'COMPLETED';
                const priority = getPriorityIndicator(task.priority);
                const duration = task.startDate && task.endDate
                  ? differenceInDays(new Date(task.endDate), new Date(task.startDate)) + 1
                  : null;

                return (
                  <div
                    key={task.id}
                    className={`flex items-center px-4 border-b border-gray-200 hover:bg-white transition-colors cursor-pointer group ${
                      isCritical ? 'border-l-[3px] border-l-red-500 bg-red-50/50' : 'border-l-[3px] border-l-transparent'
                    } ${selectedTask === task.id ? 'bg-blue-50' : ''}`}
                    style={{ height: `${ROW_HEIGHT}px` }}
                    onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      {/* Priority dot */}
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: priority.color }}
                        title={priority.label}
                      ></div>

                      {/* Task info */}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate group-hover:text-blue-600 transition-colors ${
                          isOverdue ? 'text-red-700' : 'text-gray-900'
                        }`}>
                          {task.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {task.taskCode && (
                            <span className="text-[10px] font-mono text-gray-400">{task.taskCode}</span>
                          )}
                          {task.assigneeName && (
                            <span className="text-[10px] text-gray-400 truncate">{task.assigneeName.split(' ')[0]}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Duration & Progress */}
                    <div className="flex items-center gap-3 ml-2">
                      <span className="text-xs text-gray-500 font-medium w-10 text-right">
                        {duration ? `${duration}d` : '-'}
                      </span>
                      <div className="w-10 flex items-center gap-1">
                        <div className="w-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              task.progress >= 80 ? 'bg-emerald-500' :
                              task.progress >= 50 ? 'bg-blue-500' :
                              task.progress >= 25 ? 'bg-amber-500' : 'bg-red-400'
                            }`}
                            style={{ width: `${task.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">{Math.round(task.progress || 0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Timeline Panel (Right) */}
        <div className="flex-1 overflow-x-auto overflow-y-auto relative" ref={ganttRef}>
          {/* Month/Year Sub-header */}
          {viewMode === 'days' && (
            <div className="sticky top-0 z-10 bg-gradient-to-b from-slate-50 to-slate-100 border-b border-gray-200 flex">
              {(() => {
                const months = [];
                let currentMonth = null;
                let count = 0;
                days.forEach((day) => {
                  const month = format(day, 'MMM yyyy');
                  if (month !== currentMonth) {
                    if (currentMonth) months.push({ label: currentMonth, days: count });
                    currentMonth = month;
                    count = 1;
                  } else {
                    count++;
                  }
                });
                if (currentMonth) months.push({ label: currentMonth, days: count });
                return months.map((m, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 text-center py-1 border-r border-gray-200"
                    style={{ width: `${(m.days / totalDays) * 100}%` }}
                  >
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">{m.label}</span>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* Timeline Day/Week Headers */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-300 flex" style={{ top: viewMode === 'days' ? '24px' : 0 }}>
            {renderTimelineHeader()}
          </div>

          {/* Grid & Task Bars */}
          <div
            className="relative"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ minHeight: `${chartHeight}px` }}
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {days.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                const isWkend = isWeekend(day);
                return (
                  <div
                    key={index}
                    className={`flex-shrink-0 border-r ${
                      isToday ? 'bg-blue-50/70 border-blue-200' :
                      isWkend ? 'bg-gray-50/50 border-gray-100' :
                      'border-gray-100'
                    }`}
                    style={{ width: `${100 / totalDays}%`, minHeight: `${chartHeight}px` }}
                  ></div>
                );
              })}
            </div>

            {/* Today Indicator Line */}
            {(() => {
              const todayOffset = differenceInDays(new Date(), rangeStart);
              if (todayOffset >= 0 && todayOffset <= totalDays) {
                return (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                    style={{ left: `${(todayOffset / totalDays) * 100}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow"></div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Row backgrounds */}
            <div className="absolute inset-0 pointer-events-none">
              {filteredTasks.map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`border-b border-gray-100 ${rowIndex % 2 === 0 ? '' : 'bg-slate-25'}`}
                  style={{ height: `${ROW_HEIGHT}px` }}
                />
              ))}
            </div>

            {/* Dependency Arrows (SVG) */}
            <svg
              className="absolute inset-0 pointer-events-none z-10"
              style={{ width: '100%', height: `${chartHeight}px` }}
            >
              <defs>
                <marker id="gantt-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
                </marker>
              </defs>
              {dependencies.map((dep, index) => {
                const fromTask = filteredTasks.find(t => t.id === dep.dependsOnTaskId);
                const toTask = filteredTasks.find(t => t.id === dep.taskId);
                if (!fromTask || !toTask) return null;

                const arrow = getDependencyPath(fromTask, toTask);
                if (!arrow) return null;

                return (
                  <path
                    key={index}
                    d={arrow.path}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="4 2"
                    markerEnd="url(#gantt-arrow)"
                    opacity={0.7}
                  />
                );
              })}
            </svg>

            {/* Task Bars */}
            <div className="relative z-10" style={{ minHeight: `${chartHeight}px` }}>
              {filteredTasks.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="max-w-sm rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">No Timeline Data</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Add tasks with start and end dates from the Board view to populate the timeline.
                    </p>
                  </div>
                </div>
              ) : (
                filteredTasks.map((task, index) => {
                  const position = getTaskPosition(task);
                  if (!position) return null;

                  const barStyle = getTaskBarStyle(task);
                  const isHovered = hoveredTask === task.id;
                  const isSelected = selectedTask === task.id;

                  return (
                    <div key={task.id} className="absolute w-full" style={{ top: `${index * ROW_HEIGHT}px`, height: `${ROW_HEIGHT}px` }}>
                      {/* Task Bar */}
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onMouseEnter={() => setHoveredTask(task.id)}
                        onMouseLeave={() => setHoveredTask(null)}
                        onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                        className={`absolute cursor-move rounded-md shadow-sm transition-all ${
                          isHovered || isSelected ? 'shadow-lg scale-y-110 z-30' : 'hover:shadow-md'
                        }`}
                        style={{
                          left: position.left,
                          width: position.width,
                          top: '10px',
                          height: '32px',
                          minWidth: '20px',
                          ...barStyle,
                          opacity: isHovered || isSelected ? 1 : 0.9
                        }}
                      >
                        {/* Progress fill */}
                        <div
                          className="absolute inset-0 rounded-md bg-white opacity-20"
                          style={{ width: `${100 - (task.progress || 0)}%`, right: 0, left: 'auto' }}
                        ></div>

                        {/* Progress indicator inside bar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 rounded-l-md bg-black bg-opacity-15"
                          style={{ width: `${task.progress || 0}%` }}
                        ></div>

                        {/* Task label */}
                        {parseFloat(position.width) > 4 && (
                          <div className="absolute inset-0 flex items-center px-2 text-white text-[11px] font-semibold truncate drop-shadow-sm">
                            {task.name}
                            {parseFloat(position.width) > 8 && (
                              <span className="ml-auto text-[10px] opacity-80 font-bold">{Math.round(task.progress || 0)}%</span>
                            )}
                          </div>
                        )}

                        {/* Hover Tooltip */}
                        {isHovered && (
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 pointer-events-none">
                            <div className="bg-slate-900 text-white rounded-lg px-3 py-2 shadow-xl text-xs whitespace-nowrap">
                              <p className="font-bold">{task.name}</p>
                              <div className="flex items-center gap-3 mt-1 text-slate-300">
                                <span>{task.startDate ? format(new Date(task.startDate), 'MMM dd') : '?'} - {task.endDate ? format(new Date(task.endDate), 'MMM dd, yyyy') : '?'}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-slate-300">
                                <span>Progress: {Math.round(task.progress || 0)}%</span>
                                <span>Status: {task.status?.replace('_', ' ')}</span>
                              </div>
                              {task.assigneeName && <p className="mt-1 text-slate-400">Assigned: {task.assigneeName}</p>}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Milestone diamond (if task is a milestone / 0-duration) */}
                      {task.isMilestone && showMilestones && (
                        <div
                          className="absolute w-4 h-4 bg-amber-500 rotate-45 border-2 border-amber-700 shadow-md z-20"
                          style={{
                            left: position.left,
                            top: '18px'
                          }}
                        ></div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Legend */}
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-xl flex items-center justify-between">
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-2.5 rounded-sm" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}></div>
            <span className="text-gray-600 font-medium">Critical Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-2.5 rounded-sm" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}></div>
            <span className="text-gray-600 font-medium">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-2.5 rounded-sm" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}></div>
            <span className="text-gray-600 font-medium">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-2.5 rounded-sm" style={{ background: 'linear-gradient(135deg, #a855f7, #9333ea)' }}></div>
            <span className="text-gray-600 font-medium">Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-2.5 rounded-sm" style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)' }}></div>
            <span className="text-gray-600 font-medium">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-4 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 font-medium">Today</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          {filteredTasks.length} tasks | {stats.withDates} with dates | View: {viewMode}
        </div>
      </div>
    </div>
  );
};

export default memo(GanttChart);
