import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, UserCheck, ShieldCheck, LayoutDashboard, Search, RefreshCw, Mail, Phone, MapPin, Building, CheckCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users'
  const [stats, setStats] = useState({ totalVendors: 0, totalReceivers: 0, totalDonations: 0, completedDonations: 0 });
  const [pendingVendors, setPendingVendors] = useState([]);
  const [pendingReceivers, setPendingReceivers] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [allReceivers, setAllReceivers] = useState([]);
  const [usersFilter, setUsersFilter] = useState('all'); // 'all' | 'vendors' | 'receivers'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, vendorsRes, receiversRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/vendors/pending'),
        api.get('/admin/receivers/pending')
      ]);
      setStats(statsRes.data);
      setPendingVendors(vendorsRes.data.vendors || []);
      setPendingReceivers(receiversRes.data.receivers || []);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchAllUsers = async () => {
    setUsersLoading(true);
    try {
      const [vRes, rRes] = await Promise.allSettled([
        api.get('/admin/get-vendors'),
        api.get('/admin/get-receivers')
      ]);
      const vList = (vRes.status === 'fulfilled' && vRes.value?.data?.users) || [];
      const rList = (rRes.status === 'fulfilled' && rRes.value?.data?.users) || [];
      setAllVendors(vList);
      setAllReceivers(rList);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleVerifyVendor = async (id) => {
    const toastId = toast.loading('Verifying vendor...');
    try {
      await api.put(`/admin/vendors/${id}/verify`);
      toast.success('Vendor verified!', { id: toastId });
      fetchData();
      if (activeTab === 'users') fetchAllUsers();
    } catch (err) {
      toast.error('Failed to verify vendor.', { id: toastId });
    }
  };

  const handleVerifyReceiver = async (id) => {
    const toastId = toast.loading('Verifying receiver...');
    try {
      await api.put(`/admin/receivers/${id}/verify`);
      toast.success('Receiver verified!', { id: toastId });
      fetchData();
      if (activeTab === 'users') fetchAllUsers();
    } catch (err) {
      toast.error('Failed to verify receiver.', { id: toastId });
    }
  };

  const filteredUsers = () => {
    const q = searchQuery.toLowerCase().trim();
    let combined = [];

    if (usersFilter === 'all' || usersFilter === 'vendors') {
      combined = combined.concat(allVendors.map(v => ({ ...v, userType: 'Vendor' })));
    }
    if (usersFilter === 'all' || usersFilter === 'receivers') {
      combined = combined.concat(allReceivers.map(r => ({ ...r, userType: 'Receiver' })));
    }

    if (!q) return combined;

    return combined.filter(u => 
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.userType && u.userType.toLowerCase().includes(q))
    );
  };

  if (loading) return (
    <div className="container mt-8 text-center text-muted py-12">
      <RefreshCw className="animate-spin mx-auto mb-3" size={32} color="var(--primary-color)" />
      <p>Loading Admin Command Terminal...</p>
    </div>
  );

  return (
    <div className="dashboard-layout animate-fade-in">
      {/* Sidebar navigation */}
      <div className="sidebar">
        <h3 className="nav-brand mb-6 flex items-center gap-2">
          <LayoutDashboard size={20} color="var(--primary-color)" />
          <span>Admin Panel</span>
        </h3>
        <div 
          className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <ShieldCheck size={18} />
          <span>Dashboard</span>
        </div>
        <div 
          className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); fetchAllUsers(); }}
        >
          <Users size={18} />
          <span>All Users</span>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="dashboard-content">
        {/* Top Header / View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {activeTab === 'overview' ? 'Overview Metrics' : 'User Directory'}
            </h2>
            <p className="text-muted text-xs sm:text-sm mt-0.5">
              {activeTab === 'overview' 
                ? 'City distribution platform health, performance, and approvals' 
                : 'Browse all registered food vendors, restaurants, and NGO shelters'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeTab === 'overview') fetchData();
                else fetchAllUsers();
              }}
              className="btn btn-outline text-xs"
              disabled={isRefreshing || usersLoading}
              title="Refresh Data"
            >
              <RefreshCw size={14} className={isRefreshing || usersLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {/* Mobile Tab Switcher */}
            <div className="flex bg-gray-200 rounded-lg p-1 text-xs font-semibold sm:hidden">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-md ${activeTab === 'overview' ? 'bg-white shadow-xs font-bold text-gray-900' : 'text-gray-600'}`}
              >
                Metrics
              </button>
              <button 
                onClick={() => { setActiveTab('users'); fetchAllUsers(); }}
                className={`px-3 py-1.5 rounded-md ${activeTab === 'users' ? 'bg-white shadow-xs font-bold text-gray-900' : 'text-gray-600'}`}
              >
                Users
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW METRICS & PENDING */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card text-center p-4">
                <h4 className="text-muted text-xs uppercase font-bold tracking-wider">Total Vendors</h4>
                <p className="text-3xl mt-1.5 font-extrabold text-gray-900">{stats.totalVendors}</p>
                <span className="text-[11px] text-muted font-medium">Registered kitchens</span>
              </div>
              <div className="card text-center p-4">
                <h4 className="text-muted text-xs uppercase font-bold tracking-wider">Total Receivers</h4>
                <p className="text-3xl mt-1.5 font-extrabold text-blue-600">{stats.totalReceivers}</p>
                <span className="text-[11px] text-muted font-medium">Verified shelters</span>
              </div>
              <div className="card text-center p-4">
                <h4 className="text-muted text-xs uppercase font-bold tracking-wider">Total Donations</h4>
                <p className="text-3xl mt-1.5 font-extrabold text-gray-900">{stats.totalDonations}</p>
                <span className="text-[11px] text-muted font-medium">Batches listed</span>
              </div>
              <div className="card text-center p-4">
                <h4 className="text-muted text-xs uppercase font-bold tracking-wider">Completed Pickups</h4>
                <p className="text-3xl mt-1.5 font-extrabold text-emerald-600">{stats.completedDonations}</p>
                <span className="text-[11px] text-emerald-700 font-semibold">Rescued successfully</span>
              </div>
            </div>

            {/* Pending Approvals Queue */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pending Vendors */}
              <div className="card">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <UserCheck size={18} color="var(--primary-color)" />
                    <span>Pending Vendors</span>
                  </h3>
                  <span className="badge badge-warning">{pendingVendors.length} Pending</span>
                </div>

                {pendingVendors.length === 0 ? (
                  <div className="text-center py-8 text-muted text-sm">
                    <CheckCircle size={24} className="mx-auto mb-2 text-emerald-600" />
                    <p>All vendor applications reviewed and verified.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingVendors.map(v => (
                      <div key={v._id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{v.name}</span>
                            <span className="badge badge-primary text-[10px]">{v.restaurantType || 'Kitchen'}</span>
                          </div>
                          <p className="text-xs text-muted mt-1">{v.email} &middot; {v.phone}</p>
                          {v.fssaiLicense && (
                            <p className="text-[11px] font-mono text-gray-600 mt-0.5">FSSAI: {v.fssaiLicense}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => handleVerifyVendor(v._id)} 
                          className="btn btn-primary text-xs py-1.5 px-3 self-end sm:self-center"
                        >
                          Verify Vendor
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Receivers */}
              <div className="card">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <UserCheck size={18} color="var(--blue-color)" />
                    <span>Pending Receivers (NGOs)</span>
                  </h3>
                  <span className="badge badge-warning">{pendingReceivers.length} Pending</span>
                </div>

                {pendingReceivers.length === 0 ? (
                  <div className="text-center py-8 text-muted text-sm">
                    <CheckCircle size={24} className="mx-auto mb-2 text-emerald-600" />
                    <p>All NGO registrations reviewed and verified.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingReceivers.map(r => (
                      <div key={r._id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{r.name}</span>
                            <span className="badge badge-primary text-[10px]">NGO</span>
                          </div>
                          <p className="text-xs text-muted mt-1">{r.email} &middot; Contact: {r.manager || 'Representative'}</p>
                          {r.phone && <p className="text-[11px] text-muted">{r.phone}</p>}
                        </div>
                        <button 
                          onClick={() => handleVerifyReceiver(r._id)} 
                          className="btn btn-primary text-xs py-1.5 px-3 self-end sm:self-center"
                        >
                          Verify NGO
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search and Filter Controls */}
            <div className="card p-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-3 text-muted" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, phone, or organization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control pl-10 text-xs sm:text-sm"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setUsersFilter('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${usersFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
                  >
                    All ({allVendors.length + allReceivers.length})
                  </button>
                  <button
                    onClick={() => setUsersFilter('vendors')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${usersFilter === 'vendors' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
                  >
                    Vendors ({allVendors.length})
                  </button>
                  <button
                    onClick={() => setUsersFilter('receivers')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${usersFilter === 'receivers' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
                  >
                    Receivers ({allReceivers.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Users List */}
            {usersLoading ? (
              <div className="card text-center py-12 text-muted">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-primary" />
                <p>Loading user database...</p>
              </div>
            ) : filteredUsers().length === 0 ? (
              <div className="card text-center py-12 text-muted">
                <Users size={32} className="mx-auto mb-2 text-muted" />
                <p>No registered users found matching "{searchQuery}".</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredUsers().map(u => {
                  const isActive = u.accountStatus === 'active' || u.status === 'active';
                  return (
                    <div key={u._id} className="card p-4 hover:border-gray-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-base text-gray-900">{u.name || 'Unnamed Account'}</span>
                          <span className={`badge ${u.userType === 'Vendor' ? 'badge-primary' : 'badge-warning'}`}>
                            {u.userType}
                          </span>
                          <span className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`}>
                            {isActive ? 'Active' : 'Pending Verification'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted pt-1">
                          <span className="flex items-center gap-1">
                            <Mail size={13} /> {u.email}
                          </span>
                          {u.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={13} /> {u.phone}
                            </span>
                          )}
                          {u.address && (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} /> {typeof u.address === 'string' ? u.address : [u.address.street, u.address.city].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!isActive && (
                          <button
                            onClick={() => {
                              if (u.userType === 'Vendor') handleVerifyVendor(u._id);
                              else handleVerifyReceiver(u._id);
                            }}
                            className="btn btn-primary text-xs py-1.5 px-3"
                          >
                            Approve Account
                          </button>
                        )}
                        <span className="text-[11px] font-mono text-muted">
                          ID: {u._id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
