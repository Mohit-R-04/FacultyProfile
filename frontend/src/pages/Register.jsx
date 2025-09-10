import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import './Login.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(email, password);
      toast.success('OTP sent to your SSN email');
      navigate('/verify-otp', { state: { email } });
    } catch (e) {
      toast.error(e.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="login-container w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Registration</CardTitle>
            <CardDescription>Use your SSN email to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="form-group">
                <label className="form-label">SSN Email</label>
                <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required placeholder="name@ssn.edu.in" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Register'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;


