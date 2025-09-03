'use client';

import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppContent from '@/components/AppContent';
import { CircularProgress, Box } from '@mui/material';

export default function Home() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/handler/sign-in');
    }
  }, [user, router]);

  if (!user) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
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
