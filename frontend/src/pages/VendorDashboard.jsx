import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { PackagePlus, List, Clock, CheckCircle } from 'lucide-react';

const VendorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [formData, setFormData] = useState({
    foodName: '', foodType: 'veg', quantity: '', quantityUnit: 'meals',
    expiryTime: '', notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await api.get('/vendors/donations');
      setDonations(res.data.donations || []);
    } catch (err) {
      if(err.response?.status !== 404) console.error(err);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Posting donation...');
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        preparedAt: new Date().toISOString(),
        pickupLocation: { address: 'Vendor Address', coordinates: [76.77, 30.73] }
      };
      await api.post('/vendors/donations', payload);
      toast.success('Donation posted successfully!', { id: toastId });
      fetchDonations();
      setFormData({ foodName: '', foodType: 'veg', quantity: '', quantityUnit: 'meals', expiryTime: '', notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating donation.', { id: toastId });
    }
  };

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
          {message && <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded border border-blue-200">{message}</div>}
          
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
              <input type="datetime-local" className="form-control" required value={formData.expiryTime} onChange={e => setFormData({...formData, expiryTime: e.target.value})} />
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
          <h2 className="text-2xl mb-6 flex items-center gap-2"><List /> My Donations</h2>
          {donations.length === 0 ? (
            <div className="card text-center text-muted py-12">No donations posted yet.</div>
          ) : (
            <div className="grid gap-4">
              {donations.map(d => (
                <div key={d._id} className="card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{d.foodName}</h3>
                    <span className={`badge ${d.status === 'available' ? 'badge-primary' : d.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                      {d.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3">{d.quantity} {d.quantityUnit} • {d.foodType.toUpperCase()}</p>
                  
                  {d.status === 'claimed' && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-3">
                      <p className="text-sm text-yellow-800"><Clock size={14} className="inline mr-1"/> Claimed by {d.receiver?.name || 'an NGO'}</p>
                    </div>
                  )}
                  
                  {d.status === 'claimed' && (
                    <button onClick={async () => {
                      await api.put(`/vendors/donations/${d._id}/picked-up`);
                      fetchDonations();
                    }} className="btn btn-primary w-full text-sm py-2"><CheckCircle size={16} /> Mark Picked Up</button>
                  )}
                  {d.status === 'picked_up' && (
                    <button onClick={async () => {
                      await api.put(`/vendors/donations/${d._id}/completed`);
                      fetchDonations();
                    }} className="btn btn-secondary w-full text-sm py-2">Mark Completed</button>
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
