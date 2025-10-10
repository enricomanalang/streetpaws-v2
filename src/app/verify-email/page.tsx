'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, RefreshCw, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';

interface PendingUser {
  email: string;
  name: string;
  role: 'user' | 'volunteer';
  uid: string;
}

export default function VerifyEmailPage() {
  const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, checkEmailVerified, sendVerificationEmail, completeRegistration, loginWithGoogle, loginWithFacebook } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Get pending user data from sessionStorage
    const pendingUserData = sessionStorage.getItem('pendingUser');
    if (pendingUserData) {
      setPendingUser(JSON.parse(pendingUserData));
    } else {
      // No pending user, redirect to signup
      router.push('/signup');
    }
  }, [router]);

  useEffect(() => {
    // Check verification status periodically
    const checkVerification = async () => {
      if (user && pendingUser) {
        setIsChecking(true);
        try {
          const verified = await checkEmailVerified();
          if (verified) {
            setIsVerified(true);
            setSuccess('Email verified successfully!');
            
            // Complete registration by saving profile to database
            await completeRegistration(pendingUser.name, pendingUser.role);
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              if (pendingUser.role === 'admin') {
                router.push('/admin');
              } else {
                router.push('/dashboard');
              }
            }, 2000);
          }
        } catch (err) {
          console.error('Error checking verification:', err);
        } finally {
          setIsChecking(false);
        }
      }
    };

    // Check immediately
    checkVerification();

    // Check every 3 seconds
    const interval = setInterval(checkVerification, 3000);

    return () => clearInterval(interval);
  }, [user, pendingUser, checkEmailVerified, completeRegistration, router]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setError('');
    try {
      await sendVerificationEmail();
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    try {
      await loginWithFacebook();
    } catch (err: any) {
      setError(err.message || 'Facebook sign-in failed');
    }
  };

  if (!pendingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">StreetPaws</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isVerified ? 'Email Verified!' : 'Verify Your Email'}
          </h1>
          <p className="text-gray-600">
            {isVerified 
              ? 'Your account has been successfully verified'
              : 'We sent a verification link to your email address'
            }
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {isVerified ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Welcome to StreetPaws!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your email has been verified and your account is ready to use.
                  </p>
                  <p className="text-sm text-gray-500">
                    Redirecting you to your dashboard...
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We sent a verification link to:
                  </p>
                  <p className="font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                    {pendingUser.email}
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {error}
                      {error.includes('too-many-requests') && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Alternative solutions:</p>
                          <ul className="text-sm space-y-1">
                            <li>• Use Google or Facebook login instead</li>
                            <li>• Wait 1 hour and try again</li>
                            <li>• Check your spam folder for previous emails</li>
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isResending ? (
                      <div className="flex items-center">
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Resend Verification Email
                      </div>
                    )}
                  </Button>

                  <Button
                    onClick={() => {
                      setIsChecking(true);
                      // The useEffect will handle the check
                    }}
                    disabled={isChecking}
                    variant="outline"
                    className="w-full h-12 text-base"
                  >
                    {isChecking ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                        Checking...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        I've Verified My Email
                      </div>
                    )}
                  </Button>
                </div>

                {/* Social Login Alternative */}
                <div className="border-t pt-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-500 mb-3">
                      Having trouble with email verification?
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      Use social login instead:
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={handleGoogleLogin}
                      className="w-full h-10 text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>

                    <Button
                      onClick={handleFacebookLogin}
                      className="w-full h-10 text-sm bg-[#1877F2] text-white hover:bg-[#166FE5]"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Continue with Facebook
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">
                    Didn't receive the email? Check your spam folder or try resending.
                  </p>
                  <Link 
                    href="/signup" 
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Sign Up
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Having trouble? Contact our{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700">
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
