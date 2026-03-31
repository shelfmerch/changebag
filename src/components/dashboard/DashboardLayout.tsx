
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <Layout>
      <div className="pt-20 min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 tracking-tight">{title}</h1>
              {subtitle && <p className="text-lg text-gray-500 mt-2 font-medium">{subtitle}</p>}
            </div>
            {/* <Button variant="outline" onClick={() => logout()} className="border-gray-200 hover:bg-white hover:text-red-600 transition-all">
              Sign Out
            </Button> */}
          </div>

          <main className="pb-16">
            {children}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardLayout;
