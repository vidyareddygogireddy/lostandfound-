import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in with your campus credentials</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">Email</label>
          <input 
            type="email" 
            className="w-full px-3.5 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. 24EG105P29@college.edu"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">Password</label>
          <input 
            type="password" 
            className="w-full px-3.5 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
      </p>
    </div>
  );
}
