import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { profileAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaUserPlus, FaSpinner } from 'react-icons/fa';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

const AddFacultyModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phoneNumber: '', department: 'IT', role: 'Assistant Professor', bio: '', qualifications: '', experience: '', research: '', dateOfJoining: ''
  });
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  const addFacultyMutation = useMutation((facultyData) => profileAPI.addFaculty(facultyData), {
    onSuccess: () => { queryClient.invalidateQueries('profiles'); toast.success('Faculty member added successfully!'); onClose(); resetForm(); },
    onError: (error) => { toast.error(error.response?.data?.error || 'Failed to add faculty member'); },
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', phoneNumber: '', department: 'IT', role: 'Assistant Professor', bio: '', qualifications: '', experience: '', research: '', dateOfJoining: '' });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    addFacultyMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !addFacultyMutation.isLoading) { onClose(); resetForm(); } }}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 border-b bg-background/70 p-6 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <DialogHeader>
            <DialogTitle>Add New Faculty Member</DialogTitle>
            <DialogDescription>Fill in the details to create a faculty profile</DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="name">Name *</label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter full name" disabled={addFacultyMutation.isLoading} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <div className="mt-1 text-xs text-destructive">{errors.name}</div>}
            </div>
            <div>
              <label className="form-label" htmlFor="email">Email *</label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email address" disabled={addFacultyMutation.isLoading} className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <div className="mt-1 text-xs text-destructive">{errors.email}</div>}
            </div>
            <div>
              <label className="form-label" htmlFor="password">Password *</label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Enter password (min 6 characters)" disabled={addFacultyMutation.isLoading} className={errors.password ? 'border-destructive' : ''} />
              {errors.password && <div className="mt-1 text-xs text-destructive">{errors.password}</div>}
            </div>
            <div>
              <label className="form-label" htmlFor="phoneNumber">Phone Number</label>
              <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Enter phone number" disabled={addFacultyMutation.isLoading} />
            </div>
            <div>
              <label className="form-label" htmlFor="department">Department</label>
              <select id="department" name="department" value={formData.department} onChange={handleInputChange} disabled={addFacultyMutation.isLoading} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
            <div>
              <label className="form-label" htmlFor="role">Position</label>
              <select id="role" name="role" value={formData.role} onChange={handleInputChange} disabled={addFacultyMutation.isLoading} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Senior Lecturer">Senior Lecturer</option>
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="dateOfJoining">Date of Joining</label>
              <Input id="dateOfJoining" name="dateOfJoining" type="date" value={formData.dateOfJoining} onChange={handleInputChange} disabled={addFacultyMutation.isLoading} />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="bio">Bio</label>
            <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Enter brief bio" rows={3} disabled={addFacultyMutation.isLoading} />
          </div>

          <div>
            <label className="form-label" htmlFor="qualifications">Qualifications</label>
            <Textarea id="qualifications" name="qualifications" value={formData.qualifications} onChange={handleInputChange} placeholder="Enter educational qualifications" rows={3} disabled={addFacultyMutation.isLoading} />
          </div>

          <div>
            <label className="form-label" htmlFor="experience">Experience</label>
            <Textarea id="experience" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="Enter work experience" rows={3} disabled={addFacultyMutation.isLoading} />
          </div>

          <div>
            <label className="form-label" htmlFor="research">Research Interests</label>
            <Textarea id="research" name="research" value={formData.research} onChange={handleInputChange} placeholder="Enter research interests" rows={3} disabled={addFacultyMutation.isLoading} />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => { if (!addFacultyMutation.isLoading) { onClose(); resetForm(); } }} disabled={addFacultyMutation.isLoading}>Cancel</Button>
            <Button type="submit" disabled={addFacultyMutation.isLoading}>
              {addFacultyMutation.isLoading ? (<><FaSpinner className="spinner" /> Adding...</>) : (<><FaUserPlus /> Add Faculty Member</>)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFacultyModal;
