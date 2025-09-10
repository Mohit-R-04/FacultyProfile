import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { profileAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaSave, FaSpinner, FaTimes, FaTrash, FaFile } from 'react-icons/fa';
import './ProfileEdit.css';

const ProfileEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    qualifications: '',
    experience: '',
    research: '',
    email: '',
    phoneNumber: '',
  });
  const [files, setFiles] = useState({});

  const { data: profile, isLoading } = useQuery(
    ['profile', id],
    () => profileAPI.getById(id),
    {
      enabled: !!id,
      onSuccess: (data) => {
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          qualifications: data.qualifications || '',
          experience: data.experience || '',
          research: data.research || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
        });
      },
    }
  );

  const updateMutation = useMutation(
    (data) => profileAPI.update(id, data, Object.values(files).filter(Boolean)),
    {
      onSuccess: async () => {
        // Invalidate and refetch all related queries
        await queryClient.invalidateQueries(['profile', id]);
        await queryClient.invalidateQueries('profiles');
        await queryClient.refetchQueries(['profile', id]);
        await queryClient.refetchQueries('profiles');
        toast.success('Profile updated successfully!');
        navigate(`/profiles/${id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Update failed');
      },
    }
  );

  const removeFileMutation = useMutation(
    (fileType) => profileAPI.removeFile(id, fileType),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['profile', id]);
        await queryClient.refetchQueries(['profile', id]);
        toast.success('File removed successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to remove file');
      },
    }
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      // Create a new file with a descriptive name for better backend mapping
      const originalFile = fileList[0];
      const newFile = new File([originalFile], `${name}_${originalFile.name}`, {
        type: originalFile.type,
        lastModified: originalFile.lastModified
      });
      
      setFiles({
        ...files,
        [name]: newFile,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleRemoveFile = (fileType) => {
    if (window.confirm('Are you sure you want to remove this file?')) {
      removeFileMutation.mutate(fileType);
    }
  };

  const getFileName = (filePath) => {
    if (!filePath) return null;
    return filePath.split('/').pop();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="error-container">
        <h2>Profile Not Found</h2>
        <p>The requested profile could not be found.</p>
      </div>
    );
  }

  const canEdit = hasRole('MANAGER') || (user && profile.userId === user.id);
  const isLocked = profile.isLocked && new Date(profile.lockExpiry) > new Date();

  if (!canEdit) {
    return (
      <div className="error-container">
        <h2>Access Denied</h2>
        <p>You don't have permission to edit this profile.</p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="error-container">
        <h2>Profile Locked</h2>
        <p>This profile is currently locked and cannot be edited.</p>
      </div>
    );
  }

  return (
    <div className="profile-edit-page">
      <div className="container">
        <div className="page-header">
          <h1>Edit Profile</h1>
          <p>Update your faculty profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                Biography
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-input form-textarea"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="qualifications" className="form-label">
                Qualifications
              </label>
              <input
                type="text"
                id="qualifications"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., PhD in Computer Science, MSc in Mathematics"
              />
            </div>

            <div className="form-group">
              <label htmlFor="experience" className="form-label">
                Experience
              </label>
              <input
                type="text"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 5 years teaching experience"
              />
            </div>

            <div className="form-group">
              <label htmlFor="research" className="form-label">
                Research Interests
              </label>
              <textarea
                id="research"
                name="research"
                value={formData.research}
                onChange={handleChange}
                className="form-input form-textarea"
                rows="3"
                placeholder="Describe your research interests and areas of expertise"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Document Uploads</h3>
            <div className="file-upload-grid">
              {[
                { key: 'profile_pic', label: 'Profile Picture', accept: 'image/*' },
                { key: 'tenth_cert', label: '10th Certificate', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'twelfth_cert', label: '12th Certificate', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'appointment_order', label: 'Appointment Order', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'joining_report', label: 'Joining Report', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'ug_degree', label: 'UG Degree Certificate', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'pg_ms_consolidated', label: 'PG/MS Consolidated', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'phd_degree', label: 'PhD Degree Certificate', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'journals_list', label: 'Journals List', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'conferences_list', label: 'Conferences List', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'au_supervisor_letter', label: 'AU Supervisor Letter', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'fdp_workshops_webinars', label: 'FDP/Workshops/Webinars', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'nptel_coursera', label: 'NPTEL/Coursera Certificates', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'invited_talks', label: 'Invited Talks', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'projects_sanction', label: 'Projects Sanction', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'consultancy', label: 'Consultancy', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'patent', label: 'Patent', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'community_cert', label: 'Community Certificate', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'aadhar', label: 'Aadhar Card', accept: '.pdf,.jpg,.jpeg,.png' },
                { key: 'pan', label: 'PAN Card', accept: '.pdf,.jpg,.jpeg,.png' },
              ].map(({ key, label, accept }) => {
                const existingFile = profile[key];
                const fileName = getFileName(existingFile);
                
                return (
                  <div key={key} className="form-group">
                    <label htmlFor={key} className="form-label">
                      {label}
                    </label>
                    
                    {existingFile && fileName && (
                      <div className="existing-file">
                        <div className="file-info">
                          <FaFile className="file-icon" />
                          <span className="file-name" title={fileName}>
                            {fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm remove-file-btn"
                          onClick={() => handleRemoveFile(key)}
                          disabled={removeFileMutation.isLoading}
                          title="Remove file"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      id={key}
                      name={key}
                      accept={accept}
                      onChange={handleFileChange}
                      className="form-input"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? (
                <>
                  <FaSpinner className="spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => navigate(`/profiles/${id}`)}
            >
              <FaTimes />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
