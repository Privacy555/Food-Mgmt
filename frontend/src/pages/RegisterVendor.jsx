import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const RegisterVendor = () => {
  const [formData, setFormData] = useState({
    name: '', ownerName: '', email: '', password: '', phone: '',
    address: { street: '', city: '', state: '', pincode: '' },
    restaurantType: 'restaurant',
    location: { type: 'Point', coordinates: [76.7794, 30.7333] } // Default to Chandigarh coords
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.post('/vendors/register', formData);
      alert('Registration successful! Please wait for admin verification before logging in.');
      navigate('/vendor/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in py-12">
      <div className="glass-panel auth-card" style={{ maxWidth: '600px' }}>
        <h2 className="text-2xl mb-6 text-center">Vendor Registration</h2>
        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label>Restaurant Name</label>
            <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Owner Name</label>
            <input type="text" className="form-control" required value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" className="form-control" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Restaurant Type</label>
            <select className="form-control" value={formData.restaurantType} onChange={e => setFormData({...formData, restaurantType: e.target.value})}>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="cafe">Cafe</option>
              <option value="bakery">Bakery</option>
              <option value="catering">Catering</option>
            </select>
          </div>
          <div className="col-span-2 mt-4"><h3 className="text-lg">Address</h3></div>
          <div className="form-group">
            <label>Street</label>
            <input type="text" className="form-control" required value={formData.address.street} onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})} />
          </div>
          <div className="form-group">
            <label>City</label>
            <input type="text" className="form-control" required value={formData.address.city} onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})} />
          </div>
          <div className="form-group">
            <label>State</label>
            <input type="text" className="form-control" required value={formData.address.state} onChange={e => setFormData({...formData, address: {...formData.address, state: e.target.value}})} />
          </div>
          <div className="form-group">
            <label>Pincode</label>
            <input type="text" className="form-control" required value={formData.address.pincode} onChange={e => setFormData({...formData, address: {...formData.address, pincode: e.target.value}})} />
          </div>
          
          <div className="col-span-2 mt-4">
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register as Vendor'}
            </button>
            <p className="text-center mt-4 text-muted">Already have an account? <Link to="/vendor/login">Login here</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterVendor;
