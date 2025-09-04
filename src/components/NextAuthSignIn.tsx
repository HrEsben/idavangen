'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Tabs,
  Tab,
  Link,
  Divider
} from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function NextAuthSignIn() {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setEmailSent(false);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('email', { 
        email, 
        redirect: true,  // Let NextAuth handle redirect with error params
        callbackUrl: '/'
      });
      
      // If we get here without redirect, there might be an error
      if (result?.error) {
        console.log('SignIn error result:', result.error);
        setError('Fejl ved afsendelse af login-email');
      }
    } catch (err: any) {
      console.log('Sign in catch error:', err);
      setError('Fejl ved afsendelse af login-email');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', { 
        email, 
        password, 
        redirect: false,
        callbackUrl: '/'
      });
      
      console.log('Credentials sign-in result:', result);
      
      if (result?.error) {
        console.log('Credentials error:', result.error);
        if (result.error === 'CredentialsSignin') {
          setError('Forkert email eller adgangskode');
        } else {
          setError('Fejl ved login - Prøv igen');
        }
      } else if (result?.ok) {
        // Success - wait a moment for session to update, then redirect
        console.log('Login successful, redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        // Unexpected result
        console.log('Unexpected result:', result);
        setError('Forkert email eller adgangskode');
      }
    } catch (err: any) {
      console.error('Credentials sign-in catch error:', err);
      setError('Fejl ved login - Prøv igen');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Box sx={{ width: '100%' }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📧 Email sendt!
          </Typography>
          <Typography variant="body2">
            Vi har sendt et login-link til <strong>{email}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Tjek din indbakke og klik på linket for at logge ind.
          </Typography>
        </Alert>
        
        <Button 
          variant="outlined" 
          onClick={() => setEmailSent(false)}
          fullWidth
        >
          Prøv igen
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Email-link" />
          <Tab label="Email & adgangskode" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <TabPanel value={tabValue} index={0}>
        <Box component="form" onSubmit={handleEmailSignIn} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Vi sender dig et sikkert login-link på dansk
          </Typography>
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email-magic"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Sender...' : 'Send login-link'}
          </Button>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box component="form" onSubmit={handleCredentialsSignIn} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Log ind med email og adgangskode
          </Typography>
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email-creds"
            label="Email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Adgangskode"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="For test: brug 'password123' eller '123'"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Logger ind...' : 'Log ind'}
          </Button>
        </Box>
      </TabPanel>
    </Box>
  );
}
