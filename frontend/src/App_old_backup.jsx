import { Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import NotificationBell from './components/Notifications/NotificationBell';
import ProtectedRoute from './components/ProtectedRoute';
import {
  DashboardPage,
  AnalyticsPage,
  BOQPage,
  ResourcesPage,
  SettingsPage
} from './pages';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import MaterialsPage from './pages/MaterialsPage';
import ReportsPage from './pages/ReportsPage';

// Import pages (to be created)
// import Dashboard from './pages/Dashboard';
// import Login from './pages/Login';
// import Projects from './pages/Projects';

function App() {
  return (
    <>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        richColors
        expand={false}
        closeButton
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="boq" element={<BOQPage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

// Placeholder Components
const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already logged in
  if (user) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Construction AI</h1>
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Use your registered credentials to login
        </p>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  const location = useLocation();

  // Get page title from current path
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 relative">
        <div className="p-4">
          <h1 className="text-xl font-bold">Construction AI</h1>
        </div>
        <nav className="mt-6">
          {['Dashboard', 'Projects', 'Tasks', 'Resources', 'BOQ', 'Materials', 'Reports', 'Analytics', 'Settings'].map(item => {
            const path = `/${item.toLowerCase()}`;
            const isActive = location.pathname === path || (path === '/dashboard' && location.pathname === '/');
            return (
              <Link
                key={item}
                to={path}
                className={`block px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-semibold border-r-4 border-primary-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
          <Link to="/login" className="block px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
            Login Page
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{getPageTitle()}</h2>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <button className="btn-ghost">Profile</button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const DashboardContent = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { title: 'Total Projects', value: '12', change: '+2 this month' },
        { title: 'Active Tasks', value: '156', change: '65% complete' },
        { title: 'Budget Used', value: '₹45.2M', change: '56% of total' },
        { title: 'Workers', value: '45', change: '12 active today' },
      ].map((stat, index) => (
        <div key={index} className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</h3>
          <p className="text-3xl font-bold mt-2">{stat.value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.change}</p>
        </div>
      ))}
    </div>

    {/* AI Insights Widget */}
    <AIInsightsWidget projectId="sample-project-id" />

    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Welcome to Construction AI Platform</h3>
      <p className="text-gray-600 dark:text-gray-400">
        This is a comprehensive AI-driven construction planning and management platform.
        The application is now set up with the basic structure. You can start building
        individual components and pages.
      </p>
      <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900 rounded-lg">
        <h4 className="font-semibold text-primary-900 dark:text-primary-100">🚀 Quick Start</h4>
        <ul className="mt-2 space-y-1 text-sm text-primary-800 dark:text-primary-200">
          <li>• Backend API is running on http://localhost:5000</li>
          <li>• Frontend is running on http://localhost:3000</li>
          <li>• Database schema is ready to be migrated</li>
          <li>• Socket.IO for real-time updates is configured</li>
        </ul>
      </div>
    </div>
  </div>
);

const DashboardPage = () => <DashboardContent />;

const ProjectsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    status: 'PLANNING'
  });

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
      setFormData({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        totalBudget: '',
        status: 'PLANNING'
      });
      loadProjects(); // Reload projects
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    const colors = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      completed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
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
      on_hold: 'On Hold'
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
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">+2 this month</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</h3>
          <p className="text-3xl font-bold mt-2">{projects.filter(p => p.status === 'active').length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">In progress</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</h3>
          <p className="text-3xl font-bold mt-2">₹721.2M</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Across all projects</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</h3>
          <p className="text-3xl font-bold mt-2">56%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Average progress</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map(project => (
          <div key={project.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {project.location || 'Location not set'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {getStatusLabel(project.status)}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {project.description || 'No description'}
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-semibold">{parseFloat(project.progress || 0).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${parseFloat(project.progress || 0)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                  <p className="font-semibold">₹{parseFloat(project.totalBudget || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="text-sm">{new Date(project.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">End Date</p>
                  <p className="text-sm">{new Date(project.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                  <p className="text-sm">{project._count?.members || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link to={`/projects/${project.id}`} className="btn-ghost flex-1 text-center">
                View Details
              </Link>
              <button className="btn-ghost">Edit</button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No projects found matching your criteria</p>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New Project</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleCreateProject}>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Project location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
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
                  <label className="block text-sm font-medium mb-2">Budget (₹)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="Enter budget amount"
                    value={formData.totalBudget}
                    onChange={(e) => setFormData({...formData, totalBudget: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="input"
                    rows="4"
                    placeholder="Project description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Create Project
                  </button>
                  <button
                    type="button"
                    className="btn-ghost flex-1"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectDetailPage = () => <div className="card">Project Detail Page - Under Development</div>;

const TasksPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectId: '',
    taskType: 'GENERAL',
    priority: 'MEDIUM',
    status: 'PENDING',
    startDate: '',
    endDate: ''
  });

  // Fetch tasks and projects from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, projectsResponse] = await Promise.all([
        taskService.getAll(),
        projectService.getAll()
      ]);
      setTasks(tasksResponse.data.tasks || []);
      setProjects(projectsResponse.data.projects || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.create(formData);
      toast.success('Task created successfully!');
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        projectId: '',
        taskType: 'GENERAL',
        priority: 'MEDIUM',
        status: 'PENDING',
        startDate: '',
        endDate: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  // Organize tasks by status
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'PENDING'),
    in_progress: tasks.filter(t => t.status === 'IN_PROGRESS'),
    review: tasks.filter(t => t.status === 'DELAYED' || t.status === 'BLOCKED'),
    completed: tasks.filter(t => t.status === 'COMPLETED'),
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    };
    return colors[priority] || colors.medium;
  };

  const statusConfig = {
    todo: { title: 'To Do', color: 'bg-gray-100 dark:bg-gray-700' },
    in_progress: { title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900' },
    review: { title: 'Review', color: 'bg-purple-100 dark:bg-purple-900' },
    completed: { title: 'Completed', color: 'bg-green-100 dark:bg-green-900' },
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
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</h3>
          <p className="text-3xl font-bold mt-2">{tasks.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</h3>
          <p className="text-3xl font-bold mt-2">{tasksByStatus.in_progress.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</h3>
          <p className="text-3xl font-bold mt-2">{tasksByStatus.completed.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">High Priority</h3>
          <p className="text-3xl font-bold mt-2">
            {tasks.filter(t => t.priority === 'HIGH').length}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Task Board</h2>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="flex flex-col">
            <div className={`${config.color} rounded-t-lg p-4`}>
              <h3 className="font-semibold flex justify-between items-center">
                {config.title}
                <span className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                  {tasksByStatus[status].length}
                </span>
              </h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-b-lg p-4 space-y-3 min-h-[400px]">
              {tasksByStatus[status].map(task => (
                <div
                  key={task.id}
                  className="card hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{task.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority?.toLowerCase() || 'medium')}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {task.project?.name || 'No Project'}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {task.assignments?.[0]?.user?.firstName || 'Unassigned'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'No due date'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New Task</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleCreateTask}>
                <div>
                  <label className="block text-sm font-medium mb-2">Task Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter task name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="input"
                    rows="3"
                    placeholder="Task description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project</label>
                    <select
                      className="input"
                      value={formData.projectId}
                      onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                      required
                    >
                      <option value="">Select project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Task Type</label>
                    <select
                      className="input"
                      value={formData.taskType}
                      onChange={(e) => setFormData({...formData, taskType: e.target.value})}
                      required
                    >
                      <option value="GENERAL">General</option>
                      <option value="CONSTRUCTION">Construction</option>
                      <option value="INSPECTION">Inspection</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      className="input"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      required
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      className="input"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      required
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="DELAYED">Delayed</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Create Task
                  </button>
                  <button
                    type="button"
                    className="btn-ghost flex-1"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const MaterialsPage = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    materialId: '',
    quantity: '',
    expectedDelivery: '',
    supplier: '',
    notes: ''
  });

  // Fetch materials and orders from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryResponse, ordersResponse] = await Promise.all([
        materialService.getInventory(),
        materialService.getOrders()
      ]);
      setMaterials(inventoryResponse.data.inventory || []);
      setOrders(ordersResponse.data.orders || []);
    } catch (error) {
      console.error('Failed to load materials data:', error);
      toast.error('Failed to load materials and orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await materialService.createOrder(formData);
      toast.success('Order created successfully!');
      setShowOrderModal(false);
      setFormData({
        materialId: '',
        quantity: '',
        expectedDelivery: '',
        supplier: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      adequate: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      low: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      IN_TRANSIT: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return colors[status] || colors.adequate;
  };

  // Calculate low stock items
  const lowStockItems = materials.filter(m =>
    parseFloat(m.currentStock || 0) < parseFloat(m.minStock || 0)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Materials</h3>
          <p className="text-3xl font-bold mt-2">{materials.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Items</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">
            {lowStockItems.length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Orders</h3>
          <p className="text-3xl font-bold mt-2">
            {orders.filter(o => o.status === 'PENDING').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">{orders.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'orders'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </div>

        <div className="mt-6">
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  placeholder="Search materials..."
                  className="input flex-1 max-w-md"
                />
                <button className="btn-primary" onClick={() => setShowOrderModal(true)}>
                  + New Order
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Material</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Min Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price/Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Supplier</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {materials.map(material => {
                      const isLowStock = parseFloat(material.currentStock || 0) < parseFloat(material.minStock || 0);
                      const status = isLowStock ? 'low' : 'adequate';
                      return (
                        <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-4 font-medium">{material.name}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{material.category || 'N/A'}</td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-semibold">{parseFloat(material.currentStock || 0).toFixed(2)}</span>
                            <span className="text-sm text-gray-500 ml-1">{material.unit}</span>
                          </td>
                          <td className="px-4 py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                            {parseFloat(material.minStock || 0).toFixed(2)} {material.unit}
                          </td>
                          <td className="px-4 py-4 text-right font-medium">₹{parseFloat(material.unitPrice || 0).toLocaleString()}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{material.supplier || 'N/A'}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                              onClick={() => {
                                setFormData({...formData, materialId: material.id});
                                setShowOrderModal(true);
                              }}
                            >
                              Order
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No orders found
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{order.material?.name || 'Material Order'}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Quantity</p>
                            <p className="font-medium">{parseFloat(order.quantity || 0).toFixed(2)} {order.material?.unit || 'units'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Supplier</p>
                            <p className="font-medium">{order.supplier || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Order Date</p>
                            <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Expected Delivery</p>
                            <p className="font-medium">{new Date(order.expectedDelivery).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <p className="text-lg font-bold">₹{parseFloat(order.totalCost || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New Order</h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleCreateOrder}>
                <div>
                  <label className="block text-sm font-medium mb-2">Material</label>
                  <select
                    className="input"
                    value={formData.materialId}
                    onChange={(e) => setFormData({...formData, materialId: e.target.value})}
                    required
                  >
                    <option value="">Select material</option>
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Delivery</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.expectedDelivery}
                      onChange={(e) => setFormData({...formData, expectedDelivery: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Supplier</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Supplier name"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    className="input"
                    rows="3"
                    placeholder="Additional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Place Order
                  </button>
                  <button
                    type="button"
                    className="btn-ghost flex-1"
                    onClick={() => setShowOrderModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BOQPage = () => {
  const [selectedProject, setSelectedProject] = useState('1');
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  // Mock BOQ data
  const boqItems = [
    { id: 1, category: 'Excavation', item: 'Site Excavation', description: 'Bulk excavation for foundation', unit: 'Cubic Meter', quantity: 1200, rate: 250, amount: 300000 },
    { id: 2, category: 'Concrete', item: 'M25 Grade Concrete', description: 'For foundation and columns', unit: 'Cubic Meter', quantity: 450, rate: 5500, amount: 2475000 },
    { id: 3, category: 'Steel', item: 'TMT Bars (Fe 500)', description: 'Reinforcement steel', unit: 'Ton', quantity: 85, rate: 52000, amount: 4420000 },
    { id: 4, category: 'Masonry', item: 'Brick Masonry', description: '230mm thick wall', unit: 'Square Meter', quantity: 3500, rate: 850, amount: 2975000 },
    { id: 5, category: 'Finishing', item: 'Plaster (Internal)', description: '12mm cement plaster', unit: 'Square Meter', quantity: 5200, rate: 180, amount: 936000 },
    { id: 6, category: 'Finishing', item: 'Floor Tiles', description: '600x600mm vitrified tiles', unit: 'Square Meter', quantity: 2800, rate: 450, amount: 1260000 },
    { id: 7, category: 'Electrical', item: 'Electrical Wiring', description: 'Complete wiring work', unit: 'Point', quantity: 450, rate: 1200, amount: 540000 },
    { id: 8, category: 'Plumbing', item: 'Plumbing Work', description: 'Water supply and drainage', unit: 'Point', quantity: 180, rate: 2500, amount: 450000 },
  ];

  const categories = [...new Set(boqItems.map(item => item.category))];

  const totalAmount = boqItems.reduce((sum, item) => sum + item.amount, 0);

  const getCategorySummary = () => {
    return categories.map(category => {
      const categoryItems = boqItems.filter(item => item.category === category);
      const categoryTotal = categoryItems.reduce((sum, item) => sum + item.amount, 0);
      return { category, total: categoryTotal, items: categoryItems.length };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bill of Quantities (BOQ)</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Detailed cost estimation and quantities
          </p>
        </div>
        <div className="flex gap-3">
          <select
            className="input w-64"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="1">Residential Complex - Phase 1</option>
            <option value="2">Commercial Tower - Downtown</option>
            <option value="3">Highway Bridge Construction</option>
          </select>
          <button className="btn-primary" onClick={() => setShowAddItemModal(true)}>
            + Add Item
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total BOQ Value</h3>
          <p className="text-3xl font-bold mt-2">₹{(totalAmount / 10000000).toFixed(2)}Cr</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {boqItems.length} items
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</h3>
          <p className="text-3xl font-bold mt-2">{categories.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Work categories</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</h3>
          <p className="text-3xl font-bold mt-2">65%</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">On track</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Value</h3>
          <p className="text-3xl font-bold mt-2">₹{((totalAmount * 0.35) / 10000000).toFixed(2)}Cr</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">35% remaining</p>
        </div>
      </div>

      {/* Category Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Category-wise Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getCategorySummary().map((cat, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-1">
                {cat.category}
              </h4>
              <p className="text-2xl font-bold">₹{(cat.total / 100000).toFixed(2)}L</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {cat.items} items • {((cat.total / totalAmount) * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* BOQ Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Detailed BOQ</h3>
          <div className="flex gap-2">
            <button className="btn-ghost text-sm">Export Excel</button>
            <button className="btn-ghost text-sm">Print PDF</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rate (₹)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount (₹)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {boqItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium">{item.item}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                    {item.description}
                  </td>
                  <td className="px-4 py-4 text-center text-sm">{item.unit}</td>
                  <td className="px-4 py-4 text-right font-medium">{item.quantity}</td>
                  <td className="px-4 py-4 text-right">{item.rate.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right font-bold">
                    {item.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button className="text-primary-600 hover:text-primary-700 text-sm mr-2">Edit</button>
                    <button className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                <td colSpan="7" className="px-4 py-4 text-right">Total BOQ Value:</td>
                <td className="px-4 py-4 text-right text-lg">₹{totalAmount.toLocaleString()}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add BOQ Item</h2>
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select className="input" required>
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="new">+ Add New Category</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Item Name</label>
                    <input type="text" className="input" placeholder="Item name" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea className="input" rows="2" placeholder="Item description"></textarea>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Unit</label>
                    <select className="input" required>
                      <option value="Cubic Meter">Cubic Meter</option>
                      <option value="Square Meter">Square Meter</option>
                      <option value="Ton">Ton</option>
                      <option value="Kilogram">Kilogram</option>
                      <option value="Piece">Piece</option>
                      <option value="Point">Point</option>
                      <option value="Running Meter">Running Meter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <input type="number" className="input" placeholder="0" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rate (₹)</label>
                    <input type="number" className="input" placeholder="0.00" required />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Estimated Amount:</span>
                    <span className="text-2xl font-bold text-primary-600">₹0.00</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Add Item
                  </button>
                  <button
                    type="button"
                    className="btn-ghost flex-1"
                    onClick={() => setShowAddItemModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState('workers');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock workers data
  const workers = [
    { id: 1, name: 'Ramesh Yadav', role: 'Mason', project: 'Residential Complex', skills: ['Brickwork', 'Plastering'], experience: 8, status: 'active', phone: '+91 98765 43210' },
    { id: 2, name: 'Sunil Kumar', role: 'Electrician', project: 'Commercial Tower', skills: ['Wiring', 'Panel Installation'], experience: 5, status: 'active', phone: '+91 98765 43211' },
    { id: 3, name: 'Prakash Singh', role: 'Plumber', project: 'Residential Complex', skills: ['Pipe Fitting', 'Sanitary Work'], experience: 6, status: 'active', phone: '+91 98765 43212' },
    { id: 4, name: 'Rajesh Verma', role: 'Carpenter', project: 'Highway Bridge', skills: ['Formwork', 'Shuttering'], experience: 10, status: 'active', phone: '+91 98765 43213' },
    { id: 5, name: 'Mukesh Thakur', role: 'Steel Fitter', project: 'Commercial Tower', skills: ['Bar Bending', 'Steel Fixing'], experience: 7, status: 'on_leave', phone: '+91 98765 43214' },
  ];

  // Mock equipment data
  const equipment = [
    { id: 1, name: 'Tower Crane TC-5013', type: 'Crane', project: 'Commercial Tower', status: 'active', condition: 'good', lastMaintenance: '2024-05-15', nextMaintenance: '2024-07-15' },
    { id: 2, name: 'Concrete Mixer CM-350', type: 'Mixer', project: 'Residential Complex', status: 'active', condition: 'excellent', lastMaintenance: '2024-05-20', nextMaintenance: '2024-07-20' },
    { id: 3, name: 'Excavator EX-200', type: 'Excavator', project: 'Highway Bridge', status: 'maintenance', condition: 'fair', lastMaintenance: '2024-06-05', nextMaintenance: '2024-06-15' },
    { id: 4, name: 'Bulldozer BD-100', type: 'Bulldozer', project: 'Metro Station', status: 'active', condition: 'good', lastMaintenance: '2024-05-10', nextMaintenance: '2024-07-10' },
    { id: 5, name: 'Compactor CR-50', type: 'Compactor', project: 'Highway Bridge', status: 'idle', condition: 'excellent', lastMaintenance: '2024-05-25', nextMaintenance: '2024-07-25' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      idle: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      maintenance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      on_leave: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    };
    return colors[status] || colors.active;
  };

  const getConditionColor = (condition) => {
    const colors = {
      excellent: 'text-green-600 dark:text-green-400',
      good: 'text-blue-600 dark:text-blue-400',
      fair: 'text-yellow-600 dark:text-yellow-400',
      poor: 'text-red-600 dark:text-red-400',
    };
    return colors[condition] || colors.good;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workers</h3>
          <p className="text-3xl font-bold mt-2">{workers.length}</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {workers.filter(w => w.status === 'active').length} active
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Equipment</h3>
          <p className="text-3xl font-bold mt-2">{equipment.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {equipment.filter(e => e.status === 'active').length} operational
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Utilization</h3>
          <p className="text-3xl font-bold mt-2">85%</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Above target</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Maintenance Due</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">2</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This week</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'workers'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('workers')}
            >
              Workers
            </button>
            <button
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'equipment'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('equipment')}
            >
              Equipment
            </button>
          </div>
          <button className="btn-primary mb-3" onClick={() => setShowAddModal(true)}>
            + Add {activeTab === 'workers' ? 'Worker' : 'Equipment'}
          </button>
        </div>

        <div className="mt-6">
          {activeTab === 'workers' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {workers.map(worker => (
                <div key={worker.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{worker.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{worker.role}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(worker.status)}`}>
                      {worker.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Project:</span>
                      <span className="font-medium">{worker.project}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Experience:</span>
                      <span className="font-medium">{worker.experience} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                      <span className="font-medium">{worker.phone}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Skills:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {worker.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button className="btn-ghost text-sm flex-1">View Details</button>
                    <button className="btn-ghost text-sm">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Equipment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Project</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Condition</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Maintenance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Next Due</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {equipment.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 font-medium">{item.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{item.type}</td>
                      <td className="px-4 py-4 text-sm">{item.project}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-medium ${getConditionColor(item.condition)}`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{item.lastMaintenance}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{item.nextMaintenance}</td>
                      <td className="px-4 py-4 text-center">
                        <button className="text-primary-600 hover:text-primary-700 text-sm mr-2">Details</button>
                        <button className="text-primary-600 hover:text-primary-700 text-sm">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Add {activeTab === 'workers' ? 'Worker' : 'Equipment'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                {activeTab === 'workers' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <input type="text" className="input" placeholder="Worker name" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Role</label>
                        <select className="input" required>
                          <option value="">Select role</option>
                          <option value="Mason">Mason</option>
                          <option value="Electrician">Electrician</option>
                          <option value="Plumber">Plumber</option>
                          <option value="Carpenter">Carpenter</option>
                          <option value="Steel Fitter">Steel Fitter</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <input type="tel" className="input" placeholder="+91 98765 43210" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Experience (years)</label>
                        <input type="number" className="input" placeholder="0" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Assign to Project</label>
                      <select className="input" required>
                        <option value="">Select project</option>
                        <option value="1">Residential Complex</option>
                        <option value="2">Commercial Tower</option>
                        <option value="3">Highway Bridge</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Skills (comma separated)</label>
                      <input type="text" className="input" placeholder="e.g., Brickwork, Plastering" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Equipment Name</label>
                        <input type="text" className="input" placeholder="Equipment name" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Type</label>
                        <select className="input" required>
                          <option value="">Select type</option>
                          <option value="Crane">Crane</option>
                          <option value="Mixer">Mixer</option>
                          <option value="Excavator">Excavator</option>
                          <option value="Bulldozer">Bulldozer</option>
                          <option value="Compactor">Compactor</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Assign to Project</label>
                      <select className="input" required>
                        <option value="">Select project</option>
                        <option value="1">Residential Complex</option>
                        <option value="2">Commercial Tower</option>
                        <option value="3">Highway Bridge</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Condition</label>
                        <select className="input" required>
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Maintenance</label>
                        <input type="date" className="input" required />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Add {activeTab === 'workers' ? 'Worker' : 'Equipment'}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost flex-1"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [showReportModal, setShowReportModal] = useState(false);
  const [dailyReports, setDailyReports] = useState([]);
  const [siteIssues, setSiteIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [reportFormData, setReportFormData] = useState({
    projectId: '',
    weather: '',
    workersCount: '',
    workHours: '',
    summary: '',
    completedTasks: '',
    pendingTasks: '',
    materialsUsed: ''
  });
  const [issueFormData, setIssueFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    severity: 'MEDIUM',
    issueType: 'QUALITY'
  });

  // Fetch data from API
  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadData();
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll();
      const projectList = response.data.projects || [];
      setProjects(projectList);
      if (projectList.length > 0) {
        setSelectedProjectId(projectList[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!selectedProjectId) return;

    try {
      setLoading(true);
      const [reportsResponse, issuesResponse] = await Promise.all([
        reportService.getDailyReports(selectedProjectId),
        reportService.getSiteIssues(selectedProjectId)
      ]);
      setDailyReports(reportsResponse.data.reports || []);
      setSiteIssues(issuesResponse.data.issues || []);
    } catch (error) {
      console.error('Failed to load reports data:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      await reportService.createDailyReport(reportFormData);
      toast.success('Report created successfully!');
      setShowReportModal(false);
      setReportFormData({
        projectId: '',
        weather: '',
        workersCount: '',
        workHours: '',
        summary: '',
        completedTasks: '',
        pendingTasks: '',
        materialsUsed: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to create report:', error);
      toast.error(error.response?.data?.message || 'Failed to create report');
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      await reportService.createSiteIssue(issueFormData);
      toast.success('Issue reported successfully!');
      setShowReportModal(false);
      setIssueFormData({
        projectId: '',
        title: '',
        description: '',
        severity: 'MEDIUM',
        issueType: 'QUALITY'
      });
      loadData();
    } catch (error) {
      console.error('Failed to create issue:', error);
      toast.error(error.response?.data?.message || 'Failed to report issue');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    };
    return colors[severity] || colors.medium;
  };

  const getIssueStatusColor = (status) => {
    const colors = {
      open: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    };
    return colors[status] || colors.open;
  };

  if (loading && !selectedProjectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      <div className="card">
        <label className="block text-sm font-medium mb-2">Select Project</label>
        <select
          className="input max-w-md"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          <option value="">Choose a project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Reports</h3>
          <p className="text-3xl font-bold mt-2">{dailyReports.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This project</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Issues</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">
            {siteIssues.filter(i => i.status === 'OPEN').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Requires attention</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workers</h3>
          <p className="text-3xl font-bold mt-2">
            {dailyReports.reduce((sum, r) => sum + parseInt(r.workersCount || 0), 0)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">From reports</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Issues</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">
            {siteIssues.filter(i => i.severity === 'CRITICAL' && i.status === 'OPEN').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Urgent</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'daily'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('daily')}
            >
              Daily Reports
            </button>
            <button
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'issues'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('issues')}
            >
              Site Issues
            </button>
          </div>
          <button className="btn-primary mb-3" onClick={() => setShowReportModal(true)}>
            + {activeTab === 'daily' ? 'New Report' : 'Report Issue'}
          </button>
        </div>

        <div className="mt-6">
          {activeTab === 'daily' && (
            <div className="space-y-4">
              {dailyReports.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No daily reports found for this project
                </div>
              ) : (
                dailyReports.map(report => (
                  <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{report.project?.name || 'Project Report'}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(report.date).toLocaleDateString()} • Reported by {report.reporter?.firstName || 'Unknown'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Weather</p>
                        <p className="font-medium">{report.weather || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Workers</p>
                        <p className="font-medium">{report.workersCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Work Hours</p>
                        <p className="font-medium">{report.workHours || 0}h</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summary</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{report.summary || 'No summary available'}</p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button className="btn-ghost text-sm">View Details</button>
                      <button className="btn-ghost text-sm">Download PDF</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="space-y-4">
              {siteIssues.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No issues found for this project
                </div>
              ) : (
                siteIssues.map(issue => (
                  <div key={issue.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{issue.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity?.toLowerCase() || 'medium')}`}>
                            {issue.severity}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getIssueStatusColor(issue.status?.toLowerCase() || 'open')}`}>
                            {issue.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {issue.project?.name || 'Project'} • Reported by {issue.reporter?.firstName || 'Unknown'} on {new Date(issue.reportedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{issue.description || 'No description'}</p>

                    <div className="flex gap-2">
                      <button className="btn-ghost text-sm">View Details</button>
                      {issue.status !== 'RESOLVED' && (
                        <>
                          <button className="btn-ghost text-sm">Update Status</button>
                          <button className="btn-ghost text-sm">Add Comment</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Report/Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {activeTab === 'daily' ? 'Submit Daily Report' : 'Report Site Issue'}
                </h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                {activeTab === 'daily' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <input type="date" className="input" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Project</label>
                        <select className="input" required>
                          <option value="">Select project</option>
                          <option value="1">Residential Complex</option>
                          <option value="2">Commercial Tower</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Weather</label>
                        <select className="input" required>
                          <option value="sunny">Sunny</option>
                          <option value="cloudy">Cloudy</option>
                          <option value="rainy">Rainy</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Workers Present</label>
                        <input type="number" className="input" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Work Hours</label>
                        <input type="number" className="input" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Progress Summary</label>
                      <textarea className="input" rows="4" placeholder="Describe the work completed today" required></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Safety Observations</label>
                      <textarea className="input" rows="3" placeholder="Any safety concerns or observations"></textarea>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Issue Title</label>
                      <input type="text" className="input" placeholder="Brief description of the issue" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Project</label>
                        <select className="input" required>
                          <option value="">Select project</option>
                          <option value="1">Residential Complex</option>
                          <option value="2">Commercial Tower</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Severity</label>
                        <select className="input" required>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea className="input" rows="4" placeholder="Detailed description of the issue" required></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Suggested Action</label>
                      <textarea className="input" rows="2" placeholder="Recommended actions to resolve"></textarea>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Submit
                  </button>
                  <button
                    type="button"
                    className="btn-ghost flex-1"
                    onClick={() => setShowReportModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const AnalyticsPage = () => {
  const [timePeriod, setTimePeriod] = useState('month');

  // Mock analytics data
  const budgetData = [
    { project: 'Residential Complex', budget: 45.2, spent: 29.4, remaining: 15.8 },
    { project: 'Commercial Tower', budget: 125, spent: 52.5, remaining: 72.5 },
    { project: 'Highway Bridge', budget: 89, spent: 13.3, remaining: 75.7 },
    { project: 'Smart City', budget: 250, spent: 195, remaining: 55 },
  ];

  const progressData = [
    { month: 'Jan', completed: 65 },
    { month: 'Feb', completed: 72 },
    { month: 'Mar', completed: 68 },
    { month: 'Apr', completed: 85 },
    { month: 'May', completed: 92 },
    { month: 'Jun', completed: 78 },
  ];

  const resourceUtilization = [
    { resource: 'Workers', utilization: 85, total: 200, active: 170 },
    { resource: 'Equipment', utilization: 72, total: 45, active: 32 },
    { resource: 'Materials', utilization: 68, total: 100, active: 68 },
  ];

  const aiInsights = [
    { id: 1, type: 'warning', title: 'Budget Overrun Risk', description: 'Commercial Tower project trending 8% over budget based on current spend rate', recommendation: 'Review material procurement costs and optimize resource allocation' },
    { id: 2, type: 'success', title: 'Schedule Performance', description: 'Residential Complex is 5 days ahead of schedule', recommendation: 'Consider reallocating resources to delayed projects' },
    { id: 3, type: 'info', title: 'Weather Impact', description: 'Forecast shows 3 days of rain next week', recommendation: 'Plan indoor activities and reschedule outdoor concrete work' },
    { id: 4, type: 'warning', title: 'Material Stock Alert', description: 'Steel TMT Bars inventory below minimum threshold', recommendation: 'Place urgent order to avoid work stoppage' },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</h3>
          <p className="text-3xl font-bold mt-2">₹509.2M</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">↑ 12% from last period</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</h3>
          <p className="text-3xl font-bold mt-2">₹290.2M</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">57% of budget</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Progress</h3>
          <p className="text-3xl font-bold mt-2">76.8%</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">↑ 4.2% this month</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Efficiency Score</h3>
          <p className="text-3xl font-bold mt-2">8.4/10</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Above target</p>
        </div>
      </div>

      {/* Budget Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6">Budget Analysis by Project</h3>
        <div className="space-y-6">
          {budgetData.map((project, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{project.project}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ₹{project.spent}M / ₹{project.budget}M
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-primary-600 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${(project.spent / project.budget) * 100}%` }}
                >
                  <span className="text-xs text-white font-medium">
                    {((project.spent / project.budget) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Spent: ₹{project.spent}M</span>
                <span>Remaining: ₹{project.remaining}M</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Trend */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6">Task Completion Trend</h3>
        <div className="flex items-end justify-between h-64 gap-4">
          {progressData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative" style={{ height: `${(data.completed / 100) * 100}%` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg"></div>
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold">
                  {data.completed}
                </span>
              </div>
              <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6">Resource Utilization</h3>
        <div className="space-y-6">
          {resourceUtilization.map((resource, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{resource.resource}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {resource.active} / {resource.total} ({resource.utilization}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    resource.utilization >= 80
                      ? 'bg-green-600'
                      : resource.utilization >= 60
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${resource.utilization}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6">🤖 AI-Powered Insights</h3>
        <div className="space-y-4">
          {aiInsights.map(insight => (
            <div
              key={insight.id}
              className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {insight.description}
                  </p>
                  <div className="text-sm">
                    <span className="font-medium">Recommendation: </span>
                    <span className="text-gray-600 dark:text-gray-400">{insight.recommendation}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card space-y-1">
            <button
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'account'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
            <button
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'system'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('system')}
            >
              System
            </button>
            <button
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'security'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-2xl font-bold text-primary-700 dark:text-primary-300">
                      JD
                    </div>
                    <div>
                      <button className="btn-ghost text-sm">Change Photo</button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        JPG, PNG or GIF (max. 2MB)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input type="text" className="input" defaultValue="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input type="text" className="input" defaultValue="Doe" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input type="email" className="input" defaultValue="john.doe@construction.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input type="tel" className="input" defaultValue="+91 98765 43210" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <input type="text" className="input" defaultValue="Project Manager" disabled />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      className="input"
                      rows="3"
                      defaultValue="Experienced project manager with 10+ years in construction industry"
                    ></textarea>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button className="btn-primary">Save Changes</button>
                    <button className="btn-ghost">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="card space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <select className="input">
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Timezone</label>
                    <select className="input">
                      <option value="IST">India Standard Time (IST)</option>
                      <option value="PST">Pacific Standard Time (PST)</option>
                      <option value="EST">Eastern Standard Time (EST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date Format</label>
                    <select className="input">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <select className="input">
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button className="btn-primary">Save Changes</button>
                    <button className="btn-ghost">Cancel</button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Delete Account</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive email updates about your projects
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive push notifications on your devices
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-medium">Task Updates</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified when tasks are updated
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-medium">Material Alerts</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Low stock and delivery notifications
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="font-medium">Weekly Reports</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive weekly project summary reports
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button className="btn-primary">Save Preferences</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="card space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">System Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-medium">Dark Mode</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enable dark theme for the application
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-medium">Auto Save</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Automatically save your work
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="py-3">
                    <h4 className="font-medium mb-2">Data Export</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Export all your project data
                    </p>
                    <button className="btn-ghost">Export Data</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Change Password</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <input type="password" className="input" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <input type="password" className="input" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                        <input type="password" className="input" />
                      </div>
                      <button className="btn-primary">Update Password</button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium mb-3">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Add an extra layer of security to your account
                    </p>
                    <button className="btn-ghost">Enable 2FA</button>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium mb-3">Active Sessions</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Windows • Chrome</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Mumbai, India • Current session
                          </p>
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-400">Active now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Page not found</p>
      <Link to="/" className="btn-primary mt-6">Go Home</Link>
    </div>
  </div>
);

export default App;
