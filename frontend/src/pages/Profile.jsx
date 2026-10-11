import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('received'); // 'received', 'myReports', 'myClaims'
  const [myReports, setMyReports] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadProfileData();
  }, [navigate]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [profileRes, reportsRes, receivedRes, myClaimsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/items/my-reports'),
        api.get('/claims/received'),
        api.get('/claims/my-claims')
      ]);

      setUser(profileRes.data);
      setMyReports(reportsRes.data);
      setReceivedClaims(receivedRes.data);
      setMyClaims(myClaimsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDecision = async (claimId, status) => {
    try {
      await api.put(`/claims/${claimId}/status`, { status });
      setActionMessage(`Claim successfully ${status.toLowerCase()}!`);
      loadProfileData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update claim.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/items/${itemId}`);
      loadProfileData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete item.');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500 font-medium">Loading profile...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* User Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.fullName}</h1>
          <p className="text-gray-500 text-sm">{user?.email} • {user?.phoneNumber || 'No phone'}</p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">
          {user?.role}
        </span>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium">
          {actionMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-4 px-6 text-sm font-semibold border-b-2 transition ${
              activeTab === 'received'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Claims on My Items ({receivedClaims.length})
          </button>
          <button
            onClick={() => setActiveTab('myReports')}
            className={`flex-1 py-4 px-6 text-sm font-semibold border-b-2 transition ${
              activeTab === 'myReports'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Reported Items ({myReports.length})
          </button>
          <button
            onClick={() => setActiveTab('myClaims')}
            className={`flex-1 py-4 px-6 text-sm font-semibold border-b-2 transition ${
              activeTab === 'myClaims'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Submitted Claims ({myClaims.length})
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: Claims Received on Finder's Items */}
          {activeTab === 'received' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Claims Needing Your Review</h2>
              {receivedClaims.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No claims received on items you reported.</p>
              ) : (
                receivedClaims.map((claim) => (
                  <div
                    key={claim.claimId}
                    className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3"
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <span className="text-xs font-semibold text-blue-600 uppercase">
                          {claim.item?.itemType === 'LOST' ? '🎉 Found Report for Your Item' : '🔍 Ownership Claim on Found Item'}: {claim.item?.title}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 mt-1">
                          {claim.item?.itemType === 'LOST' ? 'Finder' : 'Claimant'}: {claim.claimer?.fullName} ({claim.claimer?.email})
                        </h4>
                        <p className="text-xs text-gray-500">
                          Submitted on: {new Date(claim.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {claim.claimer?.phoneNumber && (
                          <a
                            href={`tel:${claim.claimer.phoneNumber}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition flex items-center gap-1"
                          >
                            <span>📞</span> Call: {claim.claimer.phoneNumber}
                          </a>
                        )}
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                            claim.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : claim.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        {claim.item?.itemType === 'LOST' ? "Finder's Message / Note:" : "Claimant's Proof of Ownership:"}
                      </p>
                      <p className="text-sm text-gray-800 whitespace-pre-line">{claim.proofDescription}</p>
                    </div>

                    {claim.status === 'PENDING' && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleClaimDecision(claim.claimId, 'APPROVED')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition"
                        >
                          ✓ Approve Claim & Resolve Item
                        </button>
                        <button
                          onClick={() => handleClaimDecision(claim.claimId, 'REJECTED')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
                        >
                          ✕ Reject Claim
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: My Reported Items */}
          {activeTab === 'myReports' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-gray-900">Your Reported Items</h2>
                <Link
                  to="/report"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg"
                >
                  + Report New
                </Link>
              </div>

              {myReports.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">You have not reported any items yet.</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {myReports.map((item) => (
                    <div key={item.itemId} className="py-4 flex justify-between items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-bold rounded ${
                              item.itemType === 'LOST'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.itemType}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${
                              item.status === 'ACTIVE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.status}
                          </span>
                          <h4 className="font-bold text-gray-900">{item.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {item.location} • 📅 {item.dateReported} • Category: {item.category}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/item/${item.itemId}`}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteItem(item.itemId)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: My Submitted Claims */}
          {activeTab === 'myClaims' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Claims You Submitted</h2>
              {myClaims.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">You have not submitted any claims.</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {myClaims.map((claim) => (
                    <div key={claim.claimId} className="py-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900">
                            Claim for: <Link to={`/item/${claim.item?.itemId}`} className="text-blue-600 hover:underline">{claim.item?.title}</Link>
                          </h4>
                          <p className="text-xs text-gray-500">
                            Submitted on: {new Date(claim.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                            claim.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : claim.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <strong className="text-xs text-gray-500 block mb-0.5">Your Proof:</strong>
                        {claim.proofDescription}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
