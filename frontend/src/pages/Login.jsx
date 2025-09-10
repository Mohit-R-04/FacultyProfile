import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaSignInAlt, FaSpinner } from 'react-icons/fa';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/profiles');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="login-container w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Login</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@ssn.edu.in" required />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <FaSpinner className="spinner" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <FaSignInAlt />
                    Sign In
                  </>
                )}
              </Button>
            </form>
            <div className="login-footer mt-4 text-sm text-muted-foreground">
              <span>New faculty? </span>
              <Link to="/register" className="text-primary underline">Create an account</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
