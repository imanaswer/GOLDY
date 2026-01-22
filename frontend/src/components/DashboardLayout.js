import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  FileText, 
  Users, 
  Wallet, 
  CalendarCheck, 
  BarChart3,
  Settings,
  LogOut,
  History,
  ShoppingCart
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/jobcards', icon: ClipboardList, label: 'Job Cards' },
  { path: '/invoices', icon: FileText, label: 'Invoices' },
  { path: '/parties', icon: Users, label: 'Parties' },
  { path: '/purchases', icon: ShoppingCart, label: 'Purchases' },
  { path: '/finance', icon: Wallet, label: 'Finance' },
  { path: '/daily-closing', icon: CalendarCheck, label: 'Daily Closing' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/audit-logs', icon: History, label: 'Audit Logs' },
  { path: '/settings', icon: Settings, label: 'Settings' }
];

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col">
        <div className="p-6 border-b border-primary-hover">
          <h1 className="text-2xl font-serif font-semibold">Gold Shop ERP</h1>
          <p className="text-xs mt-1 opacity-80 font-mono">The Artisan Ledger</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : 'hover:bg-primary-hover'
                }`
              }
            >
              <item.icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-hover">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.full_name}</div>
              <div className="text-xs opacity-70 uppercase font-mono">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            data-testid="logout-button"
            className="w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-primary-hover transition-all text-sm"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
