import { StrictMode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { Dashboard } from './pages/Dashboard';
import { ModelList } from './pages/ModelList';
import { ModelDetail } from './pages/ModelDetail';

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
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavigationLink to="/">Dashboard</NavigationLink>
              <NavigationLink to="/models">Models</NavigationLink>
            </div>
          </div>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <StrictMode>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Navigation />
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/models" element={<ModelList />} />
                <Route path="/models/:id" element={<ModelDetail />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </StrictMode>
  );
}

export default App;
