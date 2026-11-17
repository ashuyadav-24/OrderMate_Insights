import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  PlusCircle,
  PackageCheck,
  MessageSquare,
  PiggyBank,
  BarChart3,
  Sparkles,
  UserCircle
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/active-orders', label: 'Active Orders', icon: Compass },
  { to: '/create-order', label: 'Create Order', icon: PlusCircle },
  { to: '/recommendations', label: 'For You', icon: Sparkles, badge: 'Smart' },
  { to: '/my-orders', label: 'My Orders', icon: PackageCheck },
  { to: '/savings', label: 'My Savings', icon: PiggyBank },
  { to: '/analyzer', label: 'OrderMate Analyzer', icon: BarChart3, badge: 'Impact' },
  { to: '/profile', label: 'Profile', icon: UserCircle }
];

export const Sidebar = () => {
  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="sticky top-20 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick CTA Card */}
        <div className="pt-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
            <h4 className="text-xs font-bold text-emerald-950 mb-1">Planning a Quick Order?</h4>
            <p className="text-[11px] text-slate-600 mb-3">
              Avoid ₹50+ in solo fees by sharing your cart with hostel mates.
            </p>
            <NavLink
              to="/create-order"
              className="inline-flex items-center justify-center w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
            >
              + Publish Invitation
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
};
