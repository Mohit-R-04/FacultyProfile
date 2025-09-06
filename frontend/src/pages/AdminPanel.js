import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { profileAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaUsers, FaLock, FaUnlock, FaCheck, FaSpinner } from 'react-icons/fa';
import './AdminPanel.css';

const AdminPanel = () => {
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery(
    'profiles',
    profileAPI.getAll
  );

  const lockAllMutation = useMutation(
    (lock) => profileAPI.lockAll(lock),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profiles');
        toast.success('All profiles updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Operation failed');
      },
    }
  );

  const lockMutation = useMutation(
    ({ id, lock }) => profileAPI.lock(id, lock),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profiles');
        toast.success('Profile updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Operation failed');
      },
    }
  );

  const approveEditMutation = useMutation(
    (id) => profileAPI.approveEdit(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profiles');
        toast.success('Edit request approved');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Operation failed');
      },
    }
  );

  const handleSelectProfile = (profileId) => {
    setSelectedProfiles(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProfiles.length === profiles?.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(profiles?.map(p => p.id) || []);
    }
  };

  const handleLockAll = (lock) => {
    lockAllMutation.mutate(lock);
  };

  const handleLockProfile = (id, lock) => {
    lockMutation.mutate({ id, lock });
  };

  const handleApproveEdit = (id) => {
    approveEditMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading admin panel...</p>
      </div>
    );
  }

  const lockedProfiles = profiles?.filter(p => p.isLocked) || [];
  const editRequests = profiles?.filter(p => p.editRequested) || [];

  return (
    <div className="admin-panel-page">
      <div className="container">
        <div className="page-header">
          <h1>Admin Panel</h1>
          <p>Manage faculty profiles and system settings</p>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <div className="stat-number">{profiles?.length || 0}</div>
              <div className="stat-label">Total Profiles</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon locked">
              <FaLock />
            </div>
            <div className="stat-content">
              <div className="stat-number">{lockedProfiles.length}</div>
              <div className="stat-label">Locked Profiles</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon requests">
              <FaCheck />
            </div>
            <div className="stat-content">
              <div className="stat-number">{editRequests.length}</div>
              <div className="stat-label">Edit Requests</div>
            </div>
          </div>
        </div>

        <div className="admin-actions">
          <div className="action-group">
            <h3>Bulk Actions</h3>
            <div className="action-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => handleLockAll(true)}
                disabled={lockAllMutation.isLoading}
              >
                <FaLock />
                Lock All Profiles
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleLockAll(false)}
                disabled={lockAllMutation.isLoading}
              >
                <FaUnlock />
                Unlock All Profiles
              </button>
            </div>
          </div>
        </div>

        {editRequests.length > 0 && (
          <div className="edit-requests-section">
            <h3>Pending Edit Requests</h3>
            <div className="requests-list">
              {editRequests.map(profile => (
                <div key={profile.id} className="request-item">
                  <div className="request-info">
                    <h4>{profile.name}</h4>
                    <p>{profile.department} • {profile.email}</p>
                  </div>
                  <div className="request-actions">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleApproveEdit(profile.id)}
                      disabled={approveEditMutation.isLoading}
                    >
                      <FaCheck />
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="profiles-management">
          <div className="management-header">
            <h3>Profile Management</h3>
            <div className="bulk-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleSelectAll}
              >
                {selectedProfiles.length === profiles?.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="profiles-table">
            <div className="table-header">
              <div className="table-cell checkbox">
                <input
                  type="checkbox"
                  checked={selectedProfiles.length === profiles?.length && profiles?.length > 0}
                  onChange={handleSelectAll}
                />
              </div>
              <div className="table-cell">Name</div>
              <div className="table-cell">Department</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Actions</div>
            </div>

            {profiles?.map(profile => (
              <div key={profile.id} className="table-row">
                <div className="table-cell checkbox">
                  <input
                    type="checkbox"
                    checked={selectedProfiles.includes(profile.id)}
                    onChange={() => handleSelectProfile(profile.id)}
                  />
                </div>
                <div className="table-cell">
                  <div className="profile-info">
                    <strong>{profile.name}</strong>
                    <span>{profile.email}</span>
                  </div>
                </div>
                <div className="table-cell">{profile.department}</div>
                <div className="table-cell">
                  <span className={`status-badge ${profile.isLocked ? 'locked' : 'unlocked'}`}>
                    {profile.isLocked ? 'Locked' : 'Unlocked'}
                  </span>
                </div>
                <div className="table-cell">
                  <div className="row-actions">
                    <button
                      className={`btn btn-sm ${profile.isLocked ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => handleLockProfile(profile.id, !profile.isLocked)}
                      disabled={lockMutation.isLoading}
                    >
                      {profile.isLocked ? <FaUnlock /> : <FaLock />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
