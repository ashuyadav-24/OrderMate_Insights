import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  PiggyBank,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  IndianRupee,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const Savings = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const res = await api.getMySavings();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching savings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSavings();
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

  const totalConfirmed = data?.totalConfirmedSavings || 0;
  const totalAvoidedFees = data?.totalChargesAvoided || 0;
  const totalCombinedFeesPaid = data?.totalCombinedChargesPaid || 0;
  const totalUnneededSpendAvoided = data?.totalUnnecessarySpendAvoided || 0;
  const completedOrders = data?.completedOrdersCount || 0;
  const avgSavings = data?.avgSavingsPerOrder || 0;
  const platformSavings = data?.platformSavings || {};
  const history = data?.history || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Confirmed Savings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Auditable personal breakdown of actual delivery charges avoided and impulse cart waste saved.
        </p>
      </div>

      {/* Hero Savings Card */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block mb-1">
              Total Verified Net Savings
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
              ₹{totalConfirmed}
            </div>
            <p className="text-xs text-emerald-100/90 max-w-lg leading-relaxed">
              Calculated using the strict formula: <span className="font-semibold text-white">Charges Avoided - Fair Share of Combined Delivery</span>. Does not inflate numbers by assuming cart threshold is a saving.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-emerald-200">Completed Orders</span>
              <span className="font-bold text-white">{completedOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-200">Avg Savings / Order</span>
              <span className="font-bold text-white">₹{avgSavings}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/10">
              <span className="text-emerald-200">Impulse Waste Saved</span>
              <span className="font-bold text-emerald-300">₹{totalUnneededSpendAvoided}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Solo Delivery & Cart Fees Avoided</span>
          <div className="text-2xl font-black text-slate-800">₹{totalAvoidedFees}</div>
          <p className="text-[11px] text-slate-400 mt-1">Delivery fees + small cart surcharges avoided</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Your Split of Group Charges</span>
          <div className="text-2xl font-black text-slate-800">₹{totalCombinedFeesPaid}</div>
          <p className="text-[11px] text-slate-400 mt-1">Nominal fee paid across combined orders</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Unneeded Items Not Bought</span>
          <div className="text-2xl font-black text-emerald-700">₹{totalUnneededSpendAvoided}</div>
          <p className="text-[11px] text-slate-400 mt-1">Extra junk/snacks avoided to hit thresholds</p>
        </div>
      </div>

      {/* Platform-wise Savings */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Platform-Wise Verified Savings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(platformSavings).map(([plat, amt]) => (
            <div key={plat} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-700 block mb-1">{plat}</span>
              <span className="text-lg font-black text-emerald-700">₹{amt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Audit History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Savings Audit History</h3>
        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No completed savings records yet. Once you complete a group order, verified savings will be recorded here.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((record) => (
              <div key={record._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{record.platform}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {record.order?.orderCode || 'Group Order'}
                    </span>
                    <span className="text-[10px] text-slate-400">{record.role}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Avoided ₹{record.individualChargesAvoided} fees - ₹{record.individualShareOfCombinedCharges} share paid
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-emerald-700 block">
                    +₹{record.confirmedSavings}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
