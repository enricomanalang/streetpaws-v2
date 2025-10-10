'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
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
  const { user, checkEmailVerified, sendVerificationEmail, completeRegistration } = useAuth();
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
                    <AlertDescription>{error}</AlertDescription>
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
