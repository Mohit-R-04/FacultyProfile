import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { profileAPI } from '../services/api';
import { FaUser, FaSearch, FaFilter, FaSpinner } from 'react-icons/fa';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const ProfileList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const { data: profiles, isLoading, error } = useQuery('profiles', profileAPI.getAll, { refetchOnWindowFocus: false });

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
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="spinner" />
        <p className="ml-2 text-sm text-muted-foreground">Loading faculty profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <Card><CardContent className="p-6"><h2 className="text-lg font-semibold">Error Loading Profiles</h2><p className="text-sm text-muted-foreground">Failed to load faculty profiles. Please try again later.</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="">
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Faculty Profiles</h1>
          <p className="text-sm text-foreground">Browse and explore our faculty members</p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2 flex items-center gap-2 rounded-md border bg-background p-2">
            <FaSearch className="opacity-60" />
            <Input
              type="text"
              placeholder="Search faculty by name, department, or qualifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-2 rounded-md border bg-background p-2">
            <FaFilter className="opacity-60" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {filteredProfiles?.length > 0 ? (
            filteredProfiles.map(profile => (
              <Card key={profile.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-md border bg-muted text-muted-foreground">
                      {profile.profilePic ? (
                        <img
                          className="h-16 w-16 object-cover"
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/files/download/${profile.profilePic.replace('/uploads/', '')}?v=${profile.updatedAt || Date.now()}`}
                          alt={profile.name}
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div className="flex h-16 w-16 items-center justify-center" style={{ display: profile.profilePic ? 'none' : 'flex' }}>
                        <FaUser />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{profile.name}</h3>
                        <Link to={`/profiles/${profile.id}`}><Button size="sm">View</Button></Link>
                      </div>
                      <p className="text-sm text-muted-foreground">{profile.department}</p>
                      <p className="text-xs text-muted-foreground">{profile.role}</p>
                      {profile.qualifications && (
                        <p className="mt-2 text-sm text-foreground/80">
                          {profile.qualifications.length > 100 ? `${profile.qualifications.substring(0, 100)}...` : profile.qualifications}
                        </p>
                      )}
                      {profile.research && (
                        <p className="text-xs text-muted-foreground"><strong>Research:</strong> {profile.research.length > 80 ? `${profile.research.substring(0, 80)}...` : profile.research}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-3">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <FaUser className="mb-2 text-2xl opacity-60" />
                <h3 className="mb-1 text-lg font-medium">No profiles found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileList;
