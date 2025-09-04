'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import Link from 'next/link';
import { neon } from '@neondatabase/serverless';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'parent' as 'parent' | 'teacher'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fejl ved oprettelse af bruger');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Fejl ved oprettelse af bruger');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          <Box mb={3}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              Reschool
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              På vej til større trivsel
            </Typography>
          </Box>

          <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="h6" gutterBottom>
              ✅ Bruger oprettet!
            </Typography>
            <Typography variant="body2">
              Din bruger er nu oprettet med email: <strong>{formData.email}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Du kan nu logge ind med email-link.
            </Typography>
          </Alert>

          <Link href="/login" passHref>
            <Button variant="contained" fullWidth size="large">
              Log ind nu
            </Button>
          </Link>
        </Paper>
      </Box>
    );
  }

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
          <Typography variant="h5" sx={{ mt: 2 }}>
            Opret bruger
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Signup Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Fulde navn"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="role-label">Rolle</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              value={formData.role}
              label="Rolle"
              onChange={(e) => handleInputChange('role', e.target.value)}
            >
              <MenuItem value="parent">Forælder</MenuItem>
              <MenuItem value="teacher">Lærer</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
            size="large"
          >
            {loading ? 'Opretter bruger...' : 'Opret bruger'}
          </Button>

          <Box textAlign="center">
            <Link href="/login" passHref>
              <Button variant="text">
                Har du allerede en bruger? Log ind her
              </Button>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
