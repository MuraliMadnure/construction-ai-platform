import { Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import NotificationBell from './components/Notifications/NotificationBell';
import ProtectedRoute from './components/ProtectedRoute';

// Import all page components
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TasksPage from './pages/TasksPage';
import MaterialsPage from './pages/MaterialsPage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BOQPage from './pages/BOQPage';
import ResourcesPage from './pages/ResourcesPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors expand={false} closeButton />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

const DashboardLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="min-h-screen flex">
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
          <button 
            onClick={logout}
            className="block w-full px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{getPageTitle()}</h2>
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
      <Link to="/dashboard" className="btn-primary">
        Go to Dashboard
      </Link>
    </div>
  </div>
);

export default App;
