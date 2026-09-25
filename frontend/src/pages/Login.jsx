import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Login = ({ role, endpoint, title }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post(endpoint, { email, password });
      
      // Backend returns either { Token: "..." } or { token: "..." }
      const token = response.data.Token || response.data.token;
      
      if (token) {
        login(token);
        
        // Redirect based on role
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'vendor') navigate('/vendor/dashboard');
        else if (role === 'receiver') navigate('/receiver/dashboard');
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-panel auth-card">
        <h2 className="text-2xl mb-6 text-center">{title}</h2>
        
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          {role !== 'admin' && (
            <p className="text-center mt-4 text-muted">
              Don't have an account? <Link to={`/${role}/register`}>Register here</Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
