import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Utensils, LogOut, ArrowRight, CheckCircle2, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import RegisterVendor from './pages/RegisterVendor';
import RegisterReceiver from './pages/RegisterReceiver';

// Landing Page mirroring the FoodShare approved design
const Landing = () => (
  <div className="container py-12 animate-fade-in max-w-6xl">
    <div className="max-w-3xl mb-10">
      <p style={{ color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
        Food management &amp; redistribution
      </p>
      <h1 className="text-4xl sm:text-5xl font-extrabold mt-3 tracking-tight" style={{ color: 'var(--text-color)', lineHeight: 1.15 }}>
        Share surplus. <br />
        <span style={{ color: 'var(--primary-color)' }}>Coordinate pickups.</span>
      </h1>
      <p className="text-muted mt-4 text-base sm:text-lg max-w-2xl" style={{ lineHeight: 1.6 }}>
        Connect food businesses with verified NGOs in Bengaluru. Direct fresh surplus meals to shelters and communities within hours.
      </p>
    </div>

    {/* Dual Role Chooser Cards */}
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Vendor Card */}
      <div className="card flex flex-col justify-between" style={{ padding: '2rem' }}>
        <div>
          <div className="flex justify-between items-center mb-4">
            <span style={{ background: 'var(--primary-soft)', color: 'var(--primary-deep)', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
              For Food Businesses
            </span>
            <span className="text-muted" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>FSSAI VERIFIED</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">I have food to donate</h2>
          <p className="text-muted text-sm mb-6" style={{ lineHeight: 1.6 }}>
            Register your restaurant, cloud kitchen, or catering business to post surplus food batches before expiry.
          </p>
          <div style={{ borderTop: '1px solid var(--line-color)', margin: '1.5rem 0' }}></div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={18} color="var(--primary-color)" />
              <span>Post meals with quantity, food type, and expiry window</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={18} color="var(--primary-color)" />
              <span>Coordinate with verified local shelters and NGOs</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={18} color="var(--primary-color)" />
              <span>Track every donation to completion with pickup handoff OTP</span>
            </li>
          </ul>
        </div>
        <div className="mt-8">
          <Link to="/vendor/register" className="btn btn-primary w-full" style={{ padding: '0.85rem 1rem' }}>
            <span>Register as a Vendor</span>
            <ArrowRight size={16} />
          </Link>
          <p className="text-center text-muted text-xs mt-3">Free account · Administrator verification required</p>
        </div>
      </div>

      {/* Receiver Card */}
      <div className="card flex flex-col justify-between" style={{ padding: '2rem' }}>
        <div>
          <div className="flex justify-between items-center mb-4">
            <span style={{ background: 'var(--blue-soft)', color: 'var(--blue-color)', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
              For Receivers &middot; NGOs
            </span>
            <span className="text-muted" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>NGO DARPAN</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">I need food for my community</h2>
          <p className="text-muted text-sm mb-6" style={{ lineHeight: 1.6 }}>
            Register your organization or shelter to discover and collect nearby fresh food donations on a live map.
          </p>
          <div style={{ borderTop: '1px solid var(--line-color)', margin: '1.5rem 0' }}></div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={18} color="var(--blue-color)" />
              <span>Find available surplus food on an interactive radius map</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={18} color="var(--blue-color)" />
              <span>Reserve donations instantly with estimated pickup ETA</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={18} color="var(--blue-color)" />
              <span>Manage collections and record verified meal distributions</span>
            </li>
          </ul>
        </div>
        <div className="mt-8">
          <Link to="/receiver/register" className="btn btn-secondary w-full" style={{ padding: '0.85rem 1rem' }}>
            <span>Register as a Receiver</span>
            <ArrowRight size={16} />
          </Link>
          <p className="text-center text-muted text-xs mt-3">Free account · NGO Darpan registration required</p>
        </div>
      </div>
    </div>

    {/* Already registered banner */}
    <div className="card flex flex-col sm:flex-row justify-between items-center gap-4" style={{ background: '#eef2ec' }}>
      <div>
        <h3 className="font-bold text-base">Already registered with FoodShare?</h3>
        <p className="text-muted text-sm mt-0.5">Sign in to your vendor, receiver, or city admin terminal.</p>
      </div>
      <div className="flex gap-2.5">
        <Link to="/vendor/login" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}>Vendor Login</Link>
        <Link to="/receiver/login" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}>Receiver Login</Link>
      </div>
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
          <div className="nav-brand-icon">
            <Utensils size={20} />
          </div>
          <span>FoodShare</span>
          <span className="nav-brand-badge">BLR</span>
        </Link>
        <div className="nav-links">
          {!user ? (
            <>
              <Link to="/vendor/login" className="nav-link">Vendor</Link>
              <Link to="/receiver/login" className="nav-link">Receiver</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
              <Link to="/vendor/register" className="btn btn-primary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>Get Started</Link>
            </>
          ) : (
            <>
              <Link to={getDashboardLink()} className="nav-link">Dashboard</Link>
              <span className="text-muted mr-2" style={{ fontSize: '0.825rem' }}>
                {user.email} &middot; <strong style={{ color: 'var(--text-color)', textTransform: 'capitalize' }}>{user.role}</strong>
              </span>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                <LogOut size={14} /> Sign Out
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
  <div className="container mt-8 text-center animate-fade-in max-w-md py-12">
    <div className="card text-center">
      <h2 className="text-2xl mb-2">⛔ Access Denied</h2>
      <p className="text-muted mb-6 text-sm">You do not have credentials to view this terminal.</p>
      <Link to="/" className="btn btn-primary">Return to FoodShare</Link>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#fff', color: '#1f2a24', border: '1px solid #e3e8e2', borderRadius: '12px', fontSize: '0.875rem' },
        success: { iconTheme: { primary: '#176a4b', secondary: '#fff' } },
        error: { iconTheme: { primary: '#b34038', secondary: '#fff' } }
      }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Auth Routes */}
        <Route path="/admin" element={<Login role="admin" endpoint="/admin/login" title="City Admin Terminal" />} />
        <Route path="/vendor/login" element={<Login role="vendor" endpoint="/vendors/login" title="Vendor Sign In" />} />
        <Route path="/receiver/login" element={<Login role="receiver" endpoint="/receivers/login" title="Receiver Sign In" />} />
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
