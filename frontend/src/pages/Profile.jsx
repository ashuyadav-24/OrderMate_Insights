import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserCircle,
  ShieldCheck,
  PiggyBank,
  Package,
  Users,
  Clock,
  Sparkles,
  MapPin
} from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  const stats = user.stats || {};
  const platformSavings = stats.platformSavings || {};

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Your campus identity, registered hostel wing, and verified OrderMate track record.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
          alt={user.name}
          className="w-24 h-24 rounded-3xl bg-slate-100 border-2 border-emerald-500/20 shadow-inner"
        />

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">{user.name}</h2>
            <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Hostel {user.hostel}
            </span>
          </div>

          <p className="text-xs text-slate-500">{user.email}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{user.hostelCategory}</span>
            </span>
            {user.block && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.block}</span>
              </span>
            )}
            {user.room && (
              <span className="text-slate-400">Room {user.room}</span>
            )}
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Confirmed Savings</span>
          <span className="text-2xl font-black text-emerald-700">₹{stats.totalConfirmedSavings || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Orders Created</span>
          <span className="text-2xl font-black text-slate-800">{stats.ordersCreated || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Orders Joined</span>
          <span className="text-2xl font-black text-slate-800">{stats.ordersJoined || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Completed Orders</span>
          <span className="text-2xl font-black text-teal-700">{stats.completedOrders || 0}</span>
        </div>
      </div>

      {/* Platform-wise Savings Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Platform Savings Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(platformSavings).map(([platform, amount]) => (
            <div key={platform} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-semibold text-slate-600 block mb-0.5">{platform}</span>
              <span className="text-base font-black text-emerald-700">₹{amount || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
