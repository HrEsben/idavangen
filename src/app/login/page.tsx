'use client';

import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SignIn } from '@stackframe/stack';

export default function LoginPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (user) {
    return null; // Will redirect to home
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <SignIn />
    </div>
  );
}
