import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ShoppingBag, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [categories, setCategories] = useState(['Boys Hostel', 'Girls Hostel']);
  const [hostelOptions, setHostelOptions] = useState({
    'Boys Hostel': ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    'Girls Hostel': ['A', 'B', 'C', 'D', 'M']
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    hostelCategory: 'Boys Hostel',
    hostel: 'K',
    block: '',
    room: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch centralized hostel configuration
    const fetchHostels = async () => {
      try {
        const res = await api.getHostelsConfig();
        if (res.success && res.data.HOSTELS) {
          setHostelOptions(res.data.HOSTELS);
          const firstCat = Object.keys(res.data.HOSTELS)[0];
          setFormData((prev) => ({
            ...prev,
            hostelCategory: firstCat,
            hostel: res.data.HOSTELS[firstCat][0]
          }));
        }
      } catch (err) {
        console.error('Error fetching hostel options:', err);
      }
    };
    fetchHostels();
  }, []);

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    const available = hostelOptions[newCat] || [];
    setFormData({
      ...formData,
      hostelCategory: newCat,
      hostel: available[0] || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.register(formData);
      if (res.success) {
        login(res.token, res.user);
        navigate('/');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 items-center justify-center mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Join OrderMate</h1>
          <p className="text-xs text-slate-500 mt-1">
            Group orders with students in your hostel and save together
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Aman Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Campus / Personal Email</label>
            <input
              type="email"
              required
              placeholder="student@college.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Centralized Hostel Category Selection */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hostel Category</label>
              <select
                value={formData.hostelCategory}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500 transition"
              >
                {Object.keys(hostelOptions).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Hostel Options (Strictly bounded to provided hostels) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hostel Name</label>
              <select
                value={formData.hostel}
                onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 transition"
              >
                {(hostelOptions[formData.hostelCategory] || []).map((h) => (
                  <option key={h} value={h}>
                    Hostel {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Block (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Block D"
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room (Optional)</label>
              <input
                type="text"
                placeholder="e.g. D-305"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
