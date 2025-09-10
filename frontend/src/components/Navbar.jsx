import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import ssnLogo from '../assets/images/ssn-logo.png';
import { Button } from './ui/button';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="relative z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to={isAuthenticated() ? "/profiles" : "/"} className="flex items-center gap-3">
          <img src={ssnLogo} alt="SSN Logo" className="h-8 w-8" />
          <span className="text-base font-semibold">Faculty Profiles</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </Button>

          <div className={`fixed inset-x-0 top-16 z-50 border-b bg-background p-4 md:static md:inset-auto md:z-auto md:border-0 md:bg-transparent md:p-0 ${isMenuOpen ? '' : 'hidden md:block'}`} style={{ maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}>
            <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4">
              {!isAuthenticated() && (
                <Link to="/" className="text-sm text-foreground/80 hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Home</Link>
              )}
              <Link to="/profiles" className="text-sm text-foreground/80 hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Faculty</Link>
              {isAuthenticated() ? (
                <>
                  {user?.role === 'MANAGER' && (
                    <Link to="/admin" className="text-sm text-foreground/80 hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FaUser className="opacity-70" />
                      <span className="truncate max-w-[180px]">{user?.name || user?.email}</span>
                    </div>
                    <Button variant="secondary" className="shadow-none" onClick={handleLogout}>
                      <FaSignOutAlt />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button>Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
