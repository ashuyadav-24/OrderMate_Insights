import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Compass,
  MapPin,
  Clock,
  Users,
  IndianRupee,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

const PLATFORMS = ['All', 'Blinkit', 'Zepto', 'Swiggy Instamart', 'Flipkart Minutes', 'Other'];

export const ActiveOrders = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [sameHostelOnly, setSameHostelOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Join Order Modal State
  const [selectedOrderForJoin, setSelectedOrderForJoin] = useState(null);
  const [joinItems, setJoinItems] = useState('');
  const [joinAmount, setJoinAmount] = useState('');
  const [joinNote, setJoinNote] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);
  const [joinModalMsg, setJoinModalMsg] = useState({ type: '', text: '' });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedPlatform !== 'All') params.platform = selectedPlatform;
      if (sameHostelOnly) params.sameHostelOnly = 'true';
      if (searchQuery) params.search = searchQuery;

      const res = await api.getActiveOrders(params);
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      setError('Failed to load active orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Live update interval every 10 seconds for countdowns
    const timer = setInterval(() => {
      setOrders((prev) =>
        prev
          .map((o) => ({
            ...o,
            remainingSeconds: Math.max(0, o.remainingSeconds - 1)
          }))
          .filter((o) => o.remainingSeconds > 0)
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedPlatform, sameHostelOnly, searchQuery]);

  // Check if query param specifies an order
  useEffect(() => {
    const targetOrderId = searchParams.get('order');
    if (targetOrderId && orders.length > 0) {
      const match = orders.find((o) => o._id === targetOrderId);
      if (match) setSelectedOrderForJoin(match);
    }
  }, [searchParams, orders]);

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderForJoin) return;
    setJoinModalMsg({ type: '', text: '' });
    setSubmittingJoin(true);

    try {
      const res = await api.sendJoinRequest(selectedOrderForJoin._id, {
        items: joinItems,
        estimatedAmount: Number(joinAmount),
        note: joinNote
      });

      if (res.success) {
        setJoinModalMsg({
          type: 'success',
          text: 'Join request submitted! The creator will review and accept you.'
        });
        setTimeout(() => {
          setSelectedOrderForJoin(null);
          setJoinItems('');
          setJoinAmount('');
          setJoinNote('');
          setJoinModalMsg({ type: '', text: '' });
        }, 1500);
      } else {
        setJoinModalMsg({ type: 'error', text: res.message || 'Failed to submit request' });
      }
    } catch (err) {
      setJoinModalMsg({ type: 'error', text: 'Error connecting to server' });
    } finally {
      setSubmittingJoin(false);
    }
  };

  const formatTimer = (seconds) => {
    if (!seconds || seconds <= 0) return 'Expired';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Orders Feed</h1>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Hostel {user?.hostel} Priority
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Orders from your hostel are prioritized first, followed by nearest campus hostels.
          </p>
        </div>

        <Link
          to="/create-order"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>+ Create Order</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, hostel, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Platform Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {PLATFORMS.map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedPlatform === plat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>

        {/* Same Hostel Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 shrink-0 select-none">
          <input
            type="checkbox"
            checked={sameHostelOnly}
            onChange={(e) => setSameHostelOnly(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 rounded"
          />
          <span>My Hostel Only (Hostel {user?.hostel})</span>
        </label>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No Matching Active Orders</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            There are currently no active orders matching your filter criteria. Try changing filters or post an order invitation yourself!
          </p>
          <Link
            to="/create-order"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <span>+ Create First Order</span>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => {
            const isCreator = order.creator?._id === user?._id;
            const isJoined = order.acceptedParticipants?.some(
              (p) => (p.user?._id || p.user) === user?._id
            );

            return (
              <div
                key={order._id}
                className={`bg-white rounded-3xl border transition shadow-sm hover:shadow-md flex flex-col justify-between p-5 ${
                  order.isSameHostel
                    ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar: Platform & Location Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800">
                      {order.platform}
                    </span>
                    {order.isSameHostel ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Same Hostel ({order.hostel})
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Hostel {order.hostel}
                        {order.distanceMeters ? ` (~${order.distanceMeters}m)` : ''}
                      </span>
                    )}
                  </div>

                  {/* Target Amount */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-slate-400 font-medium">Needs</span>
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{order.targetAmountNeeded}
                      </span>
                      <span className="text-xs text-slate-500">more for free delivery</span>
                    </div>

                    {/* Progress Bar for Contributed Amount */}
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (order.currentContributedAmount / order.targetAmountNeeded) * 100
                          )}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>₹{order.currentContributedAmount} contributed</span>
                      <span>Target: ₹{order.targetAmountNeeded}</span>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                    <img
                      src={order.creator?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${order.creator?.name}`}
                      alt={order.creator?.name}
                      className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {order.creator?.name}
                        {isCreator && <span className="ml-1 text-[10px] text-emerald-600 font-bold">(You)</span>}
                      </p>
                      <p className="text-[10px] text-slate-400">Hostel {order.hostel}</p>
                    </div>
                  </div>

                  {/* Meta Details */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.plannedOrderTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.acceptedParticipants?.length || 0} participants</span>
                    </div>
                  </div>
                </div>

                {/* Expiry & CTA */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" /> Visibility timer:
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {formatTimer(order.remainingSeconds)}
                    </span>
                  </div>

                  {isCreator ? (
                    <Link
                      to="/my-orders"
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center transition block"
                    >
                      Manage Incoming Requests
                    </Link>
                  ) : isJoined ? (
                    <Link
                      to={`/chats/${order._id}`}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold text-center transition block shadow-sm"
                    >
                      Open Order Chatroom
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedOrderForJoin(order);
                        setJoinModalMsg({ type: '', text: '' });
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold text-center transition shadow-sm"
                    >
                      Request to Join Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Join Request Modal */}
      {selectedOrderForJoin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Join {selectedOrderForJoin.platform} Order</h3>
                <p className="text-xs text-slate-500">
                  Published by {selectedOrderForJoin.creator?.name} (Hostel {selectedOrderForJoin.hostel})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForJoin(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {joinModalMsg.text && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  joinModalMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {joinModalMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{joinModalMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleJoinSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  1. Products you want to purchase
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1x Amul Toned Milk 500ml + 6 Eggs"
                  value={joinItems}
                  onChange={(e) => setJoinItems(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  2. Estimated amount you will spend (₹)
                </label>
                <p className="text-[11px] text-slate-500 mb-1">
                  Helps the creator know if your items fulfill the remaining ₹{selectedOrderForJoin.targetAmountNeeded} requirement.
                </p>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 50"
                  value={joinAmount}
                  onChange={(e) => setJoinAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Note to creator (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room D-204, will pay UPI right after order placement"
                  value={joinNote}
                  onChange={(e) => setJoinNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForJoin(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingJoin}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition disabled:opacity-50"
                >
                  {submittingJoin ? 'Sending...' : 'Submit Join Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
