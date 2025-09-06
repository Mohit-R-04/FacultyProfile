import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { profileAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaDownload, FaEdit, FaTrash, FaLock, FaUnlock } from 'react-icons/fa';
import './ProfileDetail.css';

const ProfileDetail = () => {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: profile, isLoading, error } = useQuery(
    ['profile', id],
    () => profileAPI.getById(id),
    {
      enabled: !!id,
    }
  );

  const handleDelete = async () => {
    try {
      await profileAPI.delete(id);
      window.location.href = '/profiles';
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleLockToggle = async () => {
    try {
      await profileAPI.lock(id, !profile.isLocked);
      window.location.reload();
    } catch (error) {
      console.error('Lock toggle failed:', error);
    }
  };

  const handleRequestEdit = async () => {
    try {
      await profileAPI.requestEdit(id);
      alert('Edit request submitted successfully');
    } catch (error) {
      console.error('Edit request failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="error-container">
        <h2>Profile Not Found</h2>
        <p>The requested profile could not be found.</p>
        <Link to="/profiles" className="btn btn-primary">
          Back to Profiles
        </Link>
      </div>
    );
  }

  const canEdit = hasRole('MANAGER') || (user && profile.userId === user.id);
  const isLocked = profile.isLocked && new Date(profile.lockExpiry) > new Date();

  return (
    <div className="profile-detail-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-image-section">
            {profile.profilePic ? (
              <img 
                src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/files/download/${profile.profilePic.replace('/uploads/', '')}?v=${profile.updatedAt || Date.now()}`} 
                alt={profile.name}
                className="profile-image"
                key={`${profile.id}-${profile.profilePic}`} // Force re-render when profilePic changes
              />
            ) : (
              <div className="profile-placeholder">
                <FaUser />
              </div>
            )}
          </div>
          
          <div className="profile-basic-info">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-department">{profile.department}</p>
            <p className="profile-role">{profile.role}</p>
            
            {profile.qualifications && (
              <p className="profile-qualifications">{profile.qualifications}</p>
            )}
          </div>
          
          <div className="profile-actions">
            {canEdit && (
              <Link 
                to={`/profiles/${id}/edit`} 
                className="btn btn-primary"
                disabled={isLocked}
              >
                <FaEdit />
                Edit Profile
              </Link>
            )}
            
            {!canEdit && isLocked && (
              <button 
                className="btn btn-secondary"
                onClick={handleRequestEdit}
              >
                Request Edit Access
              </button>
            )}
            
            {hasRole('MANAGER') && (
              <button 
                className={`btn ${profile.isLocked ? 'btn-success' : 'btn-secondary'}`}
                onClick={handleLockToggle}
              >
                {profile.isLocked ? <FaUnlock /> : <FaLock />}
                {profile.isLocked ? 'Unlock' : 'Lock'}
              </button>
            )}
            
            {canEdit && (
              <button 
                className="btn btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <FaTrash />
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-details">
            {profile.bio && (
              <div className="detail-section">
                <h3>Biography</h3>
                <p>{profile.bio}</p>
              </div>
            )}
            
            {profile.experience && (
              <div className="detail-section">
                <h3>Experience</h3>
                <p>{profile.experience}</p>
              </div>
            )}
            
            {profile.research && (
              <div className="detail-section">
                <h3>Research Interests</h3>
                <p>{profile.research}</p>
              </div>
            )}
          </div>

          <div className="profile-documents">
            <h3>Documents</h3>
            <div className="documents-grid">
              {[
                { key: 'tenthCert', label: '10th Certificate' },
                { key: 'twelfthCert', label: '12th Certificate' },
                { key: 'appointmentOrder', label: 'Appointment Order' },
                { key: 'joiningReport', label: 'Joining Report' },
                { key: 'ugDegree', label: 'UG Degree Certificate' },
                { key: 'pgMsConsolidated', label: 'PG/MS Consolidated' },
                { key: 'phdDegree', label: 'PhD Degree Certificate' },
                { key: 'journalsList', label: 'Journals List' },
                { key: 'conferencesList', label: 'Conferences List' },
                { key: 'auSupervisorLetter', label: 'AU Supervisor Letter' },
                { key: 'fdpWorkshopsWebinars', label: 'FDP/Workshops/Webinars' },
                { key: 'nptelCoursera', label: 'NPTEL/Coursera Courses' },
                { key: 'invitedTalks', label: 'Invited Talks' },
                { key: 'projectsSanction', label: 'Projects Sanction' },
                { key: 'consultancy', label: 'Consultancy' },
                { key: 'patent', label: 'Patent' },
                { key: 'communityCert', label: 'Community Certificate' },
                { key: 'aadhar', label: 'Aadhar' },
                { key: 'pan', label: 'PAN' },
              ].map(({ key, label }) => (
                profile[key] && (
                  <a
                    key={key}
                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/files/download/${profile[key].replace('/uploads/', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="document-item"
                  >
                    <FaDownload />
                    <span>{label}</span>
                  </a>
                )
              ))}
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this profile? This action cannot be undone.</p>
              <div className="modal-actions">
                <button 
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetail;
