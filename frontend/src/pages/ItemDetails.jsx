import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [proof, setProof] = useState('');
  const [claimStatus, setClaimStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showFoundModal, setShowFoundModal] = useState(false);
  const [foundNote, setFoundNote] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  const fetchItemData = () => {
    api.get(`/items/${id}`)
      .then(res => {
        setItem(res.data);
        setLoading(false);

        // If current user is the owner, fetch any claims / found reports on this item
        if (token) {
          api.get(`/claims/item/${id}`)
            .then(claimRes => setClaims(claimRes.data))
            .catch(() => setClaims([]));
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItemData();
  }, [id, token]);

  // Handler when someone claims a FOUND item
  const handleClaim = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate(`/login?redirect=/item/${id}`);
      return;
    }

    setSubmitting(true);
    setClaimStatus(null);

    try {
      await api.post('/claims', {
        itemId: id,
        proofDescription: proof
      });
      setClaimStatus({
        success: true,
        message: '🎉 Claim submitted successfully! The finder will review your ownership proof.'
      });
      setProof('');
      fetchItemData();
    } catch (err) {
      setClaimStatus({
        success: false,
        message: err.response?.data?.message || 'Failed to submit claim.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handler when someone finds a LOST item and clicks "Found"
  const handleFoundNotification = async (e) => {
    if (e) e.preventDefault();
    if (!token) {
      navigate(`/login?redirect=/item/${id}`);
      return;
    }

    setSubmitting(true);
    setClaimStatus(null);

    try {
      const defaultMsg = foundNote.trim()
        ? foundNote
        : `I found your item! Please call me at ${currentUser?.phoneNumber || 'my registered number'} to collect it.`;

      await api.post('/claims', {
        itemId: id,
        proofDescription: defaultMsg
      });

      setClaimStatus({
        success: true,
        message: `🎉 Great! The person who reported this lost item has been notified. They can see your phone number (${currentUser?.phoneNumber || 'registered with your account'}) and call you directly.`
      });
      setShowFoundModal(false);
      setFoundNote('');
      fetchItemData();
    } catch (err) {
      setClaimStatus({
        success: false,
        message: err.response?.data?.message || 'Failed to notify the owner.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handler to mark item as resolved
  const handleResolveItem = async () => {
    if (!window.confirm('Mark this item as resolved/received?')) return;
    try {
      await api.patch(`/items/${id}/status`, { status: 'RESOLVED' });
      fetchItemData();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500 font-medium">Loading item details...</div>;
  if (!item) return <div className="text-center py-12 text-gray-500 font-medium">Item not found.</div>;

  const isReporter = currentUser && item.user && (
    currentUser.userId === item.user.userId || currentUser.email === item.user.email
  );

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <Link to="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
          &larr; Back to Dashboard
        </Link>
        <div className="flex gap-2">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
              item.itemType === 'LOST'
                ? 'bg-red-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {item.itemType}
          </span>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full ${
              item.status === 'ACTIVE'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {item.status}
          </span>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Title and Category */}
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            {item.category.replace('_', ' ')}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{item.title}</h1>
        </div>

        {/* Image if available */}
        {item.imageUrl && (
          <div className="rounded-xl overflow-hidden max-h-96 bg-gray-100 flex items-center justify-center border">
            <img
              src={getImageUrl(item.imageUrl)}
              alt={item.title}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
          <p className="text-gray-800 whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            {item.description || 'No detailed description provided.'}
          </p>
        </div>

        {/* Location, Date & Reporter Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold uppercase">Location</p>
            <p className="text-gray-900 font-medium mt-1">📍 {item.location}</p>
          </div>
          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
            <p className="text-xs text-indigo-600 font-semibold uppercase">Date Reported</p>
            <p className="text-gray-900 font-medium mt-1">📅 {item.dateReported}</p>
          </div>
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-600 font-semibold uppercase">Reported By</p>
            <p className="text-gray-900 font-medium mt-1">👤 {item.user?.fullName || 'Anonymous'}</p>
            {item.user?.phoneNumber && (
              <p className="text-xs text-gray-600 mt-1">📞 {item.user.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Status Feedback Messages */}
        {claimStatus && (
          <div
            className={`p-4 rounded-xl text-sm font-medium ${
              claimStatus.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {claimStatus.message}
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 1: LOST ITEM FLOW */}
        {/* ========================================================================= */}
        {item.itemType === 'LOST' && item.status === 'ACTIVE' && (
          <div className="border-t pt-8 space-y-6">
            {/* If the viewer is NOT the owner who lost it: Show the "Found" Button */}
            {!isReporter && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                      <span>🎉</span> Did you find this lost item?
                    </h3>
                    <p className="text-sm text-emerald-800 mt-1 max-w-lg">
                      Click the <strong>"Found"</strong> button to notify the owner. Your phone number (
                      <strong>{currentUser?.phoneNumber || 'registered in your account'}</strong>) will be shared so the owner can call you.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowFoundModal(true)}
                    className="whitespace-nowrap px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    <span>✓</span> Found
                  </button>
                </div>

                {/* Modal / Quick note when clicking Found */}
                {showFoundModal && (
                  <div className="mt-6 pt-6 border-t border-emerald-200/60 bg-white p-5 rounded-xl border shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Notify Owner with Your Contact Info</h4>
                    <p className="text-xs text-gray-500 mb-4">
                      The owner will receive your name (<strong>{currentUser?.fullName}</strong>) and phone number (
                      <strong>{currentUser?.phoneNumber || 'No phone number set'}</strong>). You can also leave a short message below:
                    </p>

                    <form onSubmit={handleFoundNotification} className="space-y-4">
                      <textarea
                        rows="3"
                        placeholder="E.g., I found this item in the library on table 4. Please call me to collect it!"
                        value={foundNote}
                        onChange={(e) => setFoundNote(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      ></textarea>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowFoundModal(false)}
                          className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow transition disabled:opacity-50"
                        >
                          {submitting ? 'Notifying Owner...' : 'Confirm & Notify Owner'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* If the viewer IS the owner who lost it: Show whether someone found it + finder's phone number */}
            {isReporter && (
              <div>
                {claims.length > 0 ? (
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">🎉</span>
                      <div>
                        <h3 className="text-xl font-extrabold text-emerald-950">
                          Great News! Someone Found Your Item!
                        </h3>
                        <p className="text-sm text-emerald-800">
                          A student reported finding your item. Call their phone number below to coordinate:
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {claims.map((claim) => (
                        <div
                          key={claim.claimId}
                          className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                          <div>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                              Finder Details
                            </span>
                            <h4 className="text-lg font-black text-gray-950 mt-0.5">
                              {claim.claimer?.fullName || 'Campus Student'}
                            </h4>
                            <p className="text-xs text-gray-500">{claim.claimer?.email}</p>
                            {claim.proofDescription && (
                              <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                💬 <em>"{claim.proofDescription}"</em>
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                            {claim.claimer?.phoneNumber ? (
                              <a
                                href={`tel:${claim.claimer.phoneNumber}`}
                                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow transition text-center w-full sm:w-auto"
                              >
                                <span>📞</span> Call: {claim.claimer.phoneNumber}
                              </a>
                            ) : (
                              <span className="text-xs text-gray-500 italic">No phone number provided</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleResolveItem}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
                      >
                        ✓ I Received My Item (Mark as Resolved)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
                    ⏳ <strong>Waiting for finder:</strong> You reported this item lost. When someone finds it and clicks the <strong>"Found"</strong> button, their phone number and details will appear here so you can call them immediately.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 2: FOUND ITEM FLOW (Claiming ownership) */}
        {/* ========================================================================= */}
        {item.itemType === 'FOUND' && item.status === 'ACTIVE' && (
          <div className="border-t pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Claim Ownership of This Item</h3>
            <p className="text-sm text-gray-500 mb-6">
              To verify your ownership, please describe unique characteristics (e.g. phone wallpaper, serial number, internal contents, scratches).
            </p>

            {isReporter ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-sm">
                ℹ️ You are the finder of this item. Check your <Link to="/profile" className="font-bold underline">Profile / Activity</Link> to review claims submitted by other students.
              </div>
            ) : (
              <form onSubmit={handleClaim} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Proof of Ownership *
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={proof}
                    onChange={(e) => setProof(e.target.value)}
                    placeholder="E.g., It has a Pokémon sticker on the back, lock screen wallpaper is a golden retriever, passcode starts with 8..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting Claim...' : 'Submit Claim Request'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* If item is resolved */}
        {item.status === 'RESOLVED' && (
          <div className="bg-gray-100 border border-gray-200 text-gray-700 p-4 rounded-xl text-sm font-medium">
            ✅ This item has been successfully resolved and returned to its rightful owner.
          </div>
        )}
      </div>
    </div>
  );
}
