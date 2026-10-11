import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportItem from './pages/ReportItem';
import ItemDetails from './pages/ItemDetails';
import Profile from './pages/Profile';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 text-xl font-black text-blue-600 tracking-tight">
          <span className="p-1.5 bg-blue-600 text-white rounded-lg text-sm">🎓</span>
          <span>Campus Lost & Found</span>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/"
            className={`text-sm font-semibold transition ${
              location.pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/report"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hidden sm:inline-block"
          >
            + Report Item
          </Link>

          {token ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className={`text-sm font-semibold transition ${
                  location.pathname === '/profile' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👤 {user?.fullName?.split(' ')[0] || 'My Activity'}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-gray-500 hover:text-red-600 transition ml-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-blue-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-blue-700 shadow-sm transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/report" element={<ReportItem />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
          Campus Lost & Found System • CSE Project
        </footer>
      </div>
    </Router>
  );
}

export default App;
