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
  BellRing
} from 'lucide-react';

const VendorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [filter, setFilter] = useState('all'); // all, available, claimed, completed
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

    // Real-time polling every 15 seconds so vendor immediately knows when food is claimed
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
        const addr = formatVendorAddress(v.address);
        setFormData(prev => ({
          ...prev,
          pickupAddress: prev.pickupAddress || addr
        }));
      }
    } catch (err) {
      console.error('Failed to fetch vendor profile:', err);
    }
  };

  const fetchDonations = async (isInitial = false) => {
    if (!isInitial) setIsRefreshing(true);
    try {
      const res = await api.get('/vendors/donations');
      const newDonations = res.data.donations || [];

      // Check for status changes to notify vendor immediately
      if (prevDonationsRef.current.length > 0) {
        newDonations.forEach(curr => {
          const prev = prevDonationsRef.current.find(d => d._id === curr._id);
          if (prev) {
            // Newly Claimed Notification
            if (prev.status === 'available' && curr.status === 'claimed') {
              toast((t) => (
                <div className="flex items-start gap-2">
                  <BellRing className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <strong>Food Claimed!</strong>
                    <div className="text-xs text-gray-600">
                      "{curr.foodName}" was just claimed by <strong>{curr.receiver?.name || 'an NGO'}</strong>!
                    </div>
                  </div>
                </div>
              ), { duration: 7000 });
            }
            // Newly Picked Up Notification
            if (prev.status === 'claimed' && curr.status === 'picked_up') {
              toast.success(`🚚 "${curr.foodName}" has been picked up by ${curr.receiver?.name || 'the NGO'}!`, { duration: 6000 });
            }
            // Newly Completed Notification
            if (prev.status !== 'completed' && curr.status === 'completed') {
              toast.success(`🎉 "${curr.foodName}" donation is completed!`, { duration: 6000 });
            }
          }
        });
      }

      prevDonationsRef.current = newDonations;
      setDonations(newDonations);
    } catch (err) {
      if (err.response?.status !== 404) console.error(err);
      setDonations([]);
    } finally {
      setIsRefreshing(false);
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
      fetchDonations(false);
      setFormData({
        foodName: '',
        foodType: 'veg',
        quantity: '',
        quantityUnit: 'meals',
        expiryTime: '',
        notes: '',
        pickupAddress: defaultAddress
      });
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Error creating donation.', { id: toastId });
    }
  };

  const filteredDonations = donations.filter(d => {
    if (filter === 'available') return d.status === 'available';
    if (filter === 'claimed') return d.status === 'claimed' || d.status === 'picked_up';
    if (filter === 'completed') return d.status === 'completed';
    return true;
  });

  if (loading) return <div className="container mt-8 text-center text-muted">Loading Dashboard...</div>;

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="sidebar">
        <h3 className="nav-brand mb-8">Vendor Portal</h3>
        <div className="sidebar-link active"><PackagePlus /> Post Food</div>
        <div className="sidebar-link"><List /> My Donations</div>
      </div>
      <div className="dashboard-content grid md:grid-cols-2 gap-8">
        
        {/* Create Donation Form */}
        <div className="card h-fit">
          <h2 className="text-2xl mb-6 flex items-center gap-2"><PackagePlus /> Create Donation</h2>
          
          <form onSubmit={handleCreateDonation}>
            <div className="form-group">
              <label>Food Name</label>
              <input type="text" className="form-control" required value={formData.foodName} onChange={e => setFormData({...formData, foodName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Food Type</label>
                <select className="form-control" value={formData.foodType} onChange={e => setFormData({...formData, foodType: e.target.value})}>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity Unit</label>
                <select className="form-control" value={formData.quantityUnit} onChange={e => setFormData({...formData, quantityUnit: e.target.value})}>
                  <option value="meals">Meals</option>
                  <option value="kg">Kg</option>
                  <option value="litres">Litres</option>
                  <option value="packets">Packets</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="1" className="form-control" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Expiry Time</label>
              <input 
                type="datetime-local" 
                className="form-control" 
                required 
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                value={formData.expiryTime} 
                onChange={e => setFormData({...formData, expiryTime: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Pickup Address</label>
              <input 
                type="text" 
                className="form-control" 
                required
                placeholder="Specific pickup address, counter, or gate"
                value={formData.pickupAddress} 
                onChange={e => setFormData({...formData, pickupAddress: e.target.value})} 
              />
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                Defaults to your registered restaurant address. You can customize the specific pickup spot.
              </small>
            </div>
            <div className="form-group">
              <label>Notes (Optional)</label>
              <input type="text" className="form-control" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-2">Post Donation</button>
          </form>
        </div>

        {/* Donation List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl flex items-center gap-2"><List /> My Donations</h2>
            <button 
              onClick={() => fetchDonations(false)} 
              className="btn btn-secondary text-xs flex items-center gap-1 py-1.5 px-3"
              disabled={isRefreshing}
              title="Refresh donations"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Syncing...' : 'Refresh'}
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 mb-4 text-xs">
            <button 
              onClick={() => setFilter('all')} 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'} py-1 px-2.5`}
            >
              All ({donations.length})
            </button>
            <button 
              onClick={() => setFilter('available')} 
              className={`btn ${filter === 'available' ? 'btn-primary' : 'btn-secondary'} py-1 px-2.5`}
            >
              Available ({donations.filter(d => d.status === 'available').length})
            </button>
            <button 
              onClick={() => setFilter('claimed')} 
              className={`btn ${filter === 'claimed' ? 'btn-primary' : 'btn-secondary'} py-1 px-2.5`}
            >
              Claimed / In-Progress ({donations.filter(d => d.status === 'claimed' || d.status === 'picked_up').length})
            </button>
            <button 
              onClick={() => setFilter('completed')} 
              className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'} py-1 px-2.5`}
            >
              Completed ({donations.filter(d => d.status === 'completed').length})
            </button>
          </div>

          {filteredDonations.length === 0 ? (
            <div className="card text-center text-muted py-12">No donations found for this filter.</div>
          ) : (
            <div className="grid gap-4">
              {filteredDonations.map(d => (
                <div key={d._id} className="card p-4 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{d.foodName}</h3>
                    <span className={`badge ${
                      d.status === 'available' ? 'badge-primary' : 
                      d.status === 'completed' ? 'badge-success' : 
                      d.status === 'picked_up' ? 'badge-secondary' : 'badge-warning'
                    }`}>
                      {d.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-muted mb-2">{d.quantity} {d.quantityUnit} • {d.foodType.toUpperCase()}</p>

                  {/* Status Progression Tracker */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-3 text-xs">
                    <div className="flex items-center justify-between text-gray-500 font-medium mb-1">
                      <span className={d.status !== 'expired' && d.status !== 'cancelled' ? 'text-blue-600 font-bold' : ''}>
                        ● Available
                      </span>
                      <span>→</span>
                      <span className={d.status === 'claimed' || d.status === 'picked_up' || d.status === 'completed' ? 'text-amber-600 font-bold' : ''}>
                        ● Claimed
                      </span>
                      <span>→</span>
                      <span className={d.status === 'picked_up' || d.status === 'completed' ? 'text-indigo-600 font-bold' : ''}>
                        ● Picked Up
                      </span>
                      <span>→</span>
                      <span className={d.status === 'completed' ? 'text-emerald-600 font-bold' : ''}>
                        ● Completed
                      </span>
                    </div>
                  </div>

                  {/* Pickup Address Information */}
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 mb-3 flex items-start gap-1.5">
                    <MapPin size={14} className="mt-0.5 text-blue-600 shrink-0" />
                    <div>
                      <strong>Designated Pickup Address:</strong> {d.pickupLocation?.address || 'Registered Restaurant Address'}
                    </div>
                  </div>
                  
                  {/* Real-time Claimed Details with Receiver Information */}
                  {(d.status === 'claimed' || d.status === 'picked_up' || d.status === 'completed') && d.receiver && (
                    <div className="bg-yellow-50/80 border border-yellow-200 p-3 rounded-lg mb-3">
                      <div className="text-sm text-yellow-900 font-bold mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Building size={15} className="text-yellow-700" />
                          Claimed by: {d.receiver?.name || 'NGO Partner'}
                        </span>
                        {d.claimedAt && (
                          <span className="text-xs font-normal text-yellow-800">
                            {new Date(d.claimedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {d.receiver?.phone && (
                        <p className="text-xs text-yellow-800 flex items-center gap-1.5 mb-1">
                          <Phone size={12} className="text-yellow-600" />
                          <span>Phone: <a href={`tel:${d.receiver.phone}`} className="font-semibold text-yellow-900 hover:underline">{d.receiver.phone}</a></span>
                        </p>
                      )}
                      {d.receiver?.email && (
                        <p className="text-xs text-yellow-800 flex items-center gap-1.5 mb-1">
                          <Mail size={12} className="text-yellow-600" />
                          <span>Email: <a href={`mailto:${d.receiver.email}`} className="font-semibold text-yellow-900 hover:underline">{d.receiver.email}</a></span>
                        </p>
                      )}
                      {d.receiver?.address && (
                        <p className="text-xs text-yellow-800 flex items-center gap-1.5">
                          <Building size={12} className="text-yellow-600" />
                          <span>Org Address: {d.receiver.address}</span>
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  {d.status === 'claimed' && (
                    <button 
                      onClick={async () => {
                        await api.put(`/vendors/donations/${d._id}/picked-up`);
                        toast.success('Marked as picked up!');
                        fetchDonations(false);
                      }} 
                      className="btn btn-primary w-full text-sm py-2 flex items-center justify-center gap-1.5"
                    >
                      <Truck size={16} /> Confirm Handover / Mark Picked Up
                    </button>
                  )}
                  {d.status === 'picked_up' && (
                    <button 
                      onClick={async () => {
                        await api.put(`/vendors/donations/${d._id}/completed`);
                        toast.success('Donation completed!');
                        fetchDonations(false);
                      }} 
                      className="btn btn-secondary w-full text-sm py-2 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={16} /> Mark Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
