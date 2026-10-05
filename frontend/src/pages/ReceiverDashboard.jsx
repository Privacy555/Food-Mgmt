import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  HeartHandshake, 
  Navigation, 
  RefreshCw, 
  Phone, 
  Mail, 
  Building, 
  CheckCircle, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// User's live location icon
const userLocationIcon = L.divIcon({
  className: 'user-marker',
  html: `<div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// FIX: Bug #5 - Re-center map when coordinates change
const SetViewOnChange = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// FIX: Bug #2 - Extract coordinates [lng, lat] from pickupLocation or restaurant and convert to Leaflet [lat, lng]
const getDonationCoordinates = (d) => {
  const coords = d.pickupLocation?.coordinates || d.restaurant?.location?.coordinates;
  if (Array.isArray(coords) && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    return [coords[1], coords[0]]; // [lat, lng]
  }
  return null;
};

// Address formatting helper for restaurant objects or strings
const formatAddress = (address) => {
  if (!address) return 'Address not available';
  if (typeof address === 'string') return address;
  const { street, city, state, pincode } = address;
  return [street, city, state, pincode].filter(Boolean).join(', ') || 'Address not available';
};

const ReceiverDashboard = () => {
  const [available, setAvailable] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapCenter, setMapCenter] = useState([30.7333, 76.7794]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Use browser geolocation to center the map and mark live location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(coords);
          setUserLocation(coords);
        },
        () => {} // silently fall back to default
      );
    }
    fetchData();

    // FIX: Bug #4 - Live polling every 30 seconds
    const interval = setInterval(() => {
      fetchData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async (showInitialLoader = true) => {
    if (showInitialLoader && loading) setLoading(true);
    setIsRefreshing(true);
    try {
      const [availRes, claimsRes] = await Promise.all([
        api.get('/receivers/donations').catch(() => ({ data: { donations: [] } })),
        api.get('/receivers/my-donations').catch(() => ({ data: { donations: [] } }))
      ]);
      setAvailable(availRes.data.donations || []);
      setMyClaims(claimsRes.data.donations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleClaim = async (id) => {
    const toastId = toast.loading('Claiming...');
    try {
      await api.post(`/receivers/donations/${id}/claim`);
      toast.success('Food claimed successfully!', { id: toastId });
      fetchData(false);
    } catch (err) {
      // FIX: Bug #6 - Properly display error from backend response
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

  if (loading) return <div className="container mt-8 text-center text-muted">Loading Dashboard...</div>;

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="sidebar">
        <h3 className="nav-brand mb-8">NGO Portal</h3>
        <div className="sidebar-link active"><MapPin /> Feed</div>
        <div className="sidebar-link"><HeartHandshake /> My Claims</div>
      </div>
      <div className="dashboard-content grid md:grid-cols-2 gap-8">
        
        {/* Available Donations */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl">Nearby Donations</h2>
            {/* FIX: Bug #4 - Manual refresh button */}
            <button
              onClick={() => fetchData(false)}
              className="btn btn-secondary text-sm flex items-center gap-1"
              disabled={isRefreshing}
              title="Refresh available donations"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm" style={{ height: '300px' }}>
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {/* FIX: Bug #5 - Re-center map dynamically */}
              <SetViewOnChange center={mapCenter} />

              {/* ADDITIONAL IMPROVEMENT: Show receiver's own live location */}
              {userLocation && (
                <Marker position={userLocation} icon={userLocationIcon}>
                  <Popup>
                    <strong>You are here</strong><br />
                    Your current location
                  </Popup>
                </Marker>
              )}

              {/* FIX: Bug #2 - Correct marker placement using pickupLocation coordinates */}
              {available.map(d => {
                const pos = getDonationCoordinates(d);
                if (!pos) return null;
                return (
                  <Marker key={d._id} position={pos}>
                    <Popup>
                      <strong>{d.foodName}</strong> ({d.foodType})<br/>
                      {d.quantity} {d.quantityUnit}<br/>
                      <small className="text-muted">
                        📍 {d.pickupLocation?.address || formatAddress(d.restaurant?.address)}
                      </small><br/>
                      <button onClick={() => handleClaim(d._id)} className="btn btn-primary mt-2 text-xs py-1 px-2 w-full">
                        Claim
                      </button>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {available.length === 0 ? (
            <div className="card text-center text-muted py-12">No available donations right now.</div>
          ) : (
            <div className="grid gap-4">
              {available.map(d => (
                <div key={d._id} className="card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{d.foodName}</h3>
                    <span className="badge badge-success">{d.foodType}</span>
                  </div>
                  <p className="text-sm text-muted mb-2">{d.quantity} {d.quantityUnit}</p>
                  
                  {/* Restaurant details */}
                  <div className="text-sm text-gray-700 mb-1 flex items-center gap-1.5">
                    <Building size={14} className="text-gray-500" />
                    <span><strong>Vendor:</strong> {d.restaurant?.name || 'Restaurant'}</span>
                  </div>
                  {d.restaurant?.phone && (
                    <div className="text-xs text-gray-600 mb-2 flex items-center gap-1.5">
                      <Phone size={12} className="text-gray-400" />
                      <span>{d.restaurant.phone}</span>
                    </div>
                  )}

                  {/* Pickup address */}
                  <div className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-100 mb-4 flex items-start gap-1.5">
                    <MapPin size={14} className="mt-0.5 text-blue-600 shrink-0" />
                    <div>
                      <strong>Pickup Address:</strong> {d.pickupLocation?.address || formatAddress(d.restaurant?.address)}
                    </div>
                  </div>
                  
                  <button onClick={() => handleClaim(d._id)} className="btn btn-primary w-full text-sm py-2">
                    Claim Food
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Claims */}
        <div>
          <h2 className="text-2xl mb-6">My Claims</h2>
          {myClaims.length === 0 ? (
            <div className="card text-center text-muted py-12">You haven't claimed any donations yet.</div>
          ) : (
            <div className="grid gap-4">
              {myClaims.map(d => {
                const coords = d.pickupLocation?.coordinates || d.restaurant?.location?.coordinates;
                const googleMapsUrl = coords && coords.length === 2 
                  ? `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`
                  : null;

                return (
                  <div key={d._id} className="card p-5 border border-blue-500/30 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{d.foodName}</h3>
                      <span className={`badge ${
                        d.status === 'completed' ? 'badge-success' :
                        d.status === 'picked_up' ? 'badge-warning' : 'badge-primary'
                      }`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-sm text-muted mb-3">
                      {d.quantity} {d.quantityUnit} • {d.foodType?.toUpperCase()}
                    </p>

                    {/* Vendor Contact & Registered Address Card */}
                    <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg mb-3 text-sm">
                      <div className="font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                        <Building size={15} className="text-blue-600" />
                        <span>Vendor: {d.restaurant?.name || 'Restaurant'}</span>
                      </div>
                      {d.restaurant?.phone && (
                        <div className="text-xs text-gray-700 mb-1 flex items-center gap-1.5">
                          <Phone size={13} className="text-blue-500" />
                          <span>Phone: <a href={`tel:${d.restaurant.phone}`} className="text-blue-700 hover:underline">{d.restaurant.phone}</a></span>
                        </div>
                      )}
                      {d.restaurant?.email && (
                        <div className="text-xs text-gray-700 mb-1 flex items-center gap-1.5">
                          <Mail size={13} className="text-blue-500" />
                          <span>Email: <a href={`mailto:${d.restaurant.email}`} className="text-blue-700 hover:underline">{d.restaurant.email}</a></span>
                        </div>
                      )}
                      <div className="text-xs text-gray-700 flex items-start gap-1.5 mt-1">
                        <MapPin size={13} className="text-blue-500 mt-0.5 shrink-0" />
                        <span><strong>Vendor Address:</strong> {formatAddress(d.restaurant?.address)}</span>
                      </div>
                    </div>

                    {/* Designated Food Pickup Address Card */}
                    <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg mb-4 text-sm">
                      <div className="font-semibold text-emerald-950 mb-1 flex items-center gap-1.5">
                        <Navigation size={15} className="text-emerald-700" />
                        <span>Designated Food Pickup Address:</span>
                      </div>
                      <div className="text-xs text-emerald-900 font-medium pl-5">
                        {d.pickupLocation?.address || formatAddress(d.restaurant?.address)}
                      </div>
                      {googleMapsUrl && (
                        <div className="mt-2 pl-5">
                          <a 
                            href={googleMapsUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-secondary inline-flex items-center gap-1 text-xs py-1 px-2.5"
                          >
                            <ExternalLink size={12} /> Open in Google Maps
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Action Controls for Receiver */}
                    <div className="flex gap-2">
                      {d.status === 'claimed' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(d._id, 'picked_up')} 
                            className="btn btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1"
                          >
                            <CheckCircle size={14} /> Mark Picked Up
                          </button>
                          <button 
                            onClick={() => handleCancelClaim(d._id)} 
                            className="btn btn-secondary text-xs py-2 px-3 text-red-600 hover:bg-red-50 flex items-center gap-1"
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        </>
                      )}
                      {d.status === 'picked_up' && (
                        <button 
                          onClick={() => handleUpdateStatus(d._id, 'completed')} 
                          className="btn btn-primary w-full text-xs py-2 flex items-center justify-center gap-1"
                        >
                          <CheckCircle size={14} /> Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default ReceiverDashboard;
