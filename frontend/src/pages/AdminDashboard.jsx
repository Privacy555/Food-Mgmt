import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, UserCheck, ShieldCheck, XCircle, LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalVendors: 0, totalReceivers: 0, totalDonations: 0, completedDonations: 0 });
  const [pendingVendors, setPendingVendors] = useState([]);
  const [pendingReceivers, setPendingReceivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
    }
  };

  const handleVerifyVendor = async (id) => {
    try {
      await api.put(`/admin/vendors/${id}/verify`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyReceiver = async (id) => {
    try {
      await api.put(`/admin/receivers/${id}/verify`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container mt-8 text-center text-muted">Loading Dashboard...</div>;

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="sidebar">
        <h3 className="nav-brand mb-8"><LayoutDashboard className="mr-2" /> Admin Panel</h3>
        <div className="sidebar-link active"><ShieldCheck /> Dashboard</div>
        <div className="sidebar-link"><Users /> All Users</div>
      </div>
      <div className="dashboard-content">
        <h2 className="text-3xl mb-6">Overview Metrics</h2>
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <h4 className="text-muted text-sm uppercase">Total Vendors</h4>
            <p className="text-3xl mt-2 font-bold">{stats.totalVendors}</p>
          </div>
          <div className="card text-center">
            <h4 className="text-muted text-sm uppercase">Total Receivers</h4>
            <p className="text-3xl mt-2 font-bold">{stats.totalReceivers}</p>
          </div>
          <div className="card text-center">
            <h4 className="text-muted text-sm uppercase">Total Donations</h4>
            <p className="text-3xl mt-2 font-bold">{stats.totalDonations}</p>
          </div>
          <div className="card text-center">
            <h4 className="text-muted text-sm uppercase">Completed Pickups</h4>
            <p className="text-3xl mt-2 text-green-400 font-bold">{stats.completedDonations}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl mb-4 flex items-center gap-2"><UserCheck size={20} /> Pending Vendors</h3>
            {pendingVendors.length === 0 ? <p className="text-muted">No pending vendors.</p> : (
              <ul className="grid gap-4">
                {pendingVendors.map(v => (
                  <li key={v._id} className="p-4 bg-white rounded-lg flex justify-between items-center border border-gray-200 shadow-sm">
                    <div>
                      <p className="font-bold">{v.name} <span className="badge badge-primary ml-2">{v.restaurantType}</span></p>
                      <p className="text-sm text-muted mt-1">{v.email} | {v.phone}</p>
                    </div>
                    <button onClick={() => handleVerifyVendor(v._id)} className="btn btn-primary" style={{padding: '0.4rem 1rem'}}>Verify</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h3 className="text-xl mb-4 flex items-center gap-2"><UserCheck size={20} /> Pending Receivers</h3>
            {pendingReceivers.length === 0 ? <p className="text-muted">No pending receivers.</p> : (
              <ul className="grid gap-4">
                {pendingReceivers.map(r => (
                  <li key={r._id} className="p-4 bg-white rounded-lg flex justify-between items-center border border-gray-200 shadow-sm">
                    <div>
                      <p className="font-bold">{r.name}</p>
                      <p className="text-sm text-muted mt-1">{r.email} | {r.manager}</p>
                    </div>
                    <button onClick={() => handleVerifyReceiver(r._id)} className="btn btn-primary" style={{padding: '0.4rem 1rem'}}>Verify</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
