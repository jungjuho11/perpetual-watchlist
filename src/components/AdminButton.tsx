'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  Alert,
  Typography,
} from '@mui/material';
import { AdminPanelSettings, Login } from '@mui/icons-material';
import { supabase, isAdmin } from '../lib/supabase';

interface AdminButtonProps {
  onAuthChange: (isAdmin: boolean) => void;
}

const AdminButton: React.FC<AdminButtonProps> = ({ onAuthChange }) => {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const adminStatus = await isAdmin();
      setIsAdminUser(adminStatus);
      onAuthChange(adminStatus);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAdminUser(false);
      onAuthChange(false);
    }
  }, [onAuthChange]);

  useEffect(() => {
    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Has session:', !!session?.user);

        if (session?.user) {
          try {
            const adminStatus = await isAdmin();
            console.log('Admin status after auth change:', adminStatus);
            setIsAdminUser(adminStatus);
            onAuthChange(adminStatus);
          } catch (error) {
            console.error('Error checking admin status after auth change:', error);
            setIsAdminUser(false);
            onAuthChange(false);
          }
        } else {
          console.log('No session, clearing admin status');
          setIsAdminUser(false);
          onAuthChange(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onAuthChange, checkAuthStatus]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // If login successful, immediately check admin status
      if (data.user) {
        console.log('Login successful, checking admin status for:', data.user.email);

        try {
          // Try direct admin check with user email from login data
          const response = await fetch('/api/auth/check-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.user.email })
          });

          console.log('Direct admin check response status:', response.status);

          if (response.ok) {
            const result = await response.json();
            console.log('Direct admin check result:', result);

            if (result.isAdmin) {
              setIsAdminUser(true);
              onAuthChange(true);
              setShowLogin(false);
              setEmail('');
              setPassword('');
              console.log('Admin login completed successfully');
            } else {
              console.log('User is not admin');
              setError('You are not authorized as an admin.');
              setShowLogin(false);
              setEmail('');
              setPassword('');
            }
          } else {
            console.error('Admin check API failed:', response.status);
            setError('Login successful but admin check failed. Please try again.');
          }
        } catch (adminError) {
          console.error('Error checking admin status after login:', adminError);
          setError('Login successful but admin check failed. Please try again.');
        }
      }
    } catch (loginError) {
      console.error('Login error:', loginError);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('Logout initiated...');

    // Immediately update UI state
    setIsAdminUser(false);
    onAuthChange(false);

    // Then handle the actual logout
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout exception:', error);
    }
  };

  if (isAdminUser) {
    return (
      <Button
        variant="contained"
        startIcon={<AdminPanelSettings />}
        onClick={handleLogout}
        size="medium"
        sx={{
          borderRadius: 3,
          px: 3,
          py: 1,
          background: 'linear-gradient(135deg, #1976d2 0%, #9333ea 100%)',
          boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1565c0 0%, #7c3aed 100%)',
            boxShadow: '0 8px 20px 0 rgba(25, 118, 210, 0.4)',
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontWeight: 600
        }}
      >
        Admin • Logout
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Login />}
        onClick={() => setShowLogin(true)}
        size="medium"
        sx={{
          borderRadius: 3,
          px: 3,
          py: 1,
          borderColor: 'rgba(255,255,255,0.3)',
          color: 'text.secondary',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(5px)',
          '&:hover': {
            borderColor: 'rgba(25, 118, 210, 0.5)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.2)'
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontWeight: 600
        }}
      >
        Admin?
      </Button>

      <Dialog
        open={showLogin}
        onClose={() => setShowLogin(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.2)'
            }}>
              <AdminPanelSettings color="primary" sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight="600">
              Admin Login
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Admin access required to edit and delete items
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleLogin}
                disabled={loading || !email || !password}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowLogin(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminButton;
