import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ProfileList from './pages/ProfileList';
import ProfileDetail from './pages/ProfileDetail';
import ProfileEdit from './pages/ProfileEdit';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/profiles" element={<ProfileList />} />
              <Route path="/profiles/:id" element={<ProfileDetail />} />
              <Route 
                path="/profiles/:id/edit" 
                element={
                  <ProtectedRoute>
                    <ProfileEdit />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="MANAGER">
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
