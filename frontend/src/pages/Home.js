import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserEdit, FaCog, FaGraduationCap } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to Faculty Profile Management
            </h1>
            <p className="hero-subtitle">
              Streamline faculty information management with our comprehensive platform
              designed for academic institutions.
            </p>
            <div className="hero-actions">
              <Link to="/profiles" className="btn btn-primary btn-lg">
                <FaUsers />
                View Faculty
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                <FaUserEdit />
                Faculty Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaGraduationCap />
              </div>
              <h3>Profile Management</h3>
              <p>
                Comprehensive faculty profiles with qualifications, experience,
                research interests, and document management.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaUserEdit />
              </div>
              <h3>Easy Updates</h3>
              <p>
                Faculty can easily update their profiles with secure authentication
                and role-based access control.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaCog />
              </div>
              <h3>Admin Controls</h3>
              <p>
                Advanced administrative features for managing faculty profiles,
                approvals, and system settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Faculty Members</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Secure</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
