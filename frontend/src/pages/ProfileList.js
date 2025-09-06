import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { profileAPI } from '../services/api';
import { FaUser, FaSearch, FaFilter, FaSpinner } from 'react-icons/fa';
import './ProfileList.css';

const ProfileList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const { data: profiles, isLoading, error } = useQuery(
    'profiles',
    profileAPI.getAll,
    {
      refetchOnWindowFocus: false,
    }
  );

  const filteredProfiles = profiles?.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.qualifications?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || profile.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(profiles?.map(p => p.department) || [])];

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading faculty profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Profiles</h2>
        <p>Failed to load faculty profiles. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="profile-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Faculty Profiles</h1>
          <p>Browse and explore our faculty members</p>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search faculty by name, department, or qualifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-box">
            <FaFilter className="filter-icon" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="filter-select"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="profiles-grid">
          {filteredProfiles?.length > 0 ? (
            filteredProfiles.map(profile => (
              <div key={profile.id} className="profile-card">
                <div className="profile-image">
                  {profile.profilePic ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/files/download/${profile.profilePic.replace('/uploads/', '')}?v=${profile.updatedAt || Date.now()}`} 
                      alt={profile.name}
                      key={`${profile.id}-${profile.profilePic}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="profile-placeholder" style={{ display: profile.profilePic ? 'none' : 'flex' }}>
                    <FaUser />
                  </div>
                </div>
                
                <div className="profile-info">
                  <h3 className="profile-name">{profile.name}</h3>
                  <p className="profile-department">{profile.department}</p>
                  <p className="profile-role">{profile.role}</p>
                  
                  {profile.qualifications && (
                    <p className="profile-qualifications">
                      {profile.qualifications.length > 100 
                        ? `${profile.qualifications.substring(0, 100)}...` 
                        : profile.qualifications
                      }
                    </p>
                  )}
                  
                  {profile.research && (
                    <p className="profile-research">
                      <strong>Research:</strong> {profile.research.length > 80 
                        ? `${profile.research.substring(0, 80)}...` 
                        : profile.research
                      }
                    </p>
                  )}
                </div>
                
                <div className="profile-actions">
                  <Link 
                    to={`/profiles/${profile.id}`} 
                    className="btn btn-primary btn-sm"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-profiles">
              <FaUser className="no-profiles-icon" />
              <h3>No profiles found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileList;
