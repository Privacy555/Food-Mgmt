import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Utensils, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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

  const getDashboardLink = () => {
    if (!user) return null;
    const role = user.role?.toLowerCase();
    if (role === 'admin' || role === 'super_admin') return '/admin/dashboard';
    if (role === 'vendor') return '/vendor/dashboard';
    if (role === 'receiver') return '/receiver/dashboard';
    return '/';
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
              <Link to={getDashboardLink()} className="nav-link">Dashboard</Link>
              <span className="text-muted mr-4" style={{ fontSize: '0.875rem' }}>
                {user.email} · <strong>{user.role}</strong>
              </span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Unauthorized page
const Unauthorized = () => (
  <div className="container mt-8 text-center animate-fade-in">
    <h2 className="text-3xl mb-4">⛔ Access Denied</h2>
    <p className="text-muted mb-6">You don't have permission to view this page.</p>
    <Link to="/" className="btn btn-primary">Go Home</Link>
  </div>
);

function AppRoutes() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#fff', color: '#1f2937', border: '1px solid #e5e7eb' },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
      }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Auth Routes */}
        <Route path="/admin" element={<Login role="admin" endpoint="/admin/login" title="Admin Login" />} />
        <Route path="/vendor/login" element={<Login role="vendor" endpoint="/vendors/login" title="Vendor Login" />} />
        <Route path="/receiver/login" element={<Login role="receiver" endpoint="/receivers/login" title="Receiver Login" />} />
        <Route path="/vendor/register" element={<RegisterVendor />} />
        <Route path="/receiver/register" element={<RegisterReceiver />} />

        {/* Protected Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/vendor/dashboard" element={
          <ProtectedRoute role="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/receiver/dashboard" element={
          <ProtectedRoute role="receiver">
            <ReceiverDashboard />
          </ProtectedRoute>
        } />
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
