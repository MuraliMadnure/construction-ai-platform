import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import projectService from '../services/project.service';
import taskService from '../services/task.service';
import aiService from '../services/ai.service';

const AnalyticsPage = () => {
  const [timePeriod, setTimePeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [insights, setInsights] = useState(null);
  const [metrics, setMetrics] = useState({
    totalBudget: 0,
    totalSpent: 0,
    avgProgress: 0,
    efficiency: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadInsights();
    }
  }, [selectedProjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsResponse, tasksResponse] = await Promise.all([
        projectService.getAll(),
        taskService.getAll()
      ]);

      const projectList = projectsResponse.data.projects || [];
      const taskList = tasksResponse.data.tasks || [];

      setProjects(projectList);
      setTasks(taskList);

      if (projectList.length > 0) {
        setSelectedProjectId(projectList[0].id);
      }

      // Calculate metrics
      const totalBudget = projectList.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
      const totalSpent = projectList.reduce((sum, p) => sum + parseFloat(p.spentAmount || 0), 0);
      const avgProgress = projectList.length > 0
        ? projectList.reduce((sum, p) => sum + parseFloat(p.progress || 0), 0) / projectList.length
        : 0;

      // Calculate efficiency (tasks completed vs total tasks)
      const completedTasks = taskList.filter(t => t.status === 'COMPLETED').length;
      const efficiency = taskList.length > 0 ? (completedTasks / taskList.length) * 10 : 0;

      setMetrics({
        totalBudget,
        totalSpent,
        avgProgress,
        efficiency
      });
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    if (!selectedProjectId) return;

    try {
      const response = await aiService.getProjectInsights(selectedProjectId);
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to load insights:', error);
      // Don't show error toast - insights are optional
    }
  };

  const getInsightColor = (type) => {
    const colors = {
      warning: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700',
      success: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700',
      info: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700',
      error: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700',
    };
    return colors[type] || colors.info;
  };

  const getInsightIcon = (type) => {
    const icons = {
      warning: '⚠️',
      success: '✅',
      info: 'ℹ️',
      error: '❌',
    };
    return icons[type] || 'ℹ️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
        <div className="flex gap-3">
          <select
            className="input w-64"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <select
            className="input w-48"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</h3>
          <p className="text-3xl font-bold mt-2">₹{(metrics.totalBudget / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{projects.length} projects</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</h3>
          <p className="text-3xl font-bold mt-2">₹{(metrics.totalSpent / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {metrics.totalBudget > 0 ? ((metrics.totalSpent / metrics.totalBudget) * 100).toFixed(0) : 0}% of budget
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Progress</h3>
          <p className="text-3xl font-bold mt-2">{metrics.avgProgress.toFixed(1)}%</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Across all projects</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Efficiency Score</h3>
          <p className="text-3xl font-bold mt-2">{metrics.efficiency.toFixed(1)}/10</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Based on task completion</p>
        </div>
      </div>

      {/* Budget Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6">Budget Analysis by Project</h3>
        {projects.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No projects available</p>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => {
              const budget = parseFloat(project.budget || 0);
              const spent = parseFloat(project.spentAmount || 0);
              const remaining = budget - spent;
              const percentage = budget > 0 ? (spent / budget) * 100 : 0;

              return (
                <div key={project.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ₹{(spent / 1000000).toFixed(1)}M / ₹{(budget / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-6 rounded-full transition-all flex items-center justify-end pr-2 ${
                        percentage > 90 ? 'bg-red-600' : percentage > 75 ? 'bg-yellow-600' : 'bg-primary-600'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>Spent: ₹{(spent / 1000000).toFixed(2)}M</span>
                    <span>Remaining: ₹{(remaining / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6">Task Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'].map(status => {
            const count = tasks.filter(t => t.status === status).length;
            const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
            return (
              <div key={status} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{status}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{percentage.toFixed(0)}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insights */}
      {(() => {
        const insightsList = Array.isArray(insights) ? insights : (insights?.insights || []);
        return insightsList.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-6">🤖 AI-Powered Insights</h3>
            <div className="space-y-4">
              {insightsList.map((insight, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getInsightColor(insight.type || 'info')}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getInsightIcon(insight.type || 'info')}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {insight.description}
                    </p>
                    {insight.recommendation && (
                      <div className="text-sm">
                        <span className="font-medium">Recommendation: </span>
                        <span className="text-gray-600 dark:text-gray-400">{insight.recommendation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Export Section */}
      <div className="card bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold mb-1">Export Analytics Report</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Download comprehensive analytics report with all metrics and insights
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost">Export PDF</button>
            <button className="btn-ghost">Export Excel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
