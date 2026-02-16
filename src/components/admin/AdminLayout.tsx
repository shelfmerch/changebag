
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Files, 
  CheckCircle, 
  Image, 
  Package, 
  Truck, 
  MapPin,
  BarChart2, 
  Settings, 
  LogOut,
  Users,
  QrCode
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../Layout';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  loading?: boolean;
}

const AdminLayout = ({ children, title, subtitle, loading = false }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      setIsLoading(false);
    }
  }, [user, navigate]);

  if (isLoading) {
    return null;
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/admin' },
    { icon: Files, label: 'Causes Management', path: '/admin/causes' },
    { icon: CheckCircle, label: 'Campaign Approvals', path: '/admin/approvals' },
    { icon: Image, label: 'Logo Review', path: '/admin/logos' },
    { icon: Package, label: 'Claims Management', path: '/admin/claims' },
    { icon: Package, label: 'Partner Claims', path: '/admin/partner-claims' },
    { icon: QrCode, label: 'QR Code Claims', path: '/admin/qr-claims' },
    { icon: Users, label: 'Waitlist Management', path: '/admin/waitlist' },
    { icon: MapPin, label: 'Distribution Settings', path: '/admin/distribution-settings' },
    { icon: Truck, label: 'Shipping', path: '/admin/shipping' },
    { icon: BarChart2, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (

    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center px-2">
              <h2 className="text-lg font-bold">Admin Portal</h2>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton 
                        onClick={() => navigate(item.path)} 
                        tooltip={item.label}
                        isActive={location.pathname === item.path}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        
      <SidebarInset className="flex flex-col overflow-auto">
      
      
          <header className="sticky top-0 z-10 bg-background border-b p-4 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold">{title}</h1>
                  {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 mr-2">
                {user?.name} (Admin)
              </span>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner className="h-8 w-8" />
                <span className="ml-2">Loading...</span>
              </div>
            ) : (
              children
            )}
          </main>
          
        </SidebarInset>
      </div>
    </SidebarProvider>
    
  );
};

export default AdminLayout;
