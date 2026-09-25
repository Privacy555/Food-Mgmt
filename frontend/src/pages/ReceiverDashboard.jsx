import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { MapPin, HeartHandshake, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ReceiverDashboard = () => {
  const [available, setAvailable] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([30.7333, 76.7794]);

  useEffect(() => {
    // Use browser geolocation to center the map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
        () => {} // silently fall back to default
      );
    }
    fetchData();
  }, []);

  const fetchData = async () => {
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
    }
  };

  const handleClaim = async (id) => {
    const toastId = toast.loading('Claiming...');
    try {
      await api.post(`/receivers/donations/${id}/claim`);
      toast.success('Food claimed successfully!', { id: toastId });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error claiming donation', { id: toastId });
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
          <h2 className="text-2xl mb-6">Nearby Donations</h2>
          
          <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm" style={{ height: '300px' }}>
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {available.map(d => (
                d.restaurant?.location?.coordinates && (
                  <Marker 
                    key={d._id} 
                    position={[d.restaurant.location.coordinates[1], d.restaurant.location.coordinates[0]]}
                  >
                    <Popup>
                      <strong>{d.foodName}</strong> ({d.foodType})<br/>
                      {d.quantity} {d.quantityUnit}<br/>
                      <button onClick={() => handleClaim(d._id)} className="btn btn-primary mt-2 text-xs py-1 px-2 w-full">Claim</button>
                    </Popup>
                  </Marker>
                )
              ))}
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
                  <p className="text-sm text-gray-500 mb-4"><Navigation size={14} className="inline mr-1" /> {d.restaurant?.name || 'Restaurant'}</p>
                  
                  <button onClick={() => handleClaim(d._id)} className="btn btn-primary w-full text-sm py-2">Claim Food</button>
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
              {myClaims.map(d => (
                <div key={d._id} className="card p-4 border border-blue-500/30">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{d.foodName}</h3>
                    <span className="badge badge-primary">{d.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-muted mb-2">From: {d.restaurant?.name}</p>
                  
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                    <strong className="text-gray-700">Pickup Address:</strong><br/>
                    {d.pickupLocation?.address || 'Address provided upon claim'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default ReceiverDashboard;
