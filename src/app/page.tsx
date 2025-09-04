'use client';

import { useSession } from 'next-auth/react';
import AppContent from '@/components/AppContent';
import NextAuthSignIn from '@/components/NextAuthSignIn';
import { Box, Typography, Paper } from '@mui/material';

export default function Home() {
  const { data: session, status } = useSession();

  // Debug logging
  console.log('Page session status:', status);
  console.log('Page session data:', session);

  if (status === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="white">Indlæser...</Typography>
      </Box>
    );
  }

  if (!session) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Paper
          elevation={24}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            maxWidth: 400,
            width: '100%',
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              Reschool
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              På vej til større trivsel
            </Typography>
          </Box>

          {/* Login Form */}
          <NextAuthSignIn />
        </Paper>
      </Box>
    );
  }

  // User is logged in
  const appUser = {
    id: parseInt(session.user.id || '0'),
    name: session.user.name || session.user.email || '',
    email: session.user.email || '',
    role: session.user.role || 'parent'
  };

  return <AppContent user={appUser} onLogout={() => {
    window.location.href = '/api/auth/signout';
  }} />;
}
