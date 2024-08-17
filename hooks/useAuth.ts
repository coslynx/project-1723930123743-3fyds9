import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from '@/utils/api';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Signed in successfully');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleSignUp = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/signup', { name, email, password });
      if (response.status === 201) {
        toast.success('Account created successfully');
        await handleSignIn(email, password);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || 'An error occurred during sign up');
      } else {
        toast.error('An error occurred during sign up');
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleSignIn]);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An error occurred during sign out');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handlePasswordReset = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/reset-password', { email });
      if (response.status === 200) {
        toast.success('Password reset email sent');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An error occurred while sending password reset email');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePasswordUpdate = useCallback(async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/update-password', { token, newPassword });
      if (response.status === 200) {
        toast.success('Password updated successfully');
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('An error occurred while updating password');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleOAuthSignIn = useCallback(async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast.error(`An error occurred during ${provider} sign in`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated' && router.pathname.startsWith('/dashboard')) {
      router.push('/auth/signin');
    }
  }, [status, router]);

  return {
    session,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading' || isLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handlePasswordReset,
    updatePassword: handlePasswordUpdate,
    oAuthSignIn: handleOAuthSignIn,
  };
};