'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert,
  Paper
} from '@mui/material';

export default function EmailVerificationPrompt() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Box textAlign="center">
        <Typography variant="h5" gutterBottom color="primary">
          ✉️ Bekræft din email
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          For at bruge Reschool skal du bekræfte din email-adresse.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Vigtig besked:</strong> Du vil modtage en bekræftelsesemail fra "Stack Auth" eller "idavangen-db". 
            Dette er normalt - klik blot på bekræftelseslinket i emailen selvom den er på engelsk.
          </Typography>
        </Alert>

        {showInfo && (
          <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>📧 Tjek din email!</strong><br/>
              Emailen kan være på engelsk og kommer fra Stack Auth systemet. 
              Klik på "Verify my email" knappen i emailen.
            </Typography>
          </Alert>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={() => setShowInfo(true)}
          sx={{ mb: 2 }}
        >
          Jeg forstår - vis instruktioner
        </Button>

        <Typography variant="body2" color="text.secondary">
          Reschool - På vej til større trivsel
        </Typography>
      </Box>
    </Paper>
  );
}
