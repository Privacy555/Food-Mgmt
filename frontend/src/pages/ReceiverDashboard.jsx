import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  HeartHandshake, 
  MapPin, 
  Clock, 
  RefreshCw, 
  Navigation, 
  Phone, 
  Mail, 
  AlertCircle, 
  Truck, 
  CheckCircle2, 
  XCircle,
  Building,
  Search,
  ArrowRight
} from 'lucide-react';

// Fix Leaflet's default icon issue with bundlers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulsing blue dot for the Receiver's own live location
const userLocationIcon = L.divIcon({
  className: 'user-live-location-pin',
  html: `<div style="
    width: 16px;
    height: 16px;
    background: #3b82f6;
    border: 3px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Component to dynamically re-center Leaflet map
function SetViewOnChange({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const ReceiverDashboard = () => {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'claims'
  const [available, setAvailable] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapCenter, setMapCenter] = useState([30.7333, 76.7794]); // Default fallback
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState('all');

  useEffect(() => {
    // Acquire user's live browser location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter([lat, lng]);
          setUserLocation([lat, lng]);
        },
        (error) => {
          console.warn('Geolocation denied or unavailable, using fallback coordinates.', error.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    fetchData(true);

    // Auto-refresh every 20 seconds
    const interval = setInterval(() => {
      fetchData(false);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const formatAddress = (address) => {
    if (!address) return 'Pickup location specified by donor';
    if (typeof address === 'string') return address;
    const { street, city, state, pincode } = address;
    return [street, city, state, pincode].filter(Boolean).join(', ') || 'Pickup location specified by donor';
  };

  const getDonationCoordinates = (donation) => {
    if (donation.pickupLocation?.coordinates?.length === 2) {
      const [lng, lat] = donation.pickupLocation.coordinates;
      return [lat, lng];
    }
    if (donation.restaurant?.location?.coordinates?.length === 2) {
      const [lng, lat] = donation.restaurant.location.coordinates;
      return [lat, lng];
    }
    return null;
  };

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsRefreshing(true);

    try {
      const [availRes, claimsRes] = await Promise.all([
        api.get('/receivers/donations'),
        api.get('/receivers/my-claims')
      ]);
      setAvailable(availRes.data.donations || []);
      setClaims(claimsRes.data.claims || []);
    } catch (err) {
      console.error('Failed to fetch receiver data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleClaim = async (id) => {
    const toastId = toast.loading('Reserving donation for pickup...');
    try {
      await api.post(`/receivers/donations/${id}/claim`);
      toast.success('Donation claimed successfully! Please pick it up on time.', { id: toastId });
      await fetchData(false);
      setActiveTab('claims');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Error claiming donation', { id: toastId });
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const toastId = toast.loading(`Updating pickup status...`);
    try {
      await api.put(`/receivers/donations/${id}/pickup-status`, { status });
      toast.success('Pickup status updated successfully!', { id: toastId });
      fetchData(false);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to update pickup status', { id: toastId });
    }
  };

  const handleCancelClaim = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this claim?')) return;
    const toastId = toast.loading('Cancelling claim...');
    try {
      await api.put(`/receivers/donations/${id}/cancel`);
      toast.success('Claim cancelled successfully!', { id: toastId });
      fetchData(false);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to cancel claim', { id: toastId });
    }
  };

  const filteredAvailable = available.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    let matchesQuery = true;
    if (q) {
      matchesQuery = (d.foodName && d.foodName.toLowerCase().includes(q)) ||
        (d.restaurant?.name && d.restaurant.name.toLowerCase().includes(q)) ||
        (d.pickupLocation?.address && d.pickupLocation.address.toLowerCase().includes(q));
    }

    let matchesType = true;
    if (foodTypeFilter !== 'all') {
      matchesType = d.foodType === foodTypeFilter;
    }

    return matchesQuery && matchesType;
  });

  if (loading) return (
    <div className="container mt-8 text-center text-muted py-12">
      <RefreshCw className="animate-spin mx-auto mb-3" size={32} color="var(--primary-color)" />
      <p>Loading NGO Community Terminal...</p>
    </div>
  );

  return (
    <div className="dashboard-layout animate-fade-in">
      {/* Sidebar navigation */}
      <div className="sidebar">
        <h3 className="nav-brand mb-6 flex items-center gap-2">
          <HeartHandshake size={20} color="var(--primary-color)" />
          <span>NGO Portal</span>
        </h3>
        <div 
          className={`sidebar-link ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <MapPin size={18} />
          <span>Nearby Feed &amp; Map</span>
        </div>
        <div 
          className={`sidebar-link ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          <HeartHandshake size={18} />
          <span>My Claims ({claims.length})</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Top Header & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {activeTab === 'feed' ? 'Nearby Food Donations' : 'My Active Claims & Pickups'}
            </h2>
            <p className="text-muted text-xs sm:text-sm mt-0.5">
              {activeTab === 'feed'
                ? 'Discover fresh surplus food posted by local restaurants and food businesses'
                : 'Track reserved batches, manage pickup ETA, and confirm handoff receipts'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchData(false)}
              className="btn btn-outline text-xs"
              disabled={isRefreshing}
              title="Refresh available donations"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {/* Pill Tab Switcher */}
            <div className="pill-group">
              <button 
                type="button"
                onClick={() => setActiveTab('feed')}
                className={`pill-btn ${activeTab === 'feed' ? 'active' : ''}`}
              >
                Feed ({available.length})
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('claims')}
                className={`pill-btn ${activeTab === 'claims' ? 'active' : ''}`}
              >
                My Claims ({claims.length})
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: NEARBY DONATIONS & LIVE MAP */}
        {activeTab === 'feed' && (
          <div className="space-y-6 animate-fade-in">
            {/* Interactive Leaflet Radar Map */}
            <div className="card p-0 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center text-xs">
                <span className="font-bold flex items-center gap-2 text-gray-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Live Donation Map &middot; {available.length} Batches Near You
                </span>
                <span className="text-muted">Click any marker to claim</span>
              </div>

              <div style={{ height: '320px', width: '100%' }}>
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <SetViewOnChange center={mapCenter} />

                  {/* Receiver's live location */}
                  {userLocation && (
                    <Marker position={userLocation} icon={userLocationIcon}>
                      <Popup>
                        <strong>📍 Your Current Location</strong><br />
                        NGO Receiver Center
                      </Popup>
                    </Marker>
                  )}

                  {/* Available donation pins */}
                  {available.map(d => {
                    const pos = getDonationCoordinates(d);
                    if (!pos) return null;
                    return (
                      <Marker key={d._id} position={pos}>
                        <Popup>
                          <div style={{ minWidth: '180px' }}>
                            <strong style={{ fontSize: '0.9rem' }}>{d.foodName}</strong><br />
                            <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>
                              {d.quantity} {d.quantityUnit} &middot; {d.foodType.toUpperCase()}
                            </span><br/>
                            <small className="text-muted" style={{ display: 'block', margin: '4px 0' }}>
                              📍 {d.pickupLocation?.address || formatAddress(d.restaurant?.address)}
                            </small>
                            <button 
                              type="button"
                              onClick={() => handleClaim(d._id)} 
                              className="btn btn-primary w-full text-xs py-1.5 mt-2"
                            >
                              Claim Donation
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="card p-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="search-bar-wrapper">
                  <Search size={18} className="search-bar-icon" />
                  <input
                    type="text"
                    placeholder="Search meals, donor restaurants, or pickup location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-bar-input"
                  />
                </div>

                <div className="flex gap-2">
                  <select 
                    value={foodTypeFilter} 
                    onChange={e => setFoodTypeFilter(e.target.value)}
                    className="form-control text-xs font-semibold"
                    style={{ width: 'auto' }}
                  >
                    <option value="all">All Food Types</option>
                    <option value="veg">Vegetarian Only</option>
                    <option value="non-veg">Non-Veg Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Donation Cards Feed */}
            {filteredAvailable.length === 0 ? (
              <div className="card text-center py-12 text-muted">
                <AlertCircle size={36} className="mx-auto mb-2 text-muted" />
                <h3 className="text-lg font-bold text-gray-800">No surplus food currently available</h3>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  {searchQuery 
                    ? `No listings match your search for "${searchQuery}".`
                    : 'Check back shortly or click Refresh — restaurants post throughout the day!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAvailable.map(d => (
                  <div key={d._id} className="card p-5 flex flex-col justify-between hover:border-gray-300 transition">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className={`badge ${d.foodType === 'veg' ? 'badge-success' : 'badge-danger'}`}>
                          {d.foodType.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                          {d.quantity} {d.quantityUnit}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 mb-1">{d.foodName}</h3>
                      <p className="text-xs text-muted mb-2 font-medium">
                        {d.restaurant?.name || 'Local Kitchen'}
                      </p>

                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-muted space-y-1 mb-3">
                        <p className="flex items-center gap-1.5 text-red-700 font-semibold">
                          <Clock size={13} />
                          Expires: {new Date(d.expiryTime).toLocaleString()}
                        </p>
                        <p className="flex items-start gap-1.5 text-gray-700">
                          <MapPin size={13} className="shrink-0 mt-0.5 text-emerald-700" />
                          <span>{d.pickupLocation?.address || formatAddress(d.restaurant?.address)}</span>
                        </p>
                      </div>

                      {d.notes && (
                        <p className="text-xs text-muted italic mb-3">"{d.notes}"</p>
                      )}
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleClaim(d._id)} 
                      className="btn btn-primary w-full text-xs py-2.5 font-bold shadow-xs flex items-center justify-center gap-1.5 mt-2"
                    >
                      <HeartHandshake size={15} />
                      <span>Claim for Community</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY CLAIMS (Spacious, detailed tracking, not squashed!) */}
        {activeTab === 'claims' && (
          <div className="space-y-6 animate-fade-in">
            {claims.length === 0 ? (
              <div className="card text-center py-12 text-muted">
                <HeartHandshake size={36} className="mx-auto mb-3 text-muted" />
                <h3 className="text-lg font-bold text-gray-800">You haven't claimed any donations yet</h3>
                <p className="text-xs sm:text-sm text-muted mt-1 mb-4">
                  Browse the nearby feed and map to reserve meals for your community.
                </p>
                <button type="button" onClick={() => setActiveTab('feed')} className="btn btn-primary text-xs py-2 px-4">
                  <MapPin size={15} /> Explore Nearby Feed
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {claims.map(c => {
                  const isClaimed = c.status === 'claimed';
                  const isPickedUp = c.status === 'picked_up';
                  const isCompleted = c.status === 'completed';

                  return (
                    <div key={c._id} className="card p-5 flex flex-col justify-between hover:border-gray-300 transition">
                      <div>
                        {/* Header */}
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className={`badge ${
                            isClaimed ? 'badge-warning' : 
                            isPickedUp ? 'badge-primary' : 'badge-success'
                          }`}>
                            {c.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {c.quantity} {c.quantityUnit}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{c.foodName}</h3>
                        <p className="text-xs font-medium text-muted mb-3">
                          From: {c.restaurant?.name || 'Restaurant Partner'}
                        </p>

                        {/* Progress Stepper */}
                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 my-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                            <span className="text-emerald-700">✓ Claimed</span>
                            <span>&rarr;</span>
                            <span className={isPickedUp || isCompleted ? 'text-blue-600' : 'text-gray-400'}>
                              {isPickedUp || isCompleted ? '✓ Picked Up' : 'Picked Up'}
                            </span>
                            <span>&rarr;</span>
                            <span className={isCompleted ? 'text-emerald-700' : 'text-gray-400'}>
                              {isCompleted ? '✓ Completed' : 'Completed'}
                            </span>
                          </div>
                        </div>

                        {/* Pickup details box */}
                        <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs space-y-1.5 my-3">
                          <p className="flex items-start gap-1.5 text-gray-800">
                            <MapPin size={13} className="shrink-0 mt-0.5 text-blue-600" />
                            <span><strong>Pickup Address:</strong> {c.pickupLocation?.address || formatAddress(c.restaurant?.address)}</span>
                          </p>
                          {c.restaurant?.phone && (
                            <p className="flex items-center gap-1.5 text-muted">
                              <Phone size={13} /> Contact: {c.restaurant.phone}
                            </p>
                          )}
                          {c.restaurant?.email && (
                            <p className="flex items-center gap-1.5 text-muted">
                              <Mail size={13} /> {c.restaurant.email}
                            </p>
                          )}
                          {c.otp && (
                            <p className="pt-1 text-emerald-800 font-bold">
                              Handoff OTP for Vendor: <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">{c.otp}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 mt-2 border-t flex flex-wrap justify-end gap-2">
                        {isClaimed && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCancelClaim(c._id)}
                              className="btn btn-outline text-xs text-red-600 hover:bg-red-50 py-1.5 px-3"
                            >
                              <XCircle size={14} /> Cancel Claim
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(c._id, 'picked_up')}
                              className="btn btn-primary text-xs py-1.5 px-3"
                            >
                              <Truck size={14} /> Mark as Picked Up
                            </button>
                          </>
                        )}
                        {isPickedUp && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(c._id, 'completed')}
                            className="btn btn-secondary text-xs py-1.5 px-3"
                          >
                            <CheckCircle2 size={14} /> Confirm Handover Received
                          </button>
                        )}
                        {isCompleted && (
                          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Distributed Successfully
                          </span>
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

export default ReceiverDashboard;
