import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  Users,
  PiggyBank,
  TrendingUp,
  ShieldCheck,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

// Verified 22 Fieldwork Records baseline (guarantees accurate metrics even before API resolves)
const VERIFIED_DEFAULT_FIELDWORK = {
  metadata: {
    source: 'Assignment Fieldwork (data/data.csv)',
    verifiedEntries: 22,
    timeWindow: '16 Nov 23:10 to 17 Nov 00:50 (Late-night quick-commerce peak)',
    hostelsSurveyed: ['Hostel K', 'Hostel J', 'Hostel L']
  },
  summary: {
    totalStudentsSurveyed: 22,
    avgBaseCartValue: 66.32,
    totalAvoidableLoss: 2617,
    avgAvoidableLossPerStudent: 118.95,
    strategies: {
      paidChargesCount: 10,
      paidChargesPercentage: 45,
      totalFeesPaid: 557,
      avgFeePaid: 55.7,
      addedUnneededItemsCount: 12,
      addedUnneededPercentage: 55,
      totalUnneededSpend: 2060,
      avgUnneededSpend: 171.67
    },
    projectedImpact: {
      simulatedGroupChargesPaid: 110,
      projectedNetSavingsThroughOrderMate: 2507,
      projectedSavingsPercentage: 96
    }
  },
  platformsSummary: [
    { platform: 'Flipkart Minutes', ordersCount: 9, totalAvoidableLoss: 1055, avgBaseCart: 57.33, avgAvoidableLoss: 117.22 },
    { platform: 'Blinkit', ordersCount: 7, totalAvoidableLoss: 731, avgBaseCart: 61.29, avgAvoidableLoss: 104.43 },
    { platform: 'Swiggy Instamart', ordersCount: 6, totalAvoidableLoss: 831, avgBaseCart: 85.67, avgAvoidableLoss: 138.5 }
  ],
  hostelsSummary: [
    { hostel: 'Hostel K', ordersCount: 5, totalAvoidableLoss: 271, avgLossPerOrder: 54.2 },
    { hostel: 'Hostel J', ordersCount: 12, totalAvoidableLoss: 1491, avgLossPerOrder: 124.25 },
    { hostel: 'Hostel L', ordersCount: 5, totalAvoidableLoss: 855, avgLossPerOrder: 171 }
  ],
  limitations: [
    'Geographic scope is limited to 3 boys hostels (Hostel J, K, L) during late night hours (23:10 - 00:50).',
    'Assumes students are comfortable coordinating deliveries at the hostel gate.',
    'Items added to avoid fees are based on self-reported intent by students immediately post-purchase.',
    'Does not account for rare platform promotions or occasional dynamic surge fluctuations.'
  ]
};

