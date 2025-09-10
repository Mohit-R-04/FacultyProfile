import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { profileAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaDownload, FaEdit, FaTrash, FaLock, FaUnlock, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

const ProfileDetail = () => {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteType, setPendingDeleteType] = useState(null);
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery(['profile', id], () => profileAPI.getById(id), { enabled: !!id });

  const handleDelete = async () => {
    if (!pendingDeleteType) return;
    try {
      await profileAPI.removeFile(id, pendingDeleteType);
      await queryClient.invalidateQueries(['profile', id]);
      await queryClient.refetchQueries(['profile', id]);
      toast.success('File removed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    } finally {
      setShowDeleteConfirm(false);
      setPendingDeleteType(null);
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
      toast.success('Edit request submitted successfully');
    } catch (error) {
      console.error('Edit request failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20"><div className="spinner"></div><p className="ml-2 text-sm text-muted-foreground">Loading profile...</p></div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container py-8">
        <Card><CardContent className="p-6"><h2 className="text-lg font-semibold">Profile Not Found</h2><p className="text-sm text-muted-foreground">The requested profile could not be found.</p><Link to="/profiles"><Button className="mt-3">Back to Profiles</Button></Link></CardContent></Card>
      </div>
    );
  }

  const canEdit = hasRole('MANAGER') || (user && profile.userId === user.id);
  const isLocked = profile.isLocked && new Date(profile.lockExpiry) > new Date();

  const getFileName = (filePath) => { if (!filePath) return null; return filePath.split('/').pop(); };

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              {profile.profilePic ? (
                <img className="mb-3 h-32 w-32 rounded-full object-cover" src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/files/download/${profile.profilePic.replace('/uploads/', '')}?v=${profile.updatedAt || Date.now()}`} alt={profile.name} />
              ) : (
                <div className="mb-3 flex h-32 w-32 items-center justify-center rounded-full border"><FaUser className="text-2xl" /></div>
              )}
              <h1 className="text-xl font-semibold">{profile.name}</h1>
              <p className="text-sm text-muted-foreground">{profile.department}</p>
              <p className="text-xs text-muted-foreground">{profile.role}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {canEdit && (
                  <Link to={`/profiles/${id}/edit`}>
                    <Button disabled={isLocked}><FaEdit /> Edit Profile</Button>
                  </Link>
                )}
                {!canEdit && isLocked && (
                  <Button variant="secondary" onClick={handleRequestEdit}>Request Edit Access</Button>
                )}
                {hasRole('MANAGER') && (
                  <Button variant={profile.isLocked ? 'default' : 'secondary'} onClick={handleLockToggle}>
                    {profile.isLocked ? <FaUnlock /> : <FaLock />} {profile.isLocked ? 'Unlock' : 'Lock'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {profile.bio && (
            <Card><CardContent className="p-6"><h3 className="mb-1 text-lg font-medium">Biography</h3><p className="text-sm text-foreground/80">{profile.bio}</p></CardContent></Card>
          )}
          {profile.experience && (
            <Card><CardContent className="p-6"><h3 className="mb-1 text-lg font-medium">Experience</h3><p className="text-sm text-foreground/80">{profile.experience}</p></CardContent></Card>
          )}
          {profile.research && (
            <Card><CardContent className="p-6"><h3 className="mb-1 text-lg font-medium">Research Interests</h3><p className="text-sm text-foreground/80">{profile.research}</p></CardContent></Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-3 text-lg font-medium">Documents</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                ].map(({ key, label }) => {
                  const fileType = key === 'tenthCert' ? 'tenth_cert' :
                                   key === 'twelfthCert' ? 'twelfth_cert' :
                                   key === 'appointmentOrder' ? 'appointment_order' :
                                   key === 'joiningReport' ? 'joining_report' :
                                   key === 'ugDegree' ? 'ug_degree' :
                                   key === 'pgMsConsolidated' ? 'pg_ms_consolidated' :
                                   key === 'phdDegree' ? 'phd_degree' :
                                   key === 'journalsList' ? 'journals_list' :
                                   key === 'conferencesList' ? 'conferences_list' :
                                   key === 'auSupervisorLetter' ? 'au_supervisor_letter' :
                                   key === 'fdpWorkshopsWebinars' ? 'fdp_workshops_webinars' :
                                   key === 'nptelCoursera' ? 'nptel_coursera' :
                                   key === 'invitedTalks' ? 'invited_talks' :
                                   key === 'projectsSanction' ? 'projects_sanction' :
                                   key === 'consultancy' ? 'consultancy' :
                                   key === 'patent' ? 'patent' :
                                   key === 'communityCert' ? 'community_cert' :
                                   key === 'aadhar' ? 'aadhar' :
                                   key === 'pan' ? 'pan' : key;
                  const file = profile[key];
                  if (!file) return null;
                  const fileName = getFileName(file);
                  return (
                    <div key={key} className="flex items-center justify-between rounded-md border p-3">
                      <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/files/download/${file.replace('/uploads/', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                        <FaDownload className="inline-block" /> <span className="ml-1">{label}</span>
                      </a>
                      {canEdit && !isLocked && (
                        <Button variant="destructive" size="sm" onClick={() => { setPendingDeleteType(fileType); setShowDeleteConfirm(true); }}>
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove file?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileDetail;
