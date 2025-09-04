'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import NextAuthSignIn from '@/components/NextAuthSignIn';
import { Box, Typography, Paper, Alert } from '@mui/material';
import Link from 'next/link';

function LoginContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get error from URL parameters
  const error = searchParams.get('error');
  
  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  if (session) {
    return null; // Will redirect to home
  }

  // Map NextAuth error codes to Danish messages
  const getErrorMessage = (errorCode: string | null) => {
    if (!errorCode) return null;
    
    switch (errorCode) {
      case 'Signin':
        return 'E-mail ikke fundet - Opret bruger?';
      case 'OAuthSignin':
        return 'Fejl ved login - Prøv igen';
      case 'OAuthCallback':
        return 'Fejl ved login - Prøv igen';
      case 'OAuthCreateAccount':
        return 'Kunne ikke oprette konto';
      case 'EmailCreateAccount':
        return 'E-mail ikke fundet - Opret bruger?';
      case 'Callback':
        return 'Fejl ved login - Prøv igen';
      case 'OAuthAccountNotLinked':
        return 'Email-adressen er allerede tilknyttet en anden konto';
      case 'EmailSignin':
        return 'E-mail ikke fundet - Opret bruger?';
      case 'CredentialsSignin':
        return 'Forkert email eller adgangskode';
      case 'SessionRequired':
        return 'Du skal være logget ind for at se denne side';
      default:
        return 'Der opstod en fejl - Prøv igen';
    }
  };

  const errorMessage = getErrorMessage(error);
  const isUserNotFoundError = error === 'EmailSignin' || error === 'Signin' || error === 'EmailCreateAccount';

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

        {/* Error Alert */}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {isUserNotFoundError ? (
              <Box>
                <Typography component="span">
                  E-mail ikke fundet - 
                </Typography>
                <Link 
                  href="/signup" 
                  style={{ 
                    color: 'inherit', 
                    textDecoration: 'underline',
                    fontWeight: 'bold',
                    marginLeft: '4px'
                  }}
                >
                  Opret bruger?
                </Link>
              </Box>
            ) : (
              errorMessage
            )}
          </Alert>
        )}

        {/* Login Form */}
        <NextAuthSignIn />
      </Paper>
    </Box>
  );
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  );
}
