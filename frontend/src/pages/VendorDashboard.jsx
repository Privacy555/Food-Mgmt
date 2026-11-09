import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  PackagePlus, 
  List, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Building, 
  RefreshCw, 
  Truck, 
  CheckCircle2, 
  BellRing,
  Utensils,
  Search,
  ArrowRight
} from 'lucide-react';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('post'); // 'post' | 'donations'
  const [donations, setDonations] = useState([]);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [filter, setFilter] = useState('all'); // all, available, claimed, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    foodName: '', foodType: 'veg', quantity: '', quantityUnit: 'meals',
    expiryTime: '', notes: '', pickupAddress: ''
  });
  const [loading, setLoading] = useState(true);

  // Ref to track status changes between pollings for real-time notifications
  const prevDonationsRef = useRef([]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchDonations(true), fetchProfile()]);
      setLoading(false);
    };
    init();

    // Real-time polling every 15 seconds
    const pollInterval = setInterval(() => {
      fetchDonations(false);
    }, 15000);

    return () => clearInterval(pollInterval);
  }, []);

  const formatVendorAddress = (address) => {
    if (!address) return 'Vendor Address';
    if (typeof address === 'string') return address;
    const { street, city, state, pincode } = address;
    return [street, city, state, pincode].filter(Boolean).join(', ') || 'Vendor Address';
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/vendors/profile');
      const v = res.data.vendor || null;
      setVendorProfile(v);
      if (v?.address) {
        setFormData(prev => ({
          ...prev,
          pickupAddress: formatVendorAddress(v.address)
        }));
      }
    } catch (err) {
      console.error('Failed to fetch vendor profile', err);
    }
  };

  const fetchDonations = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await api.get('/vendors/donations');
      const current = res.data.donations || [];

      // Check for newly claimed donations to notify vendor
      if (prevDonationsRef.current.length > 0) {
        current.forEach(newD => {
          const oldD = prevDonationsRef.current.find(o => o._id === newD._id);
          if (oldD && oldD.status === 'available' && newD.status === 'claimed') {
            toast.success(`🎉 Great news! "${newD.foodName}" was claimed by ${newD.claimedBy?.name || 'an NGO'}!`, {
              duration: 6000,
              icon: '🔔'
            });
          }
        });
      }

      prevDonationsRef.current = current;
      setDonations(current);
    } catch (err) {
      console.error('Failed to fetch donations', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const toastId = toast.loading(`Updating status to ${status}...`);
    try {
      await api.put(`/vendors/donations/${id}/status`, { status });
      toast.success('Donation status updated successfully!', { id: toastId });
      fetchDonations(false);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to update status', { id: toastId });
    }
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    if (!formData.expiryTime || new Date(formData.expiryTime) <= new Date()) {
      toast.error('Expiry time must be set to a future date and time!');
      return;
    }
    const toastId = toast.loading('Posting donation...');
    try {
      const defaultAddress = formatVendorAddress(vendorProfile?.address);
      const finalPickupAddress = formData.pickupAddress?.trim() || defaultAddress;

      const coordinates = vendorProfile?.location?.coordinates?.length === 2
        ? vendorProfile.location.coordinates
        : [76.7794, 30.7333];

      const payload = {
        foodName: formData.foodName,
        foodType: formData.foodType,
        quantity: Number(formData.quantity),
        quantityUnit: formData.quantityUnit,
        preparedAt: new Date().toISOString(),
        expiryTime: formData.expiryTime,
        pickupLocation: {
          address: finalPickupAddress,
          type: 'Point',
          coordinates: coordinates
        },
        notes: formData.notes
      };

      await api.post('/vendors/donations', payload);
      toast.success('Donation posted successfully!', { id: toastId });
      await fetchDonations(false);
      setFormData({
        foodName: '',
        foodType: 'veg',
        quantity: '',
        quantityUnit: 'meals',
        expiryTime: '',
        notes: '',
        pickupAddress: defaultAddress
      });
      // Switch view to my donations so vendor can track it immediately
      setActiveTab('donations');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Error creating donation.', { id: toastId });
    }
  };

  const filteredDonations = donations.filter(d => {
    let matchesStatus = true;
    if (filter === 'available') matchesStatus = d.status === 'available';
    else if (filter === 'claimed') matchesStatus = d.status === 'claimed' || d.status === 'picked_up';
    else if (filter === 'completed') matchesStatus = d.status === 'completed';

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesQuery = (d.foodName && d.foodName.toLowerCase().includes(q)) ||
      (d.claimedBy?.name && d.claimedBy.name.toLowerCase().includes(q)) ||
      (d.foodType && d.foodType.toLowerCase().includes(q));

    return matchesStatus && matchesQuery;
  });

  const availableCount = donations.filter(d => d.status === 'available').length;
  const claimedCount = donations.filter(d => d.status === 'claimed' || d.status === 'picked_up').length;
  const completedCount = donations.filter(d => d.status === 'completed').length;

  if (loading) return (
    <div className="container mt-8 text-center text-muted py-12">
      <RefreshCw className="animate-spin mx-auto mb-3" size={32} color="var(--primary-color)" />
      <p>Loading Vendor Terminal...</p>
    </div>
  );

  return (
    <div className="dashboard-layout animate-fade-in">
      {/* Sidebar navigation */}
      <div className="sidebar">
        <h3 className="nav-brand mb-6 flex items-center gap-2">
          <Utensils size={20} color="var(--primary-color)" />
          <span>Vendor Portal</span>
        </h3>
        <div 
          className={`sidebar-link ${activeTab === 'post' ? 'active' : ''}`}
          onClick={() => setActiveTab('post')}
        >
          <PackagePlus size={18} />
          <span>Post Food</span>
        </div>
        <div 
          className={`sidebar-link ${activeTab === 'donations' ? 'active' : ''}`}
          onClick={() => setActiveTab('donations')}
        >
          <List size={18} />
          <span>My Donations ({donations.length})</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="dashboard-content">
        {/* Top Header & Mobile Nav Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {activeTab === 'post' ? 'Post Surplus Food' : 'My Food Donations'}
            </h2>
            <p className="text-muted text-xs sm:text-sm mt-0.5">
              {activeTab === 'post'
                ? 'Create a new food donation batch for local shelters & verified NGOs'
                : 'Manage active listings, coordinate handoffs, and confirm pickups'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDonations(false)}
              className="btn btn-outline text-xs"
              disabled={isRefreshing}
              title="Refresh Donations"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {/* Tab switch buttons */}
            <div className="flex bg-gray-200 rounded-lg p-1 text-xs font-semibold">
              <button 
                onClick={() => setActiveTab('post')}
                className={`px-3 py-1.5 rounded-md transition ${activeTab === 'post' ? 'bg-white shadow-xs font-bold text-gray-900' : 'text-gray-600'}`}
              >
                Post Food
              </button>
              <button 
                onClick={() => setActiveTab('donations')}
                className={`px-3 py-1.5 rounded-md transition ${activeTab === 'donations' ? 'bg-white shadow-xs font-bold text-gray-900' : 'text-gray-600'}`}
              >
                My Donations ({donations.length})
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: CREATE DONATION (Spacious, clean, uncluttered layout) */}
        {activeTab === 'post' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-3 border-b">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <PackagePlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Food Batch Details</h3>
                    <p className="text-xs text-muted">Surplus batch will appear on the live radar for nearby NGOs</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('donations')} 
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  View Listings ({donations.length}) <ArrowRight size={13} />
                </button>
              </div>

              <form onSubmit={handleCreateDonation} className="space-y-4">
                <div className="form-group">
                  <label>Food Item / Batch Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="e.g. Cooked Meals (Rice, Dal, Mixed Vegetables)"
                    value={formData.foodName} 
                    onChange={e => setFormData({...formData, foodName: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Dietary Category</label>
                    <select 
                      className="form-control" 
                      value={formData.foodType} 
                      onChange={e => setFormData({...formData, foodType: e.target.value})}
                    >
                      <option value="veg">Vegetarian (Veg)</option>
                      <option value="non-veg">Non-Vegetarian (Non-Veg)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity Measurement Unit</label>
                    <select 
                      className="form-control" 
                      value={formData.quantityUnit} 
                      onChange={e => setFormData({...formData, quantityUnit: e.target.value})}
                    >
                      <option value="meals">Meals / Portions</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="litres">Litres</option>
                      <option value="packets">Packets / Boxes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Quantity Amount</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="form-control" 
                      required 
                      placeholder="e.g. 25"
                      value={formData.quantity} 
                      onChange={e => setFormData({...formData, quantity: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Expiry / Best Before Time</label>
                    <input 
                      type="datetime-local" 
                      className="form-control" 
                      required 
                      min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                      value={formData.expiryTime} 
                      onChange={e => setFormData({...formData, expiryTime: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Pickup Location Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    placeholder="Specific pickup address, kitchen counter, or dispatch gate"
                    value={formData.pickupAddress} 
                    onChange={e => setFormData({...formData, pickupAddress: e.target.value})} 
                  />
                  <small className="text-muted block mt-1" style={{ fontSize: '0.75rem' }}>
                    Defaults to your registered restaurant address. You can customize the specific pickup spot.
                  </small>
                </div>

                <div className="form-group">
                  <label>Handling Notes &amp; Packaging (Optional)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Packed hot in insulated containers. Bring clean crates."
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full mt-4 py-3 font-bold text-sm shadow-sm">
                  Publish Food Donation to Live Radar
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: MY DONATIONS (Full-width, clean card layout, not squashed!) */}
        {activeTab === 'donations' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Pills and Summary */}
            <div className="card p-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-3 text-muted" />
                  <input
                    type="text"
                    placeholder="Search by food name, food type, or claiming NGO..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control text-xs sm:text-sm"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>

                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setFilter('all')} 
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${filter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
                  >
                    All ({donations.length})
                  </button>
                  <button 
                    onClick={() => setFilter('available')} 
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${filter === 'available' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
                  >
                    Available ({availableCount})
                  </button>
                  <button 
                    onClick={() => setFilter('claimed')} 
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${filter === 'claimed' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
                  >
                    Claimed / Active ({claimedCount})
                  </button>
                  <button 
                    onClick={() => setFilter('completed')} 
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${filter === 'completed' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
                  >
                    Completed ({completedCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Donation Cards */}
            {filteredDonations.length === 0 ? (
              <div className="card text-center py-12 text-muted">
                <Utensils size={36} className="mx-auto mb-3 text-muted" />
                <h3 className="text-lg font-bold text-gray-800">No donations found in this view</h3>
                <p className="text-xs sm:text-sm text-muted mt-1 mb-4">
                  {filter === 'all' 
                    ? "You haven't posted any surplus food yet." 
                    : `No donations currently match the "${filter}" filter.`}
                </p>
                <button onClick={() => setActiveTab('post')} className="btn btn-primary text-xs py-2 px-4">
                  <PackagePlus size={16} /> Post Your First Batch
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredDonations.map(d => {
                  const isAvailable = d.status === 'available';
                  const isClaimed = d.status === 'claimed';
                  const isPickedUp = d.status === 'picked_up';
                  const isCompleted = d.status === 'completed';

                  return (
                    <div key={d._id} className="card p-5 flex flex-col justify-between hover:border-gray-300 transition">
                      <div>
                        {/* Header & Status */}
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div>
                            <span className={`badge ${d.foodType === 'veg' ? 'badge-success' : 'badge-danger'} mb-1.5`}>
                              {d.foodType.toUpperCase()}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900">{d.foodName}</h3>
                          </div>
                          <span className={`badge ${
                            isAvailable ? 'badge-primary' : 
                            isClaimed ? 'badge-warning' : 
                            isPickedUp ? 'badge-primary' : 'badge-success'
                          }`}>
                            {d.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        {/* Quantity and Expiry */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted mb-3">
                          <span className="font-bold text-gray-900 px-2 py-0.5 rounded bg-gray-100">
                            {d.quantity} {d.quantityUnit}
                          </span>
                          <span className="flex items-center gap-1 text-red-700 font-semibold">
                            <Clock size={13} />
                            Expires: {new Date(d.expiryTime).toLocaleString()}
                          </span>
                        </div>

                        {/* Stepper Progress */}
                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 my-3">
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                            <span className={isAvailable || isClaimed || isPickedUp || isCompleted ? 'text-emerald-700' : ''}>
                              ✓ Listed
                            </span>
                            <span>&rarr;</span>
                            <span className={isClaimed || isPickedUp || isCompleted ? 'text-amber-600' : 'text-gray-400'}>
                              {isClaimed || isPickedUp || isCompleted ? '✓ Claimed' : 'Claimed'}
                            </span>
                            <span>&rarr;</span>
                            <span className={isPickedUp || isCompleted ? 'text-blue-600' : 'text-gray-400'}>
                              {isPickedUp || isCompleted ? '✓ In Transit' : 'In Transit'}
                            </span>
                            <span>&rarr;</span>
                            <span className={isCompleted ? 'text-emerald-700 font-bold' : 'text-gray-400'}>
                              {isCompleted ? '✓ Done' : 'Done'}
                            </span>
                          </div>
                        </div>

                        {/* Location */}
                        <p className="text-xs text-muted flex items-center gap-1.5 mb-2">
                          <MapPin size={14} className="text-emerald-700 shrink-0" />
                          <span>{d.pickupLocation?.address || formatVendorAddress(vendorProfile?.address)}</span>
                        </p>

                        {/* Claimed NGO Details */}
                        {d.claimedBy && (
                          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs text-gray-800 space-y-1 mt-3">
                            <div className="flex items-center justify-between font-bold text-emerald-900">
                              <span>Claimed by: {d.claimedBy.name}</span>
                              {d.otp && <span className="font-mono bg-white px-2 py-0.5 rounded border text-emerald-800">OTP: {d.otp}</span>}
                            </div>
                            {d.claimedBy.phone && (
                              <p className="text-muted flex items-center gap-1">
                                <Phone size={12} /> {d.claimedBy.phone}
                              </p>
                            )}
                            {d.claimedBy.email && (
                              <p className="text-muted flex items-center gap-1">
                                <Mail size={12} /> {d.claimedBy.email}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 mt-4 border-t flex flex-wrap justify-end gap-2">
                        {isClaimed && (
                          <button
                            onClick={() => handleUpdateStatus(d._id, 'picked_up')}
                            className="btn btn-primary text-xs py-1.5 px-3"
                          >
                            <Truck size={14} /> Confirm Handover / Mark Picked Up
                          </button>
                        )}
                        {isPickedUp && (
                          <button
                            onClick={() => handleUpdateStatus(d._id, 'completed')}
                            className="btn btn-secondary text-xs py-1.5 px-3"
                          >
                            <CheckCircle2 size={14} /> Mark Completed
                          </button>
                        )}
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

export default VendorDashboard;
