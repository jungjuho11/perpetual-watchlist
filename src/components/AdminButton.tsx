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
        console.log('Auth state changed:', event, !!session?.user);
        
        if (session?.user) {
          try {
            // Add small delay to ensure session is fully established
            await new Promise(resolve => setTimeout(resolve, 100));
            const adminStatus = await isAdmin();
            setIsAdminUser(adminStatus);
            onAuthChange(adminStatus);
          } catch (error) {
            console.error('Error checking admin status after auth change:', error);
            setIsAdminUser(false);
            onAuthChange(false);
          }
        } else {
          // Immediately clear admin status on sign out
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setShowLogin(false);
        setEmail('');
        setPassword('');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // Clear local state immediately for better UX
      setIsAdminUser(false);
      onAuthChange(false);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        // If logout fails, recheck auth status
        checkAuthStatus();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // If logout fails, recheck auth status
      checkAuthStatus();
    } finally {
      setLoading(false);
    }
  };

  if (isAdminUser) {
    return (
      <Button
        variant="contained"
        color="primary"
        startIcon={<AdminPanelSettings />}
        onClick={handleLogout}
        size="small"
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
        size="small"
        sx={{ borderColor: 'text.secondary', color: 'text.secondary' }}
      >
        Admin?
      </Button>

      <Dialog open={showLogin} onClose={() => setShowLogin(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettings />
            Admin Login
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
