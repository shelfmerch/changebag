
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import MetricsCards from '@/components/admin/dashboard/MetricsCards';
import DashboardTabs from '@/components/admin/dashboard/DashboardTabs';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600';
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <AdminLayout 
      title="Admin Dashboard" 
      subtitle="Manage campaigns, claims, and system analytics"
    > 
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2" 
          onClick={handleBackToHome}
        >
          <Home size={16} />
          Back to Home
        </Button>
      </div>
      <MetricsCards />
      <hr className="my-6" />
      <DashboardTabs />
    </AdminLayout>
  );
};

export default AdminDashboard;
