import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';

export const Recommendations = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await api.getRecommendations();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const recs = data?.recommendations || [];
  const profile = data?.userProfile || {};
  const isColdStart = data?.isColdStart;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recommended For You</h1>
            <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Smart Matching
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Orders selected by analyzing your hostel, favorite delivery platforms, and order timing.
          </p>
        </div>
      </div>

      {/* User Preference Profile Badge */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            🎯
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Your Campus Order Profile</h4>
            <p className="text-[11px] text-slate-500">
              {isColdStart
                ? 'New student account: Prioritizing your hostel wing & closest orders'
                : `Favorite platform: ${profile.favoritePlatform} • Typical spend: ~₹${profile.typicalSpend}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            Hostel {user?.hostel}
          </span>
          <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800">
            Real-time Scored
          </span>
        </div>
      </div>

      {/* Recommended Orders List */}
      {recs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Compatible Orders Found Right Now</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            No live invitations currently match your hostel or platform profile. You can start one or check general active orders.
          </p>
          <Link
            to="/active-orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-sm"
          >
            <Compass className="w-4 h-4" />
            <span>Browse All Active Orders</span>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recs.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Score & Platform */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800">
                    {order.platform}
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 font-extrabold text-xs border border-purple-200">
                    <Sparkles className="w-3 h-3" />
                    <span>{order.recommendationScore}% Match</span>
                  </div>
                </div>

                {/* Target Amount */}
                <div className="mb-2">
                  <span className="text-xs text-slate-400 font-medium">Needs</span>
                  <div className="text-xl font-black text-slate-900">
                    ₹{order.targetAmountNeeded}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Created by {order.creator?.name} (Hostel {order.hostel})
                  </span>
                </div>

                {/* Reason Explanation Tags */}
                <div className="my-3 space-y-1">
                  {order.reasons?.map((reason, idx) => (
                    <div
                      key={idx}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-2">
                <Link
                  to={`/active-orders?order=${order._id}`}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold text-center transition block shadow-sm"
                >
                  Join This Group Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
