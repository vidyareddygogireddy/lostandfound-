import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function ReportItem() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'LOST';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ELECTRONICS',
    itemType: defaultType,
    location: '',
    dateReported: new Date().toISOString().split('T')[0]
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?redirect=/report');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('itemType', formData.itemType);
      data.append('location', formData.location);
      data.append('dateReported', formData.dateReported);

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      await api.post('/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit report. Please verify login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Report {formData.itemType === 'LOST' ? 'a Lost' : 'a Found'} Item
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Provide accurate details so the item can be quickly verified and returned.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Toggle Lost vs Found */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, itemType: 'LOST' })}
              className={`py-2.5 px-4 rounded-lg font-medium border text-sm text-center transition ${
                formData.itemType === 'LOST'
                  ? 'bg-red-50 border-red-500 text-red-700 font-bold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              🔍 I Lost Something
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, itemType: 'FOUND' })}
              className={`py-2.5 px-4 rounded-lg font-medium border text-sm text-center transition ${
                formData.itemType === 'FOUND'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              🎉 I Found Something
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Item Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="E.g., Blue Dell Laptop, Titan Watch, Student ID Card"
          />
        </div>

        {/* Category & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ELECTRONICS">Electronics (Phones, Laptops)</option>
              <option value="ID_CARD">ID Cards & Wallets</option>
              <option value="BOOKS">Books & Stationary</option>
              <option value="KEYS">Keys & Locks</option>
              <option value="OTHER">Other Belongings</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Campus Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="E.g., Central Library 2nd Floor, Canteen, Block A"
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date Incident Occurred *</label>
          <input
            type="date"
            name="dateReported"
            value={formData.dateReported}
            onChange={handleChange}
            required
            className="mt-1 w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="mt-1 w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Provide distinguishing features, colors, brands, stickers, etc."
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Item Photo (Recommended for Found Items)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
