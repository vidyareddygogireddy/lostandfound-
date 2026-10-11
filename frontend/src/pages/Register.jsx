import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { 
        fullName, 
        email, 
        password, 
        phoneNumber,
        role
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
        <p className="text-sm text-gray-500 mt-1">Join the campus lost & found network</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">Full Name *</label>
          <input 
            type="text" 
            className="w-full px-3.5 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="G SriVidya Reddy"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">College Email *</label>
          <input 
            type="email" 
            className="w-full px-3.5 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="24EG105P29@college.edu"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">Phone Number</label>
          <input 
            type="text" 
            className="w-full px-3.5 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="9876543210"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">Account Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3.5 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Campus Administrator</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">Password *</label>
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
      </p>
    </div>
  );
}
