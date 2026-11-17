import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ShoppingBag,
  Clock,
  IndianRupee,
  MapPin,
  Timer,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';

const PLATFORMS = ['Blinkit', 'Zepto', 'Swiggy Instamart', 'Flipkart Minutes', 'Other'];
const TIME_PRESETS = [
  'Ordering in 5 minutes',
  'Ordering in 10 minutes',
  'Ordering in 15 minutes',
  'Custom'
];
const DURATION_PRESETS = [30, 50, 60];

export const CreateOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [platform, setPlatform] = useState('Blinkit');
  const [targetAmountNeeded, setTargetAmountNeeded] = useState('');
  const [timePreset, setTimePreset] = useState('Ordering in 10 minutes');
  const [customTime, setCustomTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [notes, setNotes] = useState('');
  const [shareLocation, setShareLocation] = useState(true);
  const [userCoords, setUserCoords] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle browser geolocation permission
  const handleLocationToggle = () => {
    if (!shareLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
            setShareLocation(true);
          },
          (err) => {
            console.warn('Geolocation denied or unavailable:', err.message);
            setShareLocation(false);
          }
        );
      }
    } else {
      setShareLocation(false);
      setUserCoords(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const plannedOrderTime = timePreset === 'Custom' ? customTime : timePreset;

    if (!targetAmountNeeded || Number(targetAmountNeeded) <= 0) {
      return setError('Please enter the amount still needed to reach free delivery');
    }

    if (!plannedOrderTime) {
      return setError('Please specify when you plan to place the order');
    }

    setLoading(true);

    try {
      const res = await api.createOrder({
        platform,
        targetAmountNeeded: Number(targetAmountNeeded),
        plannedOrderTime,
        visibilityDurationMinutes: Number(durationMinutes),
        coordinates: shareLocation ? userCoords : null,
        notes
      });

      if (res.success) {
        setSuccess('Order invitation published successfully!');
        setTimeout(() => {
          navigate('/active-orders');
        }, 1200);
      } else {
        setError(res.message || 'Failed to publish order');
      }
    } catch (err) {
      setError('Network error while publishing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Order Invitation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish your upcoming quick-commerce cart so nearby students can join before you checkout.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        {/* Step 1: Platform Selection */}
        <div>
          <label className="block font-bold text-slate-800 mb-2">1. Select Quick-Commerce Platform</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PLATFORMS.map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => setPlatform(plat)}
                className={`py-3 px-4 rounded-xl border font-semibold text-center transition ${
                  platform === plat
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Target Amount Needed */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            2. Amount Still Needed for Free Delivery / Threshold
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            Example: If your cart needs ₹115 more to avoid the ₹25 small-cart fee, enter 115.
          </p>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
            <input
              type="number"
              required
              min={1}
              placeholder="e.g. 115"
              value={targetAmountNeeded}
              onChange={(e) => setTargetAmountNeeded(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Step 3: Planned Ordering Time */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">3. Planned Ordering Time</label>
          <p className="text-[11px] text-slate-500 mb-2">
            When do you plan to hit place order on {platform}?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
            {TIME_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimePreset(t)}
                className={`py-2 px-3 rounded-xl border text-center transition ${
                  timePreset === t
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {timePreset === 'Custom' && (
            <input
              type="text"
              placeholder="e.g. Exactly at 11:30 PM"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full mt-2 px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          )}
        </div>

        {/* Step 4: Visibility Duration */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-800">4. Invitation Visibility Duration</label>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {durationMinutes} minutes
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            The post will remain visible in Active Orders for this long before automatically expiring.
          </p>
          <div className="flex items-center gap-2">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurationMinutes(d)}
                className={`flex-1 py-2 rounded-xl border font-semibold text-center transition ${
                  durationMinutes === d
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                {d} mins
              </button>
            ))}
          </div>
        </div>

        {/* Step 5: Hostel & Location */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">Hostel {user?.hostel} ({user?.hostelCategory})</span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              Prefilled from Profile
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Orders from your hostel will be shown first to your wingmates. We never expose private room numbers publicly without your consent.
          </p>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Special Notes / Wing Drop Location (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Meet at Hostel Gate / Ground floor lobby"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Publishing Order...' : 'Publish Order Invitation'}</span>
        </button>
      </form>
    </div>
  );
};
