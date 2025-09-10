import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { profileAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaSave, FaSpinner, FaTimes, FaTrash, FaFile } from 'react-icons/fa';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

const ProfileEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', bio: '', qualifications: '', experience: '', research: '', email: '', phoneNumber: '' });
  const [files, setFiles] = useState({});

  const { data: profile, isLoading } = useQuery(['profile', id], () => profileAPI.getById(id), {
    enabled: !!id,
    onSuccess: (data) => { setFormData({ name: data.name || '', bio: data.bio || '', qualifications: data.qualifications || '', experience: data.experience || '', research: data.research || '', email: data.email || '', phoneNumber: data.phoneNumber || '' }); },
  });

  const updateMutation = useMutation((data) => profileAPI.update(id, data, Object.values(files).filter(Boolean)), {
    onSuccess: async () => {
      await queryClient.invalidateQueries(['profile', id]);
      await queryClient.invalidateQueries('profiles');
      await queryClient.refetchQueries(['profile', id]);
      await queryClient.refetchQueries('profiles');
      toast.success('Profile updated successfully!');
      navigate(`/profiles/${id}`);
    },
    onError: (error) => { toast.error(error.response?.data?.error || 'Update failed'); },
  });

  const removeFileMutation = useMutation((fileType) => profileAPI.removeFile(id, fileType), {
    onSuccess: async () => { await queryClient.invalidateQueries(['profile', id]); await queryClient.refetchQueries(['profile', id]); toast.success('File removed successfully!'); },
    onError: (error) => { toast.error(error.response?.data?.error || 'Failed to remove file'); },
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      const originalFile = fileList[0];
      const newFile = new File([originalFile], `${name}_${originalFile.name}`, { type: originalFile.type, lastModified: originalFile.lastModified });
      setFiles({ ...files, [name]: newFile });
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); updateMutation.mutate(formData); };

  const handleRemoveFile = (fileType) => { if (window.confirm('Are you sure you want to remove this file?')) removeFileMutation.mutate(fileType); };

  const getFileName = (filePath) => { if (!filePath) return null; return filePath.split('/').pop(); };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20"><FaSpinner className="spinner" /><p className="ml-2 text-sm text-muted-foreground">Loading profile...</p></div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-8"><Card><CardContent className="p-6"><h2 className="text-lg font-semibold">Profile Not Found</h2><p className="text-sm text-muted-foreground">The requested profile could not be found.</p></CardContent></Card></div>
    );
  }

  const canEdit = hasRole('MANAGER') || (user && profile.userId === user.id);
  const isLocked = profile.isLocked && new Date(profile.lockExpiry) > new Date();

  if (!canEdit) {
    return (
      <div className="container py-8"><Card><CardContent className="p-6"><h2 className="text-lg font-semibold">Access Denied</h2><p className="text-sm text-muted-foreground">You don't have permission to edit this profile.</p></CardContent></Card></div>
    );
  }

  if (isLocked) {
    return (
      <div className="container py-8"><Card><CardContent className="p-6"><h2 className="text-lg font-semibold">Profile Locked</h2><p className="text-sm text-muted-foreground">This profile is currently locked and cannot be edited.</p></CardContent></Card></div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit Profile</h1>
        <p className="text-sm text-muted-foreground">Update your faculty profile information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="name">Full Name *</label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label" htmlFor="email">Email Address</label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label" htmlFor="phoneNumber">Phone Number</label>
              <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="bio">Biography</label>
              <Textarea id="bio" name="bio" rows={4} value={formData.bio} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label" htmlFor="qualifications">Qualifications</label>
              <Input id="qualifications" name="qualifications" value={formData.qualifications} onChange={handleChange} placeholder="e.g., PhD in Computer Science, MSc in Mathematics" />
            </div>
            <div>
              <label className="form-label" htmlFor="experience">Experience</label>
              <Input id="experience" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g., 5 years teaching experience" />
            </div>
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="research">Research Interests</label>
              <Textarea id="research" name="research" rows={3} value={formData.research} onChange={handleChange} placeholder="Describe your research interests and areas of expertise" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Uploads</CardTitle>
            <CardDescription>Upload or remove relevant documents</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <div key={key} className="space-y-2">
                  <label className="form-label" htmlFor={key}>{label}</label>
                  {existingFile && fileName && (
                    <div className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center gap-2 text-sm"><FaFile className="opacity-70" /><span title={fileName}>{fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName}</span></div>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveFile(key)} disabled={removeFileMutation.isLoading}> <FaTrash /> </Button>
                    </div>
                  )}
                  <Input type="file" id={key} name={key} accept={accept} onChange={handleFileChange} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={updateMutation.isLoading}>
            {updateMutation.isLoading ? (<><FaSpinner className="spinner" /> Saving...</>) : (<><FaSave /> Save Changes</>)}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(`/profiles/${id}`)}>
            <FaTimes /> Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
