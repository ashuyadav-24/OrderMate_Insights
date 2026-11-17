import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Package,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Check,
  X,
  IndianRupee,
  ShoppingBag,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const MyOrders = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('created'); // 'created' or 'joined'
  const [createdOrders, setCreatedOrders] = useState([]);
  const [joinedOrders, setJoinedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Completion Modal State
  const [orderToComplete, setOrderToComplete] = useState(null);
  const [actualChargesPaid, setActualChargesPaid] = useState('10');
  const [creatorSpend, setCreatorSpend] = useState('120');
  const [creatorChargesAvoided, setCreatorChargesAvoided] = useState('45');
  const [creatorUnneededAvoided, setCreatorUnneededAvoided] = useState('0');
  const [participantInputs, setParticipantInputs] = useState({});
  const [completing, setCompleting] = useState(false);
  const [completeSuccessMsg, setCompleteSuccessMsg] = useState('');

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getMyOrders();
      if (res.success) {
        setCreatedOrders(res.data.createdOrders || []);
        setJoinedOrders(res.data.joinedOrders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  // Accept or reject join request
  const handleRequestResponse = async (orderId, requestId, action) => {
    try {
      const res = await api.respondToRequest(requestId, action);
      if (res.success) {
        fetchMyOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update order status (PLACED, CANCELLED)
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        fetchMyOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Completion Modal
  const openCompleteModal = (order) => {
    setOrderToComplete(order);
    const initialParticipants = {};
    order.acceptedParticipants.forEach((p) => {
      initialParticipants[p.user._id] = {
        userId: p.user._id,
        actualSpend: p.expectedAmount,
        chargesAvoided: 45,
        unnecessarySpendAvoided: 0
      };
    });
    setParticipantInputs(initialParticipants);
    setCompleteSuccessMsg('');
  };

  // Submit Final Order Completion and verified savings
  const handleFinalizeCompletion = async (e) => {
    e.preventDefault();
    if (!orderToComplete) return;
    setCompleting(true);

    try {
      const detailsArray = Object.values(participantInputs);
      const res = await api.completeOrder(orderToComplete._id, {
        actualChargesPaid: Number(actualChargesPaid),
        creatorSpend: Number(creatorSpend),
        creatorChargesAvoided: Number(creatorChargesAvoided),
        creatorUnnecessarySpendAvoided: Number(creatorUnneededAvoided),
        participantDetails: detailsArray
      });

      if (res.success) {
        setCompleteSuccessMsg('Order successfully completed! Verified savings calculated and credited to all participants.');
        setTimeout(() => {
          setOrderToComplete(null);
          fetchMyOrders();
        }, 1500);
      }
    } catch (err) {
      console.error('Completion error:', err);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Group Orders</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage invitations you published, accept incoming joiners, and view your participation history.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('created')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'created'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders I Created ({createdOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('joined')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'joined'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Orders I Joined ({joinedOrders.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'created' ? (
        createdOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">You haven't created any orders yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Start an order invitation when you're about to purchase.</p>
            <Link
              to="/create-order"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-700 transition"
            >
              + Create Order Invitation
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {createdOrders.map((order) => {
              const isExpired = order.status === 'EXPIRED';
              const isCompleted = order.status === 'COMPLETED';
              const isActive = order.status === 'ACTIVE';

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900 text-sm tracking-wide">
                        {order.orderCode}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800">
                        {order.platform}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCompleted
                            ? 'bg-teal-100 text-teal-800'
                            : isExpired
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/chats/${order._id}`}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chatroom</span>
                      </Link>

                      {isActive && (
                        <>
                          <button
                            onClick={() => handleStatusChange(order._id, 'PLACED')}
                            className="py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition"
                          >
                            Mark as Placed
                          </button>
                          <button
                            onClick={() => handleStatusChange(order._id, 'CANCELLED')}
                            className="py-1.5 px-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {order.status === 'PLACED' && (
                        <button
                          onClick={() => openCompleteModal(order)}
                          className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                        >
                          Confirm & Complete Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Metrics Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Target Needed</span>
                      <span className="font-bold text-slate-800">₹{order.targetAmountNeeded}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Contributed by Group</span>
                      <span className="font-bold text-emerald-600">₹{order.currentContributedAmount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Planned Time</span>
                      <span className="font-semibold text-slate-700">{order.plannedOrderTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Participants</span>
                      <span className="font-semibold text-slate-700">
                        {order.acceptedParticipants?.length || 0} accepted
                      </span>
                    </div>
                  </div>

                  {/* Accepted Participants List */}
                  {order.acceptedParticipants?.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-600 mb-2">Accepted Students:</h4>
                      <div className="flex flex-wrap gap-2">
                        {order.acceptedParticipants.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs"
                          >
                            <img
                              src={p.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.user?.name}`}
                              alt={p.user?.name}
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="font-semibold text-slate-800">{p.user?.name}</span>
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 rounded text-[10px]">
                              ₹{p.expectedAmount}
                            </span>
                            <span className="text-slate-400 text-[10px]">({p.items})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : joinedOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">You haven't joined any orders yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Discover active orders in your hostel and send a request!</p>
          <Link
            to="/active-orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-700 transition"
          >
            Explore Active Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {joinedOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-sm">{order.orderCode}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800">
                    {order.platform}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {order.status}
                  </span>
                </div>

                <Link
                  to={`/chats/${order._id}`}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open Chatroom</span>
                </Link>
              </div>

              <div className="text-xs text-slate-600 flex items-center gap-4">
                <span>Creator: <strong className="text-slate-800">{order.creator?.name}</strong> (Hostel {order.hostel})</span>
                <span>Planned Time: <strong className="text-slate-800">{order.plannedOrderTime}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completion & Verified Savings Modal */}
      {orderToComplete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Finalize & Confirm Verified Savings: {orderToComplete.orderCode}
                </h3>
                <p className="text-xs text-slate-500">
                  Enter final charges to accurately calculate net savings for each student.
                </p>
              </div>
              <button
                onClick={() => setOrderToComplete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {completeSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{completeSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleFinalizeCompletion} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1">
                <span className="font-bold block">Verified Savings Formula:</span>
                <p className="text-[11px] text-emerald-800">
                  Individual Net Savings = Charges Avoided (e.g. ₹45 delivery/small-cart fee) - Fair Share of Combined Charges.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Total Checkout Charges Paid (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={actualChargesPaid}
                    onChange={(e) => setActualChargesPaid(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Split equally among {1 + orderToComplete.acceptedParticipants.length} people</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Your Solo Charges Avoided (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={creatorChargesAvoided}
                    onChange={(e) => setCreatorChargesAvoided(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Fees you would have paid alone</span>
                </div>
              </div>

              {/* Participant Details Breakdown */}
              {orderToComplete.acceptedParticipants.map((p) => {
                const uId = p.user._id;
                const currentData = participantInputs[uId] || {};

                return (
                  <div key={uId} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-800 block">
                      {p.user?.name} (Hostel {p.user?.hostel})
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block">Solo Charges Avoided (₹)</label>
                        <input
                          type="number"
                          value={currentData.chargesAvoided ?? 45}
                          onChange={(e) =>
                            setParticipantInputs({
                              ...participantInputs,
                              [uId]: { ...currentData, chargesAvoided: Number(e.target.value) }
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block">Unnecessary Spend Avoided (₹)</label>
                        <input
                          type="number"
                          value={currentData.unnecessarySpendAvoided ?? 0}
                          onChange={(e) =>
                            setParticipantInputs({
                              ...participantInputs,
                              [uId]: { ...currentData, unnecessarySpendAvoided: Number(e.target.value) }
                            })
                          }
                          placeholder="e.g. 195"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOrderToComplete(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition disabled:opacity-50"
                >
                  {completing ? 'Calculating...' : 'Confirm Order & Save Savings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
