import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import useTaskStore from '../../stores/taskStore';
import taskEnterpriseService from '../../services/task-enterprise.service';

/**
 * GanttChart Component
 * Visual timeline with dependencies, drag to reschedule
 */
const GanttChart = ({ projectId, socket }) => {
  const { tasks, dependencies, fetchTasks, updateTask, criticalPath, fetchCriticalPath } = useTaskStore();
  const { emitGanttTaskMoved = () => {} } = socket || {};

  const [viewMode, setViewMode] = useState('days'); // days, weeks, months
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartDate, setDragStartDate] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const ganttRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
      fetchCriticalPath(projectId);
    }
  }, [projectId]);

  // Calculate date range (memoized)
  const { rangeStart, rangeEnd, totalDays, days } = useMemo(() => {
    let start = new Date(currentDate);
    let end = new Date(currentDate);

    if (viewMode === 'days') {
      start = addDays(start, -15);
      end = addDays(end, 45);
    } else if (viewMode === 'weeks') {
      start = addDays(start, -30);
      end = addDays(end, 90);
    } else {
      start = startOfMonth(addDays(start, -60));
      end = endOfMonth(addDays(end, 120));
    }

    tasks.forEach(task => {
      if (task.startDate) {
        const taskStart = new Date(task.startDate);
        if (taskStart < start) start = taskStart;
      }
      if (task.endDate) {
        const taskEnd = new Date(task.endDate);
        if (taskEnd > end) end = taskEnd;
      }
    });

    return {
      rangeStart: start,
      rangeEnd: end,
      totalDays: differenceInDays(end, start),
      days: eachDayOfInterval({ start, end })
    };
  }, [currentDate, viewMode, tasks]);

  // Calculate task position on timeline
  const getTaskPosition = (task) => {
    if (!task.startDate || !task.endDate) return null;

    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const daysFromStart = differenceInDays(taskStart, rangeStart);
    const duration = differenceInDays(taskEnd, taskStart) + 1;

    const left = (daysFromStart / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return { left: `${left}%`, width: `${Math.max(width, 0.5)}%` };
  };

  // Get task color
  const getTaskColor = (task) => {
    if (criticalPath.includes(task.id)) {
      return 'bg-red-500 border-red-700';
    }
    switch (task.status) {
      case 'COMPLETED':
        return 'bg-green-500 border-green-700';
      case 'IN_PROGRESS':
        return 'bg-blue-500 border-blue-700';
      case 'BLOCKED':
        return 'bg-red-400 border-red-600';
      case 'UNDER_REVIEW':
        return 'bg-purple-500 border-purple-700';
      default:
        return 'bg-gray-400 border-gray-600';
    }
  };

  // Handle drag start
  const handleDragStart = (e, task) => {
    if (!task.startDate || !task.endDate) return;

    setDraggedTask(task);
    setDragStartX(e.clientX);
    setDragStartDate(new Date(task.startDate));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!draggedTask) return;

    const rect = ganttRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dayWidth = rect.width / totalDays;
    const daysMoved = Math.round((e.clientX - dragStartX) / dayWidth);

    if (daysMoved !== 0) {
      const newStartDate = addDays(dragStartDate, daysMoved);
      const duration = differenceInDays(new Date(draggedTask.endDate), new Date(draggedTask.startDate));
      const newEndDate = addDays(newStartDate, duration);

      // Visual feedback during drag (optional: update display)
    }
  };

  // Handle drop
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
        // Update task dates
        await taskEnterpriseService.updateTaskDates(
          draggedTask.id,
          newStartDate.toISOString(),
          newEndDate.toISOString()
        );

        // Update local state
        updateTask(draggedTask.id, {
          startDate: newStartDate.toISOString(),
          endDate: newEndDate.toISOString()
        });

        // Emit real-time update
        emitGanttTaskMoved(
          projectId,
          draggedTask.id,
          newStartDate.toISOString(),
          newEndDate.toISOString(),
          duration
        );

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

  // Draw dependency arrows
  const getDependencyPath = (fromTask, toTask) => {
    const fromPos = getTaskPosition(fromTask);
    const toPos = getTaskPosition(toTask);

    if (!fromPos || !toPos) return null;

    const fromIndex = tasks.findIndex(t => t.id === fromTask.id);
    const toIndex = tasks.findIndex(t => t.id === toTask.id);

    const fromX = parseFloat(fromPos.left) + parseFloat(fromPos.width);
    const fromY = (fromIndex * 48) + 24;
    const toX = parseFloat(toPos.left);
    const toY = (toIndex * 48) + 24;

    // Simple arrow path
    const midX = (fromX + toX) / 2;
    const path = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;

    return { path, fromX, fromY, toX, toY };
  };

  // Navigate timeline
  const navigateTimeline = (direction) => {
    const offset = viewMode === 'days' ? 7 : viewMode === 'weeks' ? 30 : 90;
    setCurrentDate(addDays(currentDate, direction === 'prev' ? -offset : offset));
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Render timeline header
  const renderTimelineHeader = () => {
    if (viewMode === 'days') {
      return days.map((day, index) => (
        <div
          key={index}
          className="flex-shrink-0 border-r border-gray-200 text-center py-2"
          style={{ width: `${100 / totalDays}%` }}
        >
          <div className="text-xs text-gray-600">{format(day, 'EEE')}</div>
          <div className="text-sm font-medium">{format(day, 'dd')}</div>
        </div>
      ));
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
          <div className="text-sm font-medium">{format(week, 'MMM dd')}</div>
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
            <div className="text-sm font-medium">{format(month, 'MMMM yyyy')}</div>
          </div>
        );
      });
    }
  };

  const chartHeight = Math.max(tasks.length * 56, 320);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>

          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('days')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'days' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
              }`}
            >
              Days
            </button>
            <button
              onClick={() => setViewMode('weeks')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'weeks' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
              }`}
            >
              Weeks
            </button>
            <button
              onClick={() => setViewMode('months')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'months' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
              }`}
            >
              Months
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTimeline('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Today
          </button>
          <button
            onClick={() => navigateTimeline('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Next"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex" style={{ height: isFullscreen ? 'calc(100vh - 140px)' : '600px' }}>
        {/* Task List (Left) */}
        <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div className="sticky top-0 bg-gray-100 border-b border-gray-200 p-3 font-semibold text-sm text-gray-700">
            Task Name
          </div>
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`p-3 border-b border-gray-200 text-sm ${
                criticalPath.includes(task.id) ? 'bg-red-50 border-l-4 border-l-red-500' : ''
              }`}
              style={{ height: '48px' }}
            >
              <div className="font-medium text-gray-900 truncate">{task.name}</div>
              <div className="text-xs text-gray-500">
                {task.duration ? `${task.duration} days` : 'No duration'}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline (Right) */}
        <div className="flex-1 overflow-x-auto overflow-y-auto relative" ref={ganttRef}>
          {/* Timeline Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10 flex">
            {renderTimelineHeader()}
          </div>

          {/* Timeline Grid & Tasks */}
          <div
            className="relative"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ minHeight: `${chartHeight}px` }}
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 flex">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 border-r ${
                    format(day, 'EEE') === 'Sun' ? 'bg-gray-50' : 'bg-white'
                  } ${
                    format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                  style={{ width: `${100 / totalDays}%`, minHeight: `${chartHeight}px` }}
                ></div>
              ))}
            </div>

            {/* Background Rows */}
            <div className="absolute inset-0">
              {Array.from({ length: Math.max(tasks.length, 6) }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`border-b ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-gray-200`}
                  style={{ height: '56px' }}
                />
              ))}
            </div>

            {/* Dependency Arrows */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: `${chartHeight}px` }}
            >
              {dependencies.map((dep, index) => {
                const fromTask = tasks.find(t => t.id === dep.dependsOnTaskId);
                const toTask = tasks.find(t => t.id === dep.taskId);
                if (!fromTask || !toTask) return null;

                const arrow = getDependencyPath(fromTask, toTask);
                if (!arrow) return null;

                return (
                  <g key={index}>
                    <path
                      d={arrow.path}
                      stroke="#6B7280"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#6B7280" />
                </marker>
              </defs>
            </svg>

            {/* Task Bars */}
            <div className="relative" style={{ minHeight: `${chartHeight}px` }}>
              {tasks.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="max-w-md rounded-2xl border border-dashed border-gray-300 bg-white/90 p-8 text-center shadow-sm">
                    <div className="text-sm uppercase tracking-[0.24em] text-blue-600 mb-3">No timeline data</div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">No tasks available</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Create a task to start building your project timeline. Tasks with start and end dates appear here instantly.
                    </p>
                    <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-5 py-2.5 text-sm font-semibold text-blue-700">
                      Add tasks from the Board view to populate the timeline
                    </div>
                  </div>
                </div>
              ) : (
                tasks.map((task, index) => {
                  const position = getTaskPosition(task);
                  if (!position) return null;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className={`absolute cursor-move rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow ${getTaskColor(
                        task
                      )}`}
                      style={{
                        left: position.left,
                        width: position.width,
                        top: `${index * 56 + 12}px`,
                        height: '32px',
                        minWidth: '24px'
                      }}
                      title={`${task.name}\n${format(new Date(task.startDate), 'MMM dd')} - ${format(
                        new Date(task.endDate),
                        'MMM dd'
                      )}\nProgress: ${Math.round(task.progress)}%`}
                    >
                      {/* Progress Bar */}
                      <div
                        className="h-full bg-black bg-opacity-20 rounded-l-md"
                        style={{ width: `${task.progress}%` }}
                      ></div>

                      {/* Task Label */}
                      {parseFloat(position.width) > 5 && (
                        <div className="absolute inset-0 flex items-center px-2 text-white text-xs font-medium truncate">
                          {task.name}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 p-4 border-t border-gray-200 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Critical Path</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>Pending</span>
        </div>
        <div className="ml-auto text-gray-600">
          Drag tasks to reschedule • Arrows show dependencies
        </div>
      </div>
    </div>
  );
};

export default memo(GanttChart);
