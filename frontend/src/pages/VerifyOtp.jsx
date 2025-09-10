import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import './Login.css';

const VerifyOtp = () => {
  const location = useLocation();
  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.verifyOtp(email, otp);
      toast.success('Email verified. Await admin approval');
      navigate('/login');
    } catch (e) {
      toast.error(e.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authAPI.resendOtp(email);
      toast.success('OTP resent');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to resend OTP');
    }
  };

  return (
    <div className="login-page flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="login-container w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <CardTitle>Verify Email</CardTitle>
            <CardDescription>Enter the OTP sent to your SSN email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Email</label>
                <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">OTP</label>
                <Input type="text" value={otp} onChange={(e)=>setOtp(e.target.value)} required placeholder="6-digit code" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleResend}>Resend OTP</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOtp;


