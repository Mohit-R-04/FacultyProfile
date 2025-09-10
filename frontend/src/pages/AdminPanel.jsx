import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api, { profileAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaUsers, FaLock, FaUnlock, FaCheck, FaSpinner, FaUserPlus } from 'react-icons/fa';
import AddFacultyModal from '../components/AddFacultyModal';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

const AdminPanel = () => {
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery('profiles', profileAPI.getAll);
  const { data: pendingUsers } = useQuery('pending-users', () => api.get('/admin/pending-users').then(res => res.data));

  const lockAllMutation = useMutation((lock) => profileAPI.lockAll(lock), {
    onSuccess: () => { queryClient.invalidateQueries('profiles'); toast.success('All profiles updated successfully'); },
    onError: (error) => { toast.error(error.response?.data?.error || 'Operation failed'); },
  });

  const lockMutation = useMutation(({ id, lock }) => profileAPI.lock(id, lock), {
    onSuccess: () => { queryClient.invalidateQueries('profiles'); toast.success('Profile updated successfully'); },
    onError: (error) => { toast.error(error.response?.data?.error || 'Operation failed'); },
  });

  const approveEditMutation = useMutation((id) => profileAPI.approveEdit(id), {
    onSuccess: () => { queryClient.invalidateQueries('profiles'); toast.success('Edit request approved'); },
    onError: (error) => { toast.error(error.response?.data?.error || 'Operation failed'); },
  });

  const handleSelectProfile = (profileId) => {
    setSelectedProfiles(prev => prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]);
  };

  const handleSelectAll = () => {
    if (selectedProfiles.length === profiles?.length) setSelectedProfiles([]);
    else setSelectedProfiles(profiles?.map(p => p.id) || []);
  };

  const handleLockAll = (lock) => lockAllMutation.mutate(lock);
  const handleLockProfile = (id, lock) => lockMutation.mutate({ id, lock });
  const handleApproveEdit = (id) => approveEditMutation.mutate(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="spinner" />
        <p className="ml-2 text-sm text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  const lockedProfiles = profiles?.filter(p => p.isLocked) || [];
  const editRequests = profiles?.filter(p => p.editRequested) || [];

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="text-sm text-foreground">Manage faculty profiles and system settings</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="text-primary"><FaUsers /></div>
            <div>
              <div className="text-xl font-semibold">{profiles?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Total Profiles</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="text-foreground"><FaLock /></div>
            <div>
              <div className="text-xl font-semibold">{lockedProfiles.length}</div>
              <div className="text-xs text-muted-foreground">Locked Profiles</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="text-foreground"><FaCheck /></div>
            <div>
              <div className="text-xl font-semibold">{editRequests.length}</div>
              <div className="text-xs text-muted-foreground">Edit Requests</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="text-foreground"><FaUserPlus /></div>
            <div>
              <div className="text-xl font-semibold">{pendingUsers?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Pending Approvals</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Management</CardTitle>
            <CardDescription>Invite and manage faculty members</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => setShowAddFacultyModal(true)}>
              <FaUserPlus />
              Add Faculty Member
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Actions</CardTitle>
            <CardDescription>Update state across all profiles</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button className="w-full sm:w-auto" variant="secondary" onClick={() => handleLockAll(true)} disabled={lockAllMutation.isLoading}>
              <FaLock />
              Lock All Profiles
            </Button>
            <Button className="w-full sm:w-auto" variant="default" onClick={() => handleLockAll(false)} disabled={lockAllMutation.isLoading}>
              <FaUnlock />
              Unlock All Profiles
            </Button>
          </CardContent>
        </Card>
      </div>

      {editRequests.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-2 text-lg font-medium">Pending Edit Requests</h3>
          <div className="space-y-2">
            {editRequests.map(profile => (
              <Card key={profile.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h4 className="font-medium">{profile.name}</h4>
                    <p className="text-sm text-muted-foreground">{profile.department} • {profile.email}</p>
                  </div>
                  <Button variant="default" onClick={() => handleApproveEdit(profile.id)} disabled={approveEditMutation.isLoading}>
                    <FaCheck />
                    Approve
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pendingUsers?.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-2 text-lg font-medium">Pending User Approvals</h3>
          <div className="space-y-2">
            {pendingUsers.map(u => (
              <Card key={u.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h4 className="font-medium">{u.email}</h4>
                    <p className="text-sm text-muted-foreground">Awaiting approval</p>
                  </div>
                  <Button
                    variant="default"
                    onClick={async () => {
                      await api.post(`/admin/approve-user/${u.id}`);
                      toast.success('User approved');
                      queryClient.invalidateQueries('pending-users');
                    }}
                  >
                    <FaCheck />
                    Approve
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Management</CardTitle>
            <CardDescription>Select profiles and update their lock status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <Button variant="secondary" onClick={handleSelectAll}>
                {selectedProfiles.length === profiles?.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="divide-y">
              <div className="grid grid-cols-12 px-2 py-2 text-sm text-muted-foreground">
                <div className="col-span-1"><input type="checkbox" checked={selectedProfiles.length === profiles?.length && profiles?.length > 0} onChange={handleSelectAll} /></div>
                <div className="col-span-4">Name</div>
                <div className="col-span-3">Department</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Actions</div>
              </div>
              {profiles?.map(profile => (
                <div key={profile.id} className="grid grid-cols-12 items-center px-2 py-3">
                  <div className="col-span-1"><input type="checkbox" checked={selectedProfiles.includes(profile.id)} onChange={() => handleSelectProfile(profile.id)} /></div>
                  <div className="col-span-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{profile.name}</span>
                      <span className="text-xs text-muted-foreground">{profile.email}</span>
                    </div>
                  </div>
                  <div className="col-span-3">{profile.department}</div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${profile.isLocked ? 'bg-muted text-foreground' : 'bg-accent text-accent-foreground'}`}>
                      {profile.isLocked ? 'Locked' : 'Unlocked'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <Button variant={profile.isLocked ? 'default' : 'secondary'} size="sm" onClick={() => handleLockProfile(profile.id, !profile.isLocked)} disabled={lockMutation.isLoading}>
                      {profile.isLocked ? <FaUnlock /> : <FaLock />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddFacultyModal isOpen={showAddFacultyModal} onClose={() => setShowAddFacultyModal(false)} />
    </div>
  );
};

export default AdminPanel;
