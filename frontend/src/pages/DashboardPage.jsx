import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Target,
  TimerReset
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import AIInsightsWidget from '../components/Dashboard/AIInsightsWidget';
import projectService from '../services/project.service';
import taskService from '../services/task.service';

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const STATUS_CONFIG = {
  ACTIVE: {
    label: 'Active',
    color: '#16a34a',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  },
  PLANNING: {
    label: 'Planning',
    color: '#2563eb',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
  },
  ON_HOLD: {
    label: 'On Hold',
    color: '#d97706',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  },
  COMPLETED: {
    label: 'Completed',
    color: '#64748b',
    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#dc2626',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  }
};

const HEALTH_CONFIG = {
  healthy: {
    label: 'Healthy',
    color: '#16a34a',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  },
  watch: {
    label: 'Watch',
    color: '#d97706',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  },
  critical: {
    label: 'Critical',
    color: '#dc2626',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  },
  complete: {
    label: 'Complete',
    color: '#64748b',
    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
};

const TASK_PRIORITY_WEIGHT = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

const parseNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const clampPercent = (value) => Math.min(100, Math.max(0, parseNumber(value)));

const formatCompactMoney = (amount) => {
  const value = parseNumber(amount);
  const abs = Math.abs(value);

  if (abs >= 10000000) return `INR ${(value / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `INR ${(value / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `INR ${(value / 1000).toFixed(1)}K`;
  return `INR ${value.toLocaleString()}`;
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'Not set';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDaysUntil = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date - TODAY) / (1000 * 60 * 60 * 24));
};

const getTimelinePercent = (project) => {
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 0;

  const elapsed = TODAY - start;
  const duration = end - start;
  return clampPercent((elapsed / duration) * 100);
};

const isTaskOpen = (task) => !['COMPLETED', 'CANCELLED'].includes(task.status);

const getProjectHealth = (project) => {
  const status = project.status;
  const progress = clampPercent(project.progress);
  const timelinePercent = getTimelinePercent(project);
  const budget = parseNumber(project.budget);
  const spent = parseNumber(project.spentAmount);
  const budgetPercent = budget > 0 ? (spent / budget) * 100 : 0;
  const daysUntilEnd = getDaysUntil(project.endDate);
  const scheduleGap = timelinePercent - progress;

  if (status === 'COMPLETED') return 'complete';
  if (status === 'CANCELLED') return 'critical';
  if (budgetPercent >= 100 || scheduleGap >= 25 || (daysUntilEnd !== null && daysUntilEnd < 0 && progress < 100)) {
    return 'critical';
  }
  if (status === 'ON_HOLD' || budgetPercent >= 85 || scheduleGap >= 10 || (daysUntilEnd !== null && daysUntilEnd <= 14 && progress < 85)) {
    return 'watch';
  }
  return 'healthy';
};

const getHealthConfig = (health) => HEALTH_CONFIG[health] || HEALTH_CONFIG.watch;

const getPriorityBadge = (priority) => {
  const badges = {
    CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  };
  return badges[priority] || badges.MEDIUM;
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-soft dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm font-semibold">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map(item => (
          <p key={item.dataKey} className="text-xs text-gray-600 dark:text-gray-300">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
            {item.name}: {item.dataKey?.toLowerCase().includes('budget') || item.dataKey?.toLowerCase().includes('spent')
              ? formatCompactMoney(item.value)
              : `${Math.round(item.value)}${item.dataKey === 'progress' ? '%' : ''}`}
          </p>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, detail, icon: Icon, tone = 'blue' }) => {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    amber: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
  }[tone];

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-normal">{value}</p>
        </div>
        <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{detail}</p>
    </div>
  );
};

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [projectsResponse, tasksResponse] = await Promise.all([
        projectService.getAll({ limit: 100 }),
        taskService.getAll()
      ]);

      setProjects(projectsResponse.data.projects || []);
      setTasks(tasksResponse.data.tasks || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const analytics = useMemo(() => {
    const enrichedProjects = projects.map(project => {
      const progress = clampPercent(project.progress);
      const budget = parseNumber(project.budget);
      const spent = parseNumber(project.spentAmount);
      const budgetPercent = budget > 0 ? clampPercent((spent / budget) * 100) : 0;
      const timelinePercent = getTimelinePercent(project);
      const health = getProjectHealth(project);

      return {
        ...project,
        progress,
        budget,
        spent,
        budgetPercent,
        timelinePercent,
        health,
        daysUntilEnd: getDaysUntil(project.endDate)
      };
    });

    const openTasks = tasks.filter(isTaskOpen);
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED');
    const overdueTasks = openTasks.filter(task => {
      const daysUntilEnd = getDaysUntil(task.endDate);
      return daysUntilEnd !== null && daysUntilEnd < 0;
    });
    const dueSoonTasks = openTasks.filter(task => {
      const daysUntilEnd = getDaysUntil(task.endDate);
      return daysUntilEnd !== null && daysUntilEnd >= 0 && daysUntilEnd <= 7;
    });
    const highPriorityTasks = openTasks.filter(task => ['HIGH', 'CRITICAL'].includes(task.priority));

    const totalBudget = enrichedProjects.reduce((sum, project) => sum + project.budget, 0);
    const totalSpent = enrichedProjects.reduce((sum, project) => sum + project.spent, 0);
    const averageProgress = enrichedProjects.length
      ? Math.round(enrichedProjects.reduce((sum, project) => sum + project.progress, 0) / enrichedProjects.length)
      : 0;

    const healthCounts = enrichedProjects.reduce((acc, project) => {
      acc[project.health] = (acc[project.health] || 0) + 1;
      return acc;
    }, { healthy: 0, watch: 0, critical: 0, complete: 0 });

    const statusData = Object.keys(STATUS_CONFIG).map(status => ({
      name: STATUS_CONFIG[status].label,
      value: enrichedProjects.filter(project => project.status === status).length,
      color: STATUS_CONFIG[status].color
    })).filter(item => item.value > 0);

    const healthData = Object.keys(HEALTH_CONFIG).map(health => ({
      name: HEALTH_CONFIG[health].label,
      value: healthCounts[health] || 0,
      color: HEALTH_CONFIG[health].color
    })).filter(item => item.value > 0);

    const portfolioScore = enrichedProjects.length
      ? Math.round(
          enrichedProjects.reduce((sum, project) => {
            const score = { healthy: 100, complete: 100, watch: 65, critical: 25 }[project.health] || 50;
            return sum + score;
          }, 0) / enrichedProjects.length
        )
      : 0;

    const budgetData = enrichedProjects
      .filter(project => project.budget > 0)
      .sort((a, b) => b.budget - a.budget)
      .slice(0, 6)
      .map(project => ({
        name: project.name?.length > 14 ? `${project.name.slice(0, 14)}...` : project.name,
        budget: project.budget,
        spent: project.spent
      }));

    const progressData = enrichedProjects
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 8)
      .map(project => ({
        name: project.name?.length > 12 ? `${project.name.slice(0, 12)}...` : project.name,
        progress: project.progress,
        timeline: Math.round(project.timelinePercent)
      }));

    const projectFocus = [...enrichedProjects]
      .sort((a, b) => {
        const riskRank = { critical: 3, watch: 2, healthy: 1, complete: 0 };
        return riskRank[b.health] - riskRank[a.health] || a.progress - b.progress;
      })
      .slice(0, 5);

    const priorityWork = [...openTasks]
      .filter(task => overdueTasks.some(overdueTask => overdueTask.id === task.id) || ['HIGH', 'CRITICAL'].includes(task.priority) || task.status === 'BLOCKED')
      .sort((a, b) => {
        const aDays = getDaysUntil(a.endDate) ?? 999;
        const bDays = getDaysUntil(b.endDate) ?? 999;
        return aDays - bDays || (TASK_PRIORITY_WEIGHT[b.priority] || 0) - (TASK_PRIORITY_WEIGHT[a.priority] || 0);
      })
      .slice(0, 6);

    const leadProject = projectFocus.find(project => project.status !== 'COMPLETED') || enrichedProjects[0];

    return {
      projects: enrichedProjects,
      totalProjects: enrichedProjects.length,
      activeProjects: enrichedProjects.filter(project => project.status === 'ACTIVE').length,
      totalBudget,
      totalSpent,
      budgetPercent: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
      averageProgress,
      totalTasks: tasks.length,
      openTasks: openTasks.length,
      completedTasks: completedTasks.length,
      taskCompletionPercent: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
      overdueTasks,
      dueSoonTasks,
      highPriorityTasks,
      healthCounts,
      healthData,
      statusData,
      portfolioScore,
      budgetData,
      progressData,
      projectFocus,
      priorityWork,
      leadProject
    };
  }, [projects, tasks]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-lg bg-gray-200 animate-pulse dark:bg-gray-800"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(item => (
            <div key={item} className="h-32 rounded-lg bg-gray-200 animate-pulse dark:bg-gray-800"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 h-80 rounded-lg bg-gray-200 animate-pulse dark:bg-gray-800"></div>
          <div className="h-80 rounded-lg bg-gray-200 animate-pulse dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  const hasProjects = analytics.totalProjects > 0;

  return (
    <div className="space-y-6">
      <section className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-primary-600 dark:text-primary-400">
            Portfolio command center
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal text-gray-950 dark:text-white">
            Construction Operations Dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
            Live project health, budget exposure, schedule pressure, and priority work across your portfolio.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => loadDashboardData({ silent: true })}
            disabled={refreshing}
            className="btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link to="/projects" className="btn-outline">
            Projects
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/tasks" className="btn-primary">
            Tasks
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Portfolio Health"
          value={`${analytics.portfolioScore}%`}
          detail={`${analytics.healthCounts.critical} critical, ${analytics.healthCounts.watch} on watch`}
          icon={ShieldCheck}
          tone={analytics.healthCounts.critical > 0 ? 'red' : analytics.healthCounts.watch > 0 ? 'amber' : 'green'}
        />
        <StatCard
          title="Active Projects"
          value={analytics.activeProjects}
          detail={`${analytics.totalProjects} total projects tracked`}
          icon={Building2}
          tone="blue"
        />
        <StatCard
          title="Budget Exposure"
          value={`${analytics.budgetPercent}%`}
          detail={`${formatCompactMoney(analytics.totalSpent)} used of ${formatCompactMoney(analytics.totalBudget)}`}
          icon={CircleDollarSign}
          tone={analytics.budgetPercent >= 90 ? 'red' : analytics.budgetPercent >= 75 ? 'amber' : 'green'}
        />
        <StatCard
          title="Delivery Pressure"
          value={analytics.overdueTasks.length}
          detail={`${analytics.dueSoonTasks.length} tasks due in 7 days`}
          icon={TimerReset}
          tone={analytics.overdueTasks.length > 0 ? 'red' : analytics.dueSoonTasks.length > 0 ? 'amber' : 'green'}
        />
      </section>

      {!hasProjects && (
        <section className="card text-center py-12">
          <Building2 className="w-10 h-10 mx-auto text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold">No projects yet</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create your first project to activate portfolio health, budget, task, and AI insight tracking.
          </p>
          <Link to="/projects" className="btn-primary mt-6">
            Create Project
          </Link>
        </section>
      )}

      {hasProjects && (
        <>
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="card xl:col-span-2">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Portfolio Performance</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Project progress compared with elapsed schedule.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg progress</p>
                    <p className="text-lg font-bold">{analytics.averageProgress}%</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Task done</p>
                    <p className="text-lg font-bold">{analytics.taskCompletionPercent}%</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Open tasks</p>
                    <p className="text-lg font-bold">{analytics.openTasks}</p>
                  </div>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.progressData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="timeline"
                      name="Schedule elapsed"
                      stroke="#d97706"
                      strokeWidth={2}
                      fill="transparent"
                    />
                    <Area
                      type="monotone"
                      dataKey="progress"
                      name="Progress"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="url(#progressFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Delivery Health</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Risk-weighted project portfolio.</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-right dark:bg-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                  <p className="text-xl font-bold">{analytics.portfolioScore}%</p>
                </div>
              </div>

              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.healthData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={3}
                    >
                      {analytics.healthData.map(item => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {analytics.healthData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="card xl:col-span-2">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Budget Control</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Largest project budgets against current spend.</p>
                </div>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>

              {analytics.budgetData.length === 0 ? (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-20">No budget data available.</p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.budgetData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCompactMoney} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="budget" name="Budget" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="spent" name="Spent" fill="#16a34a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-semibold">Status Mix</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio by project stage.</p>
                </div>
                <Target className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {analytics.statusData.map(item => {
                  const percent = analytics.totalProjects ? (item.value / analytics.totalProjects) * 100 : 0;
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden dark:bg-gray-700">
                        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: item.color }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="card xl:col-span-2">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-semibold">Project Focus</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Projects needing the most management attention.</p>
                </div>
                <Link to="/projects" className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  View all
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      <th className="py-3 pr-4 font-semibold">Project</th>
                      <th className="py-3 pr-4 font-semibold">Health</th>
                      <th className="py-3 pr-4 font-semibold">Progress</th>
                      <th className="py-3 pr-4 font-semibold">Budget Used</th>
                      <th className="py-3 pr-4 font-semibold">Finish</th>
                      <th className="py-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.projectFocus.map(project => {
                      const healthConfig = getHealthConfig(project.health);
                      return (
                        <tr key={project.id} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                          <td className="py-4 pr-4">
                            <p className="font-semibold text-gray-950 dark:text-white">{project.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{project.location || 'Location not set'}</p>
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${healthConfig.badge}`}>
                              {healthConfig.label}
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 rounded-full bg-gray-100 overflow-hidden dark:bg-gray-700">
                                <div className="h-full rounded-full bg-primary-600" style={{ width: `${project.progress}%` }}></div>
                              </div>
                              <span className="font-semibold">{Math.round(project.progress)}%</span>
                            </div>
                          </td>
                          <td className="py-4 pr-4">{Math.round(project.budgetPercent)}%</td>
                          <td className="py-4 pr-4">{formatDate(project.endDate)}</td>
                          <td className="py-4 text-right">
                            {project.id ? (
                              <Link to={`/projects/${project.id}`} className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                                Open
                              </Link>
                            ) : (
                              <span className="text-gray-400">Invalid</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-semibold">Priority Work</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Blocked, overdue, and high-priority tasks.</p>
                </div>
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>

              {analytics.priorityWork.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-green-500" />
                  <p className="mt-3 text-sm font-medium">No urgent task pressure</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Critical and overdue queues are clear.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.priorityWork.map(task => {
                    const daysUntilEnd = getDaysUntil(task.endDate);
                    const dueText = daysUntilEnd === null
                      ? 'No due date'
                      : daysUntilEnd < 0
                        ? `${Math.abs(daysUntilEnd)}d overdue`
                        : `Due in ${daysUntilEnd}d`;

                    return (
                      <div key={task.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{task.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {task.project?.name || 'Project not linked'}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="w-3.5 h-3.5" />
                            {dueText}
                          </span>
                          <span>{task.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="card xl:col-span-2">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-semibold">Execution Snapshot</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Task movement and schedule commitments.</p>
                </div>
                <CalendarClock className="w-5 h-5 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total tasks</p>
                  <p className="mt-2 text-2xl font-bold">{analytics.totalTasks}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="mt-2 text-2xl font-bold">{analytics.completedTasks}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">High priority</p>
                  <p className="mt-2 text-2xl font-bold">{analytics.highPriorityTasks.length}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Due soon</p>
                  <p className="mt-2 text-2xl font-bold">{analytics.dueSoonTasks.length}</p>
                </div>
              </div>
            </div>

            {analytics.leadProject ? (
              <AIInsightsWidget projectId={analytics.leadProject.id} />
            ) : (
              <div className="card">
                <h2 className="text-lg font-semibold">AI Insights</h2>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Create a project to activate insight generation.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
