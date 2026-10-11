import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, LOST, FOUND
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  const fetchItems = () => {
    setLoading(true);
    const params = {};
    if (activeTab !== 'ALL') params.itemType = activeTab;
    if (category) params.category = category;
    if (location) params.location = location;
    if (search) params.search = search;

    api.get('/items', { params })
      .then(res => {
        setItems(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setActiveTab('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Campus Lost & Found Hub</h1>
          <p className="mt-2 text-blue-100 max-w-xl">
            A centralized platform to quickly report, locate, and claim lost items across campus.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/report?type=LOST"
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2.5 rounded-lg shadow transition"
          >
            + Report Lost Item
          </Link>
          <Link
            to="/report?type=FOUND"
            className="bg-emerald-500 text-white hover:bg-emerald-600 font-semibold px-4 py-2.5 rounded-lg shadow transition"
          >
            + Report Found Item
          </Link>
        </div>
      </div>

      {/* Tabs & Search & Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          {/* Feed Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                activeTab === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTab('LOST')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                activeTab === 'LOST' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lost Items
            </button>
            <button
              onClick={() => setActiveTab('FOUND')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                activeTab === 'FOUND' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Found Items
            </button>
          </div>

          <span className="text-sm text-gray-500 font-medium">
            Showing <strong className="text-gray-800">{items.length}</strong> items
          </span>
        </div>

        {/* Filter Controls */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <input
              type="text"
              placeholder="Search by title, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="ELECTRONICS">Electronics (Phones, Laptops, Earbuds)</option>
              <option value="ID_CARD">ID Cards & Wallets</option>
              <option value="BOOKS">Books & Notebooks</option>
              <option value="KEYS">Keys</option>
              <option value="OTHER">Other Belongings</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter by location (e.g. Library)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-3 rounded-lg transition"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm py-2 px-3 rounded-lg transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
          <p className="text-gray-400 text-sm mt-1">Try resetting filters or reporting a new item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.itemId}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col"
            >
              {/* Item Image */}
              <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-sm font-medium flex flex-col items-center">
                    <span>No Image Provided</span>
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                      item.itemType === 'LOST'
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {item.itemType}
                  </span>
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'ACTIVE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    {item.category.replace('_', ' ')}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {item.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>📍 {item.location}</span>
                    <span>📅 {item.dateReported}</span>
                  </div>

                  <Link
                    to={`/item/${item.itemId}`}
                    className="block text-center w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded-lg text-sm transition"
                  >
                    View Details & {item.itemType === 'FOUND' ? 'Claim' : 'Info'} &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
