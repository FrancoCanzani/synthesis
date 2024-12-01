import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import supabase from '@/lib/supabase';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

declare global {
  interface Window {
    handleSignInWithGoogle: (response: { credential: string }) => void;
  }
}

export function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Define the callback function for Google One Tap sign-in
    window.handleSignInWithGoogle = async (response: {
      credential: string;
    }) => {
      try {
        // Authenticate with Supabase using the Google ID token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });

        if (error) {
          console.error('Error during Google One Tap sign-in:', error.message);
          return;
        }

        // Check if session is created successfully
        if (data.session) {
          console.log('Session established:', data.session);
          navigate('/dashboard');
        } else {
          console.warn('No session established');
        }
      } catch (err) {
        console.error('Error during sign-in:', err);
      }
    };

    // Initialize Google One Tap
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: window.handleSignInWithGoogle,
      });

      window.google.accounts.id.prompt();
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Error during Google OAuth sign-in:', error.message);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg'>
        <h1 className='text-2xl font-bold text-center'>Welcome</h1>
        <div className='space-y-4'>
          {/* Supabase Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            className='w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-lg'
          >
            <svg className='w-5 h-5' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='currentColor'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='currentColor'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='currentColor'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}