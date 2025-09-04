'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

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
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Header */}
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Reschool
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            På vej til større trivsel
          </Typography>
        </Box>

        {/* Success Message */}
        <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            📧 Email sendt!
          </Typography>
          {email && (
            <Typography variant="body2" gutterBottom>
              Vi har sendt et login-link til <strong>{email}</strong>
            </Typography>
          )}
          <Typography variant="body2">
            Tjek din indbakke og klik på linket for at logge ind.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
            Linket udløber om 24 timer af sikkerhedshensyn.
          </Typography>
        </Alert>

        {/* Instructions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Næste trin:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            1. Åbn din email-app eller -browser
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            2. Find emailen fra Reschool (tjek også spam-mappen)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            3. Klik på "Log ind nu" knappen i emailen
          </Typography>
        </Box>

        {/* Back to Login */}
        <Link href="/login" passHref>
          <Button variant="outlined" fullWidth>
            Tilbage til login
          </Button>
        </Link>
      </Paper>
    </Box>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
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
    }>
      <VerifyContent />
    </Suspense>
  );
}
