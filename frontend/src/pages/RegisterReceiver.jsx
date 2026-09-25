import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const RegisterReceiver = () => {
  const [formData, setFormData] = useState({
    name: '', manager: '', email: '', password: '', phone: '',
    address: '', location: { type: 'Point', coordinates: [76.7794, 30.7333] },
    role: 'orphanage'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Organization name is required.';
    if (!formData.manager.trim()) e.manager = 'Manager name is required.';
    if (!formData.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email.';
    if (!formData.password) e.password = 'Password is required.';
    else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(formData.password)) e.password = 'Min 8 chars, 1 letter + 1 number.';
    if (!formData.phone.trim()) e.phone = 'Phone is required.';
    if (!formData.address.trim()) e.address = 'Address is required.';
    return e;
  };

  const set = (field, value) => setFormData(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const toastId = toast.loading('Registering...');
    try {
      await api.post('/receivers/register', formData);
      toast.success('Registered! Please wait for admin verification.', { id: toastId });
      navigate('/receiver/login');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const F = ({ label, error, children }) => (
    <div className="form-group">
      <label>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );

  return (
    <div className="auth-container animate-fade-in py-12">
      <div className="glass-panel auth-card" style={{ maxWidth: '600px' }}>
        <h2 className="text-2xl mb-6 text-center">Receiver Registration</h2>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-2 gap-4">
          <F label="Organization Name" error={errors.name}>
            <input type="text" className={`form-control ${errors.name ? 'input-error' : ''}`} value={formData.name} onChange={e => set('name', e.target.value)} />
          </F>
          <F label="Manager Name" error={errors.manager}>
            <input type="text" className={`form-control ${errors.manager ? 'input-error' : ''}`} value={formData.manager} onChange={e => set('manager', e.target.value)} />
          </F>
          <F label="Email" error={errors.email}>
            <input type="email" className={`form-control ${errors.email ? 'input-error' : ''}`} value={formData.email} onChange={e => set('email', e.target.value)} />
          </F>
          <F label="Password" error={errors.password}>
            <input type="password" className={`form-control ${errors.password ? 'input-error' : ''}`} value={formData.password} onChange={e => set('password', e.target.value)} />
            {!errors.password && <small className="text-muted">Min 8 chars, 1 letter + 1 number</small>}
          </F>
          <F label="Phone" error={errors.phone}>
            <input type="text" className={`form-control ${errors.phone ? 'input-error' : ''}`} value={formData.phone} onChange={e => set('phone', e.target.value)} />
          </F>
          <F label="Address" error={errors.address}>
            <input type="text" className={`form-control ${errors.address ? 'input-error' : ''}`} value={formData.address} onChange={e => set('address', e.target.value)} />
          </F>

          <div className="col-span-2 mt-2">
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
