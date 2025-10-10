'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function AdminTestPage() {
  const { user, profile, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    setDebugInfo({
      user: user ? {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      } : null,
      profile: profile,
      loading: loading,
      timestamp: new Date().toISOString()
    });
  }, [user, profile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</p>
            <p><strong>Profile:</strong> {profile ? 'Loaded' : 'Not loaded'}</p>
            <p><strong>Role:</strong> {profile?.role || 'Unknown'}</p>
            <p><strong>Name:</strong> {profile?.name || 'Unknown'}</p>
            <p><strong>Email:</strong> {profile?.email || 'Unknown'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Access</h2>
          {profile?.role === 'admin' ? (
            <div className="text-green-600">
              <p className="text-lg">✅ You have admin access!</p>
              <p className="text-sm mt-2">You can access the admin panel.</p>
            </div>
          ) : (
            <div className="text-red-600">
              <p className="text-lg">❌ You don't have admin access</p>
              <p className="text-sm mt-2">Your role is: {profile?.role || 'Unknown'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