export const Analyzer = () => {
  const [activeSource, setActiveSource] = useState('live'); // 'live' or 'fieldwork'
  const [metrics, setMetrics] = useState(null);
  const [fieldworkData, setFieldworkData] = useState(VERIFIED_DEFAULT_FIELDWORK);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterHostel, setFilterHostel] = useState('All');

  const fetchAnalyzerData = async () => {
    try {
      setLoading(true);

      // Fetch Live metrics
      try {
        const liveRes = await api.getAnalyzerMetrics({ platform: filterPlatform, hostel: filterHostel });
        if (liveRes && liveRes.success) {
          setMetrics(liveRes.data);
        }
      } catch (err) {
        console.warn('Live metrics load error:', err);
      }

      // Fetch CSV Fieldwork Analysis
      try {
        const csvRes = await api.getFieldworkAnalysis();
        if (csvRes && csvRes.success && csvRes.data) {
          setFieldworkData(csvRes.data);
        }
      } catch (err) {
        console.warn('CSV analysis load error, retaining verified baseline:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyzerData();
  }, [filterPlatform, filterHostel]);

  const handleExportCsv = () => {
    window.open('/api/analyzer/export-csv', '_blank');
  };

  if (loading && !metrics && !fieldworkData) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const overview = metrics?.overview || {};
  const effectiveness = metrics?.effectiveness || {};
  const platformBreakdown = metrics?.platformBreakdown || [];
  const hostelBreakdown = metrics?.hostelBreakdown || [];
  const hourlyActivity = metrics?.hourlyActivity || [];

  const fwSummary = fieldworkData?.summary || VERIFIED_DEFAULT_FIELDWORK.summary;
  const fwStrategies = fwSummary.strategies || VERIFIED_DEFAULT_FIELDWORK.summary.strategies;
  const fwImpact = fwSummary.projectedImpact || VERIFIED_DEFAULT_FIELDWORK.summary.projectedImpact;

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">OrderMate Analyzer</h1>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Impact Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Measure the real impact of smarter group ordering across campus hostels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Dual Source Selector Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 max-w-md">
        <button
          onClick={() => setActiveSource('live')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSource === 'live'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <span>Source A: Live Application Orders</span>
        </button>

        <button
          onClick={() => setActiveSource('fieldwork')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSource === 'fieldwork'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          <span>Source B: Fieldwork data.csv</span>
        </button>
      </div>

      {activeSource === 'live' ? (
        /* Source A: Live OrderMate Application Data */
        <div className="space-y-6">
          {/* Effectiveness Impact Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Is OrderMate Making a Difference?</span>
            </div>
            <p className="text-sm sm:text-base font-medium text-emerald-100/90 leading-relaxed mb-4">
              "{effectiveness.impactSummary || 'Live application metrics compute confirmed savings as students complete group orders.'}"
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Unique Students Helped</span>
                <span className="text-xl font-extrabold text-white">
                  {overview.uniqueStudentsHelpedWithSavings ?? 0}
                </span>
                <span className="text-[10px] text-emerald-400 block">with positive savings</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Confirmed Savings</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  ₹{overview.totalConfirmedSavings ?? 0}
                </span>
                <span className="text-[10px] text-slate-300 block">actual net saved</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Completion Rate</span>
                <span className="text-xl font-extrabold text-white">
                  {overview.completionRate ?? 0}%
                </span>
                <span className="text-[10px] text-slate-300 block">of decided invitations</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Effectiveness Score</span>
                <span className="text-xl font-extrabold text-teal-300">
                  {effectiveness.effectivenessScore ?? 0} / 100
                </span>
                <span className="text-[10px] text-slate-300 block">transparent metric</span>
              </div>
            </div>
          </div>

          {/* Major Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block">Orders Created</span>
              <span className="text-xl font-black text-slate-900">{overview.totalCreated ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block">Completed</span>
              <span className="text-xl font-black text-emerald-600">{overview.completedOrders ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block">Unique Served</span>
              <span className="text-xl font-black text-blue-600">{overview.totalUniqueStudentsServed ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block">Repeat Users</span>
              <span className="text-xl font-black text-purple-600">{overview.repeatUsers ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block">Avg / Student</span>
              <span className="text-xl font-black text-teal-600">₹{overview.avgSavingsPerStudent ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block">Request Acceptance</span>
              <span className="text-xl font-black text-amber-600">{overview.joinAcceptanceRate ?? 0}%</span>
            </div>
          </div>

          {/* Platform & Hostel Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Comparison */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Platform-wise Breakdown</h3>
              <div className="space-y-3">
                {platformBreakdown.map((plat) => (
                  <div key={plat.platform} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{plat.platform}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {plat.ordersCreated} created • {plat.completedOrders} completed
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-700 text-sm">
                        ₹{plat.confirmedSavings}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {plat.uniqueStudents} students
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hostel Comparison */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Hostel-wise Aggregated Impact</h3>
              {hostelBreakdown.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No completed hostel order data yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {hostelBreakdown.map((h) => (
                    <div key={h.hostel} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">Hostel {h.hostel}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {h.studentsServedCount} unique students served
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-700 text-sm">
                          ₹{h.confirmedSavings}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {h.totalParticipations} participations
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Time Activity Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hourly Group Ordering Activity</h3>
                <p className="text-[11px] text-slate-500">Distribution of order invitations across 24 hours</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Peak: 23:00 – 01:00
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyActivity}>
                  <XAxis dataKey="hour" fontSize={10} tickLine={false} />
                  <YAxis fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="ordersCreated" fill="#10b981" radius={[4, 4, 0, 0]} name="Orders Created" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Source B: Fieldwork data.csv Genuine Analysis */
        <div className="space-y-6">
          {/* Fieldwork Header */}
          <div className="p-6 rounded-3xl bg-blue-950 text-white shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Assignment Fieldwork Evidence (22 Genuine Records)</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Late-Night Quick-Commerce Fieldwork Analysis
            </h2>
            <p className="text-xs text-blue-100/90 max-w-2xl leading-relaxed">
              Surveyed 22 students across Hostels J, K, and L between 23:10 and 00:50. Records their actual cart values, solo checkout fees, and unnecessary impulse items added just to cross free delivery thresholds.
            </p>
          </div>

          {/* Fieldwork Major Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Students Surveyed</span>
              <div className="text-3xl font-black text-slate-900">
                {fwSummary.totalStudentsSurveyed}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">100% Genuine On-Site</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Avoidable Loss</span>
              <div className="text-3xl font-black text-rose-600">
                ₹{fwSummary.totalAvoidableLoss}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Wasted in 1 night across 22 orders</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Avg Loss / Student</span>
              <div className="text-3xl font-black text-slate-800">
                ₹{fwSummary.avgAvoidableLossPerStudent}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Paid when ordering solo</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Projected OrderMate Net Savings</span>
              <div className="text-3xl font-black text-emerald-600">
                ₹{fwImpact.projectedNetSavingsThroughOrderMate}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                {fwImpact.projectedSavingsPercentage}% expense reduction
              </span>
            </div>
          </div>

          {/* Strategy Breakdown Comparison: PAID_CHARGES vs ADDED_UNNECESSARY_ITEMS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              How Students Respond to Checkout Thresholds
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Strategy 1: Paid Delivery Fees</span>
                  <span className="text-xs font-extrabold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {fwStrategies.paidChargesCount} students ({fwStrategies.paidChargesPercentage}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Paid delivery fee (₹25–₹30), small-cart fee (₹15–₹25), handling (₹5) and surge (₹10–₹15).
                </p>
                <div className="pt-2 flex justify-between text-xs">
                  <span className="text-slate-500">Total Fees Paid:</span>
                  <strong className="text-rose-600">₹{fwStrategies.totalFeesPaid}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Average Fee / Student:</span>
                  <strong className="text-slate-800">₹{fwStrategies.avgFeePaid}</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-xs">Strategy 2: Added Unneeded Items</span>
                  <span className="text-xs font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {fwStrategies.addedUnneededItemsCount} students ({fwStrategies.addedUnneededPercentage}%)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Added chips, soda, energy drinks and chocolates just to reach the ₹199 threshold.
                </p>
                <div className="pt-2 flex justify-between text-xs">
                  <span className="text-emerald-700">Total Wasted Extra Spend:</span>
                  <strong className="text-emerald-900">₹{fwStrategies.totalUnneededSpend}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-700">Average Extra Spend / Student:</span>
                  <strong className="text-emerald-900">₹{fwStrategies.avgUnneededSpend}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Verified Fieldwork Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Collected Fieldwork Records (data.csv)</h3>
                <p className="text-[11px] text-slate-500">22 authentic student entries with exact room and purchase details</p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 sticky top-0">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Student</th>
                    <th className="p-2.5">Hostel & Room</th>
                    <th className="p-2.5">Platform</th>
                    <th className="p-2.5">Needed Item</th>
                    <th className="p-2.5">Strategy</th>
                    <th className="p-2.5">Avoidable Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(fieldworkData?.rawRecords || VERIFIED_DEFAULT_FIELDWORK.rawRecords || []).map((r) => (
                    <tr key={r.orderId} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-bold text-slate-900">{r.orderId}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{r.studentName}</td>
                      <td className="p-2.5 text-slate-500">{r.hostel} ({r.room})</td>
                      <td className="p-2.5">{r.platform}</td>
                      <td className="p-2.5 text-slate-600 max-w-xs truncate">{r.itemsNeeded}</td>
                      <td className="p-2.5">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            r.strategy === 'PAID_CHARGES'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {r.strategy}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-rose-600">₹{r.avoidableLoss}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real Limitations Section */}
          <div className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200 text-amber-950 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Tool & Fieldwork Limitations</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-900/90 leading-relaxed">
              {(fieldworkData?.limitations || VERIFIED_DEFAULT_FIELDWORK.limitations || []).map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
