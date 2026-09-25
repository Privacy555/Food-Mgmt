import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const RegisterVendor = () => {
  const [formData, setFormData] = useState({
    name: '', ownerName: '', email: '', password: '', phone: '',
    address: { street: '', city: '', state: '', pincode: '' },
    restaurantType: 'restaurant',
    location: { type: 'Point', coordinates: [76.7794, 30.7333] }
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Restaurant name is required.';
    if (!formData.ownerName.trim()) e.ownerName = 'Owner name is required.';
    if (!formData.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email.';
    if (!formData.password) e.password = 'Password is required.';
    else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (!formData.phone.trim()) e.phone = 'Phone is required.';
    if (!formData.address.street.trim()) e.street = 'Street is required.';
    if (!formData.address.city.trim()) e.city = 'City is required.';
    if (!formData.address.state.trim()) e.state = 'State is required.';
    if (!formData.address.pincode.trim()) e.pincode = 'Pincode is required.';
    return e;
  };

  const set = (field, value) => setFormData(p => ({ ...p, [field]: value }));
  const setAddr = (field, value) => setFormData(p => ({ ...p, address: { ...p.address, [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const toastId = toast.loading('Registering...');
    try {
      await api.post('/vendors/register', formData);
      toast.success('Registered! Please wait for admin verification.', { id: toastId });
      navigate('/vendor/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const F = ({ label, id, error, children }) => (
    <div className="form-group">
      <label>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );

  return (
    <div className="auth-container animate-fade-in py-12">
      <div className="glass-panel auth-card" style={{ maxWidth: '600px' }}>
        <h2 className="text-2xl mb-6 text-center">Vendor Registration</h2>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-2 gap-4">
          <F label="Restaurant Name" error={errors.name}>
            <input type="text" className={`form-control ${errors.name ? 'input-error' : ''}`} value={formData.name} onChange={e => set('name', e.target.value)} />
          </F>
          <F label="Owner Name" error={errors.ownerName}>
            <input type="text" className={`form-control ${errors.ownerName ? 'input-error' : ''}`} value={formData.ownerName} onChange={e => set('ownerName', e.target.value)} />
          </F>
          <F label="Email" error={errors.email}>
            <input type="email" className={`form-control ${errors.email ? 'input-error' : ''}`} value={formData.email} onChange={e => set('email', e.target.value)} />
          </F>
          <F label="Password" error={errors.password}>
            <input type="password" className={`form-control ${errors.password ? 'input-error' : ''}`} value={formData.password} onChange={e => set('password', e.target.value)} />
          </F>
          <F label="Phone" error={errors.phone}>
            <input type="text" className={`form-control ${errors.phone ? 'input-error' : ''}`} value={formData.phone} onChange={e => set('phone', e.target.value)} />
          </F>
          <div className="form-group">
            <label>Restaurant Type</label>
            <select className="form-control" value={formData.restaurantType} onChange={e => set('restaurantType', e.target.value)}>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="cafe">Cafe</option>
              <option value="bakery">Bakery</option>
              <option value="catering">Catering</option>
            </select>
          </div>

          <div className="col-span-2 mt-2"><h3 className="text-base font-bold text-muted">Address</h3></div>
          <F label="Street" error={errors.street}>
            <input type="text" className={`form-control ${errors.street ? 'input-error' : ''}`} value={formData.address.street} onChange={e => setAddr('street', e.target.value)} />
          </F>
          <F label="City" error={errors.city}>
            <input type="text" className={`form-control ${errors.city ? 'input-error' : ''}`} value={formData.address.city} onChange={e => setAddr('city', e.target.value)} />
          </F>
          <F label="State" error={errors.state}>
            <input type="text" className={`form-control ${errors.state ? 'input-error' : ''}`} value={formData.address.state} onChange={e => setAddr('state', e.target.value)} />
          </F>
          <F label="Pincode" error={errors.pincode}>
            <input type="text" className={`form-control ${errors.pincode ? 'input-error' : ''}`} value={formData.address.pincode} onChange={e => setAddr('pincode', e.target.value)} />
          </F>

          <div className="col-span-2 mt-2">
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
