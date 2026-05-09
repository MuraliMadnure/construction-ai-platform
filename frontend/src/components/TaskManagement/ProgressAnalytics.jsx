import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertTriangle, CheckCircle, Calendar, Target } from 'lucide-react';
import useTaskStore from '../../stores/taskStore';
import useProgressStore from '../../stores/progressStore';
import taskEnterpriseService from '../../services/task-enterprise.service';

/**
 * ProgressAnalytics Component
 * Comprehensive analytics dashboard with charts for progress, budget, and performance
 */
const ProgressAnalytics = ({ projectId }) => {
  const { tasks, phases } = useTaskStore();
  const { projectReports } = useProgressStore();

  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 days
  const [progressSummary, setProgressSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadAnalytics();
    }
  }, [projectId, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const summary = await taskEnterpriseService.getProjectProgressSummary(projectId);
      setProgressSummary(summary);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const blockedTasks = tasks.filter(t => t.status === 'BLOCKED').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.endDate) return false;
    return new Date(t.endDate) < new Date() && t.status !== 'COMPLETED';
  }).length;

  const totalBudget = tasks.reduce((sum, t) => sum + Number(t.estimatedCost || 0), 0);
  const actualCost = tasks.reduce((sum, t) => sum + Number(t.actualCost || 0), 0);
  const budgetVariance = actualCost - totalBudget;
  const budgetUtilization = totalBudget > 0 ? (actualCost / totalBudget) * 100 : 0;

  const avgProgress = totalTasks > 0
    ? tasks.reduce((sum, t) => sum + Number(t.progress || 0), 0) / totalTasks
    : 0;

  // Task status distribution
  const statusData = [
    { name: 'Completed', value: completedTasks, color: '#10B981' },
    { name: 'In Progress', value: inProgressTasks, color: '#3B82F6' },
    { name: 'Pending', value: tasks.filter(t => t.status === 'PENDING' || t.status === 'ASSIGNED').length, color: '#6B7280' },
    { name: 'Blocked', value: blockedTasks, color: '#EF4444' }
  ].filter(d => d.value > 0);

  // Progress over time (mock data - would come from daily reports)
  const progressOverTime = [
    { date: 'Week 1', progress: 15, planned: 20 },
    { date: 'Week 2', progress: 28, planned: 35 },
    { date: 'Week 3', progress: 42, planned: 50 },
    { date: 'Week 4', progress: 55, planned: 65 },
    { date: 'Week 5', progress: avgProgress, planned: 80 }
  ];

  // Budget vs Actual by phase
  const budgetByPhase = phases.map(phase => {
    const phaseTasks = tasks.filter(t => t.phaseId === phase.id);
    const estimated = phaseTasks.reduce((sum, t) => sum + Number(t.estimatedCost || 0), 0);
    const actual = phaseTasks.reduce((sum, t) => sum + Number(t.actualCost || 0), 0);

    return {
      name: phase.name.length > 15 ? phase.name.substring(0, 15) + '...' : phase.name,
      estimated: estimated / 100000, // Convert to lakhs
      actual: actual / 100000
    };
  });

  // Priority distribution
  const priorityData = [
    { name: 'Low', value: tasks.filter(t => t.priority === 'LOW').length, color: '#10B981' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'MEDIUM').length, color: '#F59E0B' },
    { name: 'High', value: tasks.filter(t => t.priority === 'HIGH').length, color: '#EF4444' },
    { name: 'Urgent', value: tasks.filter(t => t.priority === 'URGENT').length, color: '#DC2626' }
  ].filter(d => d.value > 0);

  // Risk level distribution
  const riskData = [
    { name: 'Low', value: tasks.filter(t => t.riskLevel === 'LOW').length, color: '#10B981' },
    { name: 'Medium', value: tasks.filter(t => t.riskLevel === 'MEDIUM').length, color: '#F59E0B' },
    { name: 'High', value: tasks.filter(t => t.riskLevel === 'HIGH').length, color: '#EF4444' },
    { name: 'Critical', value: tasks.filter(t => t.riskLevel === 'CRITICAL').length, color: '#DC2626' }
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Project Analytics</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <span className={`text-sm font-medium ${avgProgress >= 70 ? 'text-green-600' : avgProgress >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
              {avgProgress >= 70 ? 'On Track' : avgProgress >= 40 ? 'At Risk' : 'Behind'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Overall Progress</h3>
          <p className="text-3xl font-bold text-gray-900">{Math.round(avgProgress)}%</p>
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${avgProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Task Completion */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Tasks Completed</h3>
          <p className="text-3xl font-bold text-gray-900">
            {completedTasks}/{totalTasks}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate
          </p>
        </div>

        {/* Budget Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${budgetVariance <= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`w-6 h-6 ${budgetVariance <= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            {budgetVariance <= 0 ? (
              <TrendingDown className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingUp className="w-5 h-5 text-red-600" />
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Budget Utilization</h3>
          <p className="text-3xl font-bold text-gray-900">{Math.round(budgetUtilization)}%</p>
          <p className={`text-sm mt-2 ${budgetVariance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {budgetVariance <= 0 ? 'Under budget' : 'Over budget'} by ₹{Math.abs(budgetVariance / 100000).toFixed(2)}L
          </p>
        </div>

        {/* Issues & Risks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Issues & Risks</h3>
          <p className="text-3xl font-bold text-gray-900">{blockedTasks + overdueTasks}</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-red-600">{blockedTasks} blocked</span>
            <span className="text-orange-600">{overdueTasks} overdue</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Progress Over Time & Task Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Over Time */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="progress" stroke="#3B82F6" strokeWidth={2} name="Actual Progress" />
              <Line type="monotone" dataKey="planned" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Planned Progress" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              {avgProgress >= progressOverTime[progressOverTime.length - 1].planned ? (
                <span className="text-green-600 font-medium">✓ Ahead of schedule</span>
              ) : (
                <span className="text-red-600 font-medium">⚠ Behind schedule</span>
              )}
              {' - '}Current progress is {Math.round(avgProgress)}% vs planned {progressOverTime[progressOverTime.length - 1].planned}%
            </p>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-700">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Budget by Phase & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual by Phase */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual by Phase (₹ Lakhs)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetByPhase}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="estimated" fill="#3B82F6" name="Estimated" />
              <Bar dataKey="actual" fill="#EF4444" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600">Total Budget</p>
              <p className="text-lg font-semibold text-gray-900">₹{(totalBudget / 100000).toFixed(2)}L</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Spent</p>
              <p className="text-lg font-semibold text-gray-900">₹{(actualCost / 100000).toFixed(2)}L</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Remaining</p>
              <p className={`text-lg font-semibold ${budgetVariance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{((totalBudget - actualCost) / 100000).toFixed(2)}L
              </p>
            </div>
          </div>
        </div>

        {/* Priority & Risk Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority & Risk Distribution</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">By Priority</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {priorityData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded" style={{ backgroundColor: item.color }}></div>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">By Risk Level</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {riskData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded" style={{ backgroundColor: item.color }}></div>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Schedule Performance</h4>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {avgProgress >= 70 ? 'Good' : avgProgress >= 40 ? 'Fair' : 'Poor'}
            </p>
            <p className="text-sm text-gray-600">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Budget Performance</h4>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {budgetUtilization <= 100 ? 'Good' : budgetUtilization <= 120 ? 'Fair' : 'Poor'}
            </p>
            <p className="text-sm text-gray-600">
              {Math.round(budgetUtilization)}% budget utilized
            </p>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Risk Level</h4>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {blockedTasks + overdueTasks === 0 ? 'Low' : blockedTasks + overdueTasks < 3 ? 'Medium' : 'High'}
            </p>
            <p className="text-sm text-gray-600">
              {blockedTasks + overdueTasks} tasks requiring attention
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressAnalytics;
