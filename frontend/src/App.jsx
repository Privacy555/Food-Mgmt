import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Utensils, LogOut } from 'lucide-react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import RegisterVendor from './pages/RegisterVendor';
import RegisterReceiver from './pages/RegisterReceiver';

// Landing Page
const Landing = () => (
  <div className="container mt-8 text-center animate-fade-in">
    <h1 className="text-4xl mb-4">Food Management System</h1>
    <p className="text-muted text-2xl mb-8">Bridging the gap between surplus food and those in need.</p>
    <div className="flex justify-center gap-4">
      <Link to="/vendor/login" className="btn btn-primary">I am a Vendor</Link>
      <Link to="/receiver/login" className="btn btn-secondary">I am a Receiver</Link>
    </div>
  </div>
);

// Navbar Component
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="nav-brand">
          <Utensils size={28} color="var(--primary-color)" />
          FoodShare
        </Link>
        <div className="nav-links">
          {!user ? (
            <>
              <Link to="/vendor/login" className="nav-link">Vendor</Link>
              <Link to="/receiver/login" className="nav-link">Receiver</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
            </>
          ) : (
            <>
              <span className="text-muted mr-4">Logged in as {user.role}</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route path="/admin" element={<Login role="admin" endpoint="/admin/admin/login" title="Admin Login" />} />
        <Route path="/vendor/login" element={<Login role="vendor" endpoint="/vendors/login" title="Vendor Login" />} />
        <Route path="/receiver/login" element={<Login role="receiver" endpoint="/receivers/login" title="Receiver Login" />} />
        <Route path="/vendor/register" element={<RegisterVendor />} />
        <Route path="/receiver/register" element={<RegisterReceiver />} />
        
        {/* Protected Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/receiver/dashboard" element={<ReceiverDashboard />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
