import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const RegisterReceiver = () => {
  const [formData, setFormData] = useState({
    name: '', manager: '', email: '', password: '', phone: '',
    address: '', location: { type: 'Point', coordinates: [76.7794, 30.7333] },
    role: 'orphanage'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.post('/receivers/register', formData);
      alert('Registration successful! Please wait for admin verification.');
      navigate('/receiver/login');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in py-12">
      <div className="glass-panel auth-card" style={{ maxWidth: '600px' }}>
        <h2 className="text-2xl mb-6 text-center">Receiver Registration</h2>
        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label>Organization Name</label>
            <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Manager Name</label>
            <input type="text" className="form-control" required value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <small className="text-muted">Min 8 chars, 1 letter, 1 number</small>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" className="form-control" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" className="form-control" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          
          <div className="col-span-2 mt-4">
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register as Receiver'}
            </button>
            <p className="text-center mt-4 text-muted">Already have an account? <Link to="/receiver/login">Login here</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterReceiver;
