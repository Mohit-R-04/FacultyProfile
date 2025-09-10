import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { profileAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaTimes, FaUserPlus, FaSpinner } from 'react-icons/fa';
import './AddFacultyModal.css';

const AddFacultyModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    department: 'IT',
    role: 'Assistant Professor',
    bio: '',
    qualifications: '',
    experience: '',
    research: '',
    dateOfJoining: ''
  });

  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  const addFacultyMutation = useMutation(
    (facultyData) => profileAPI.addFaculty(facultyData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('profiles');
        toast.success('Faculty member added successfully!');
        onClose();
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add faculty member');
      },
    }
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      department: 'IT',
      role: 'Assistant Professor',
      bio: '',
      qualifications: '',
      experience: '',
      research: '',
      dateOfJoining: ''
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    addFacultyMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!addFacultyMutation.isLoading) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaUserPlus />
            Add New Faculty Member
          </h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={addFacultyMutation.isLoading}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-faculty-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter full name"
                disabled={addFacultyMutation.isLoading}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter email address"
                disabled={addFacultyMutation.isLoading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter password (min 6 characters)"
                disabled={addFacultyMutation.isLoading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                disabled={addFacultyMutation.isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                disabled={addFacultyMutation.isLoading}
              >
                <option value="IT">IT</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="CHEM">CHEM</option>
                <option value="MBA">MBA</option>
                <option value="MATHS">MATHS</option>
                <option value="PHYSICS">PHYSICS</option>
                <option value="CHEMISTRY">CHEMISTRY</option>
                <option value="ENGLISH">ENGLISH</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="role">Position</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={addFacultyMutation.isLoading}
              >
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Senior Lecturer">Senior Lecturer</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dateOfJoining">Date of Joining</label>
              <input
                type="date"
                id="dateOfJoining"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleInputChange}
                disabled={addFacultyMutation.isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Enter brief bio"
              rows="3"
              disabled={addFacultyMutation.isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="qualifications">Qualifications</label>
            <textarea
              id="qualifications"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleInputChange}
              placeholder="Enter educational qualifications"
              rows="3"
              disabled={addFacultyMutation.isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience">Experience</label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              placeholder="Enter work experience"
              rows="3"
              disabled={addFacultyMutation.isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="research">Research Interests</label>
            <textarea
              id="research"
              name="research"
              value={formData.research}
              onChange={handleInputChange}
              placeholder="Enter research interests"
              rows="3"
              disabled={addFacultyMutation.isLoading}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={addFacultyMutation.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={addFacultyMutation.isLoading}
            >
              {addFacultyMutation.isLoading ? (
                <>
                  <FaSpinner className="spinner" />
                  Adding...
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Add Faculty Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFacultyModal;
