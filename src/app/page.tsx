'use client';

import { useUser } from '@stackframe/stack';
import AppContent from '@/components/AppContent';
import CustomSignIn from '@/components/CustomSignIn';
import { Box, Typography, Paper } from '@mui/material';

export default function Home() {
  const user = useUser();

  if (!user) {
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
          <CustomSignIn />
        </Paper>
      </Box>
    );
  }

  // Convert Stack user to our app user format
  const appUser = {
    id: parseInt(user.id),
    name: user.displayName || user.primaryEmail || '',
    email: user.primaryEmail || '',
    role: 'parent' as const, // Default role for now, we'll enhance this later
    child_id: undefined,
    child_name: undefined,
  };

  return <AppContent user={appUser} onLogout={() => user.signOut()} />;
}
