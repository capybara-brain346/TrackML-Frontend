import { StrictMode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ThemeToggle } from './components/ThemeToggle';
import { Dashboard } from './pages/Dashboard';
import { ModelList } from './pages/ModelList';
import { ModelDetail } from './pages/ModelDetail';
import { ModelComparison } from './pages/ModelComparison';
import { Workspaces } from './pages/Workspaces';
import { WorkspaceDetail } from './pages/WorkspaceDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuth } from './contexts/AuthContext';

const NavigationLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${isActive
        ? 'border-blue-500 text-gray-900 dark:text-white'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
        }`}
    >
      {children}
    </Link>
  );
};

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                TrackML
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavigationLink to="/">Dashboard</NavigationLink>
                <NavigationLink to="/workspaces">Workspaces</NavigationLink>
                <NavigationLink to="/models">Models</NavigationLink>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user && (
              <button
                onClick={logout}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <StrictMode>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Navigation />
              <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/workspaces"
                    element={
                      <ProtectedRoute>
                        <Workspaces />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/workspace/:id"
                    element={
                      <ProtectedRoute>
                        <WorkspaceDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/models"
                    element={
                      <ProtectedRoute>
                        <ModelList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/models/:id"
                    element={
                      <ProtectedRoute>
                        <ModelDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/compare"
                    element={
                      <ProtectedRoute>
                        <ModelComparison />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </StrictMode>
  );
}

export default App;
