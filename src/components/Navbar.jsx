import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import styles from './Navbar.module.css'

const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V8" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
    <rect x="3" y="8" width="18" height="15" rx="3" fill="#10b981" />
    <path d="M9 13C9 13 10 15 12 15C14 15 15 13 15 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const mainLinks = [
    { to: '/', label: 'Home' },
    { to: '/causes', label: 'Causes' },
    { to: '/brands', label: 'For Brands' },
    { to: '/ngos', label: 'For NGOs' },
    { to: '/impact', label: 'Impact' },
    { to: '/pricing', label: 'Pricing' },
    
    // { to: '/create-cause', label: 'Create a Cause' },
  ];

  // const subLinks = [
  //   { to: '/why-sponsor', label: 'Why Sponsor?' },
  //   // { to: '/why-claim', label: 'Why Claim?' },
  //   { to: '/csr', label: 'CSR' },
  // ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <LogoIcon />
          <div className={styles.logoText}>
            <span className={styles.logoMain}>ChangeBag</span>
            <span className={styles.logoSub}>Brand For Good</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className={`${styles.menu} ${menuOpen ? styles.open : ''}`}>
          <ul className={styles.links}>
            {mainLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className={`${styles.link} ${pathname === to ? styles.active : ''}`}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className={styles.separator} />

          {/* <ul className={styles.links}>
            {subLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className={`${styles.link} ${pathname === to ? styles.active : ''}`}>
                  {label}
                </Link>
              </li>
            ))}
          </ul> */}
        </div>

        <div className={styles.right}>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors">
                  <span className="hidden md:block text-sm font-semibold text-gray-700">{user.name}</span>
                  <Avatar className="h-9 w-9 border-2 border-green-100 hover:border-green-200 transition-all cursor-pointer">
                    <AvatarFallback className="bg-green-600 text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-3 mt-2 shadow-xl border-gray-200">
                <div className="px-2 py-2 mb-2">
                  <p className="text-base font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize font-medium">{user.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/dashboard/${user.role}`)} className="cursor-pointer py-3 text-sm font-medium">
                  Dashboard
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin/causes')} className="cursor-pointer py-3 text-sm font-medium">
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-3 text-sm font-semibold text-red-600 focus:text-red-600 focus:bg-red-50">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className={styles.cta}>
              Login/Sign Up
            </Link>
          )}
          
          <button
            className={styles.burger}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
