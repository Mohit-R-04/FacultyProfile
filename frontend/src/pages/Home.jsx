import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserEdit, FaCog, FaGraduationCap } from 'react-icons/fa';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const Home = () => {
  return (
    <div className="">
      <section className="border-b bg-gradient-to-br from-primary/10 to-accent/10 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-3 text-3xl font-bold">Welcome to Faculty Profile Management</h1>
            <p className="text-muted-foreground">
              Streamline faculty information management with our comprehensive platform designed for academic institutions.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link to="/profiles"><Button size="lg"><FaUsers /> View Faculty</Button></Link>
              <Link to="/login"><Button variant="secondary" size="lg"><FaUserEdit /> Faculty Login</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <h2 className="mb-6 text-center text-2xl font-semibold">Key Features</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-3 text-2xl text-primary"><FaGraduationCap /></div>
                <h3 className="mb-1 font-medium">Profile Management</h3>
                <p className="text-sm text-muted-foreground">Comprehensive faculty profiles with qualifications, experience, research interests, and document management.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-3 text-2xl text-primary"><FaUserEdit /></div>
                <h3 className="mb-1 font-medium">Easy Updates</h3>
                <p className="text-sm text-muted-foreground">Faculty can easily update their profiles with secure authentication and role-based access control.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-3 text-2xl text-primary"><FaCog /></div>
                <h3 className="mb-1 font-medium">Admin Controls</h3>
                <p className="text-sm text-muted-foreground">Advanced administrative features for managing faculty profiles, approvals, and system settings.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
            <Card><CardContent className="p-6"><div className="text-3xl font-bold">50+</div><div className="text-sm text-muted-foreground">Faculty Members</div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="text-3xl font-bold">100%</div><div className="text-sm text-muted-foreground">Secure</div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="text-3xl font-bold">24/7</div><div className="text-sm text-muted-foreground">Available</div></CardContent></Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
