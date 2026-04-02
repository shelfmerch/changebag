import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Shield, Package, Award, Building2, LayoutDashboard, ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import existing dashboards as components
import ClaimerDashboard from './ClaimerDashboard';
import SponsorDashboard from './SponsorDashboard';

const UnifiedDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Default view is claimer
  const view = searchParams.get('view') || 'claimer';

  const setView = (newView: string) => {
    setSearchParams({ view: newView });
    setSidebarOpen(false);
  };

  const navItems = [
    {
      id: 'claimer',
      label: 'User Dashboard',
      icon: <Package className="w-5 h-5" />,
      description: 'Manage your totes and waitlists'
    },
    {
      id: 'sponsor',
      label: 'Sponsor Dashboard',
      icon: <Award className="w-5 h-5" />,
      description: 'Track your sponsorship impact'
    }
  ];

  return (
    <Layout>
      <div className="pt-16 min-h-screen bg-gray-50 flex overflow-hidden">
        {/* Mobile Sidebar Trigger */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-green-600 text-white rounded-full shadow-2xl md:hidden hover:bg-green-700 transition-all active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 pt-20 md:pt-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Dashboard Menu</h2>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={cn(
                    "w-full flex items-center p-4 rounded-xl transition-all duration-200 group text-left",
                    view === item.id 
                      ? "bg-green-50 text-green-700 shadow-sm" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className={cn(
                    "p-2.5 rounded-lg mr-4 transition-colors",
                    view === item.id ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                  )}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className="text-[11px] opacity-70 font-medium">{item.description}</div>
                  </div>
                  {view === item.id && <ChevronRight className="w-4 h-4 ml-2" />}
                </button>
              ))}
            </nav>

            {user?.role === 'admin' && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Admin Only</h2>
                <Link
                  to="/admin/analytics"
                  className="w-full flex items-center p-4 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
                >
                  <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 mr-4 group-hover:bg-indigo-100">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm">System Admin</div>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto w-full min-w-0">
          <div className="p-0 md:p-2 lg:p-4">
            {view === 'claimer' ? (
              <ClaimerDashboard isNested={true} />
            ) : (
              <SponsorDashboard isNested={true} />
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default UnifiedDashboard;
