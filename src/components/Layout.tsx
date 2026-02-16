
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ShoppingBag, Menu, X, Home, Heart, Plus, Users, Target, Building } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-green-600 bg-green-50 border-b-2 border-green-600' : 'text-gray-700 hover:text-green-600';
  };

  const isActiveMobile = (path: string) => {
    return location.pathname === path ? 'text-green-600 bg-green-50' : 'text-gray-700';
  };

  // Navigation items for mobile menu
  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/causes', label: 'Causes', icon: Heart },
    { path: '/create-cause', label: 'Create a Cause', icon: Plus },
    { path: '/why-sponsor', label: 'Why Sponsor?', icon: Users },
    { path: '/why-claim', label: 'Why Claim?', icon: Target },
    { path: '/csr', label: 'CSR', icon: Building },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Enhanced Logo */}
            <Link to="/" className="flex items-center group">
              <div className="relative">
                {/* <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"> */}
                <div className="flex text-green-600 items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-brand-primary" strokeWidth={2} />
                </div>
                {/* <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div> */}
              </div>
              <div className="ml-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  ChangeBag
                </span>
                <div className="text-xs text-gray-500 font-medium">Brand For Good</div>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/" 
                className={`${isActive('/')} px-4 py-2 font-medium transition-all duration-200 hover:border-b-2 hover:border-green-600`}
              >
                Home
              </Link>
              <Link 
                to="/causes" 
                className={`${isActive('/causes')} px-4 py-2 font-medium transition-all duration-200 hover:border-b-2 hover:border-green-500`}
              >
                Causes
              </Link>
              <Link 
                to="/create-cause" 
                className={`${isActive('/create-cause')} px-4 py-2 font-medium transition-all duration-200 hover:border-b-2 hover:border-green-500`}
              >
                Create a Cause
              </Link>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <Link 
                to="/why-sponsor" 
                className={`${isActive('/why-sponsor')} px-4 py-2 font-medium transition-all duration-200 hover:border-b-2 hover:border-green-500`}
              >
                Why Sponsor?
              </Link>
              <Link 
                to="/why-claim" 
                className={`${isActive('/why-claim')} px-4 py-2 font-medium transition-all duration-200 hover:border-b-2 hover:border-green-500`}
              >
                Why Claim?
              </Link>
              <Link
                to="/csr"
                className={`${isActive('/csr')} px-4 py-2 font-medium transition-all duration-200 hover:border-b-2 hover:border-green-500`}
              >
                CSR
              </Link>
            </nav>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="hover:bg-gray-100 p-2"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetHeader className="p-6 pb-0">
                    <div className="flex items-center">
                      <div className="flex text-green-600 items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-brand-primary" strokeWidth={2} />
                      </div>
                      <div className="ml-3">
                        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          ChangeBag
                        </span>
                        <div className="text-xs text-gray-500 font-medium">Brand For Good</div>
                      </div>
                    </div>
                  </SheetHeader>
                  
                  <div className="px-6 py-6">
                    <nav className="space-y-2">
                      {navigationItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <SheetClose asChild key={item.path}>
                            <Link
                              to={item.path}
                              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 ${isActiveMobile(item.path)}`}
                            >
                              <IconComponent className="h-6 w-6" />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </nav>

                    {/* Mobile User Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      {user ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 px-4 py-3">
                            <Avatar className="h-10 w-10 ring-2 ring-green-100">
                              <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                            </div>
                          </div>
                          
                          <SheetClose asChild>
                            <Link
                              to={`/dashboard/${user.role}`}
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 text-gray-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <span className="font-medium">Dashboard</span>
                            </Link>
                          </SheetClose>
                          
                          <button
                            onClick={logout}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-50 text-red-600 w-full"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      ) : (
                        <SheetClose asChild>
                          <Button 
                            onClick={() => navigate('/login')} 
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-medium"
                          >
                            Log In / Sign Up
                          </Button>
                        </SheetClose>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Enhanced User Section - Desktop Only */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-all duration-200">
                      <Avatar className="h-10 w-10 ring-2 ring-green-100 hover:ring-green-200 transition-all duration-200">
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => navigate(`/dashboard/${user.role}`)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={logout}
                      className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => navigate('/login')} 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Log In / Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 max-w-7xl mx-auto">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-bold text-white">ChangeBag</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Empowering brands to drive real change through thoughtful partnerships and sustainable impact.
              </p>
              <div className="flex space-x-4">
                <a href="https://x.com/home" className="text-gray-400 hover:text-green-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/" className="text-gray-400 hover:text-green-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/feed/" className="text-gray-400 hover:text-green-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className='sm:col-span-2 flex justify-between lg:justify-around'>
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-300 hover:text-green-400 transition-colors">Home</Link></li>
                <li><Link to="/causes" className="text-gray-300 hover:text-green-400 transition-colors">Browse Causes</Link></li>
                <li><Link to="/create-cause" className="text-gray-300 hover:text-green-400 transition-colors">Create a Cause</Link></li>
                <li><Link to="/causes" className="text-gray-300 hover:text-green-400 transition-colors">Become a Sponsor</Link></li>
                <li><Link to="/why-sponsor" className="text-gray-300 hover:text-green-400 transition-colors">Why Sponsor?</Link></li>
                <li><Link to="/why-claim" className="text-gray-300 hover:text-green-400 transition-colors">Why Claim?</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-3">
                <li><Link to="/help-center" className="text-gray-300 hover:text-green-400 transition-colors">Help Center</Link></li>
                <li><Link to="/privacy-policy" className="text-gray-300 hover:text-green-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-gray-300 hover:text-green-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookie-policy" className="text-gray-300 hover:text-green-400 transition-colors">Cookie Policy</Link></li>
                <li><Link to="/accessibility" className="text-gray-300 hover:text-green-400 transition-colors">Accessibility</Link></li>
              </ul>
            </div>
            </div>

            {/* Contact & Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contact & Support</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {/* <div>
                    <a href='mailto:support@changebag.org' className="text-green-400 font-medium">support@changebag.org</a>
                    <p className="text-sm text-gray-300">We typically respond within 24 hours</p>
                  </div> */}
                  <div>
  <a
    href="https://mail.google.com/mail/?view=cm&fs=1&to=support%40changebag.org&su=support%20request&body=Hi%20team%2C%0A"
    target="_blank"
    rel="noopener noreferrer"
    className="text-green-400 font-medium"
  >
    support@changebag.org
  </a>
  <p className="text-sm text-gray-300">We typically respond within 24 hours</p>
</div>

                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-300">Mon-Fri: 9AM-6PM EST</p>
                    <p className="text-sm text-gray-300">Weekend support available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Changebag. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm lg:text-md lg:px-3 lg:py-1.5 sm:text-xs sm:px-1">Made with ❤️ for change</span>
                <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">100% Carbon Neutral</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
