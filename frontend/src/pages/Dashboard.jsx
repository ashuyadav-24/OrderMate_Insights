import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  PlusCircle,
  Compass,
  PiggyBank,
  Package,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Sparkles
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [savingsSummary, setSavingsSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, savingsRes] = await Promise.all([
          api.getActiveOrders(),
          api.getMySavings()
        ]);
        if (ordersRes.success) setActiveOrders(ordersRes.data || []);
        if (savingsRes.success) setSavingsSummary(savingsRes.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSavings = savingsSummary?.totalConfirmedSavings ?? user?.stats?.totalConfirmedSavings ?? 0;
  const ordersCreated = user?.stats?.ordersCreated ?? 0;
  const ordersJoined = user?.stats?.ordersJoined ?? 0;
  const completedOrders = user?.stats?.completedOrders ?? 0;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold mb-3 text-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hostel {user?.hostel} ({user?.hostelCategory})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mb-6">
            Group your quick-commerce orders with friends in Hostel {user?.hostel} and nearby wings. Avoid solo delivery fees and eliminate impulse cart additions.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/create-order"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs shadow-md hover:bg-emerald-50 transition"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Create Order Invitation</span>
            </Link>
            <Link
              to="/active-orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-xs border border-white/10 transition"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Active Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Confirmed Savings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Confirmed Savings</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ₹{totalSavings}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Verified Net Saved</span>
          </p>
        </div>

        {/* Orders Joined */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Orders Joined</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{ordersJoined}</div>
          <p className="text-[11px] text-slate-500 mt-1">Shared carts joined</p>
        </div>

        {/* Orders Created */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Orders Created</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{ordersCreated}</div>
          <p className="text-[11px] text-slate-500 mt-1">Invitations published</p>
        </div>

        {/* Completed Groups */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Completed Orders</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{completedOrders}</div>
          <p className="text-[11px] text-slate-500 mt-1">Successfully fulfilled</p>
        </div>
      </div>

      {/* Nearby Active Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Nearby Active Orders</h2>
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {activeOrders.length} live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Prioritizing Hostel {user?.hostel} followed by nearest campus hostels
            </p>
          </div>
          <Link
            to="/active-orders"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">No Active Orders In Your Wing Right Now</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Be the first to start an order! Post what you need and let nearby students join in.
            </p>
            <Link
              to="/create-order"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish First Invitation</span>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.slice(0, 3).map((order) => (
              <div
                key={order._id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500/50 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800">
                      {order.platform}
                    </span>
                    {order.isSameHostel ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Same Hostel
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500">
                        Hostel {order.hostel} {order.distanceMeters ? `• ~${order.distanceMeters}m` : ''}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Needs ₹{order.targetAmountNeeded} to hit free delivery
                  </h4>
                  <p className="text-xs text-slate-500 mb-2">
                    Creator: <span className="font-semibold text-slate-700">{order.creator?.name}</span>
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.plannedOrderTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.acceptedParticipants?.length || 0} joined</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/active-orders?order=${order._id}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-semibold text-center transition block"
                >
                  View & Request to Join
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
