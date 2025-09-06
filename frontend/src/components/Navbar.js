import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src="/logo192.png" alt="SSN Logo" className="navbar-logo" />
          <span className="navbar-title">SSN Faculty Profiles</span>
        </Link>

        <div className="navbar-controls">
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link to="/profiles" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Faculty
            </Link>
            
            {isAuthenticated() ? (
              <>
                {user?.role === 'MANAGER' && (
                  <Link to="/admin" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <div className="navbar-user">
                  <div className="user-info">
                    <FaUser className="user-icon" />
                    <span className="user-name">{user?.name || user?.email}</span>
                  </div>
                  <div className="user-menu">
                    <button 
                      className="user-menu-item"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
