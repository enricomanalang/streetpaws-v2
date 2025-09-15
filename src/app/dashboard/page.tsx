'use client';

import { useEffect } from 'react';

// Aggressive hydration fix for dashboard page
if (typeof window !== 'undefined') {
  const removeBisAttributes = () => {
    const allElements = document.querySelectorAll('*');
    allElements.forEach((element) => {
      const attrs = Array.from(element.attributes);
      attrs.forEach(attr => {
        if (attr.name.includes('bis') || attr.name.includes('skin')) {
          element.removeAttribute(attr.name);
        }
      });
    });
  };
  
  // Run immediately and frequently
  removeBisAttributes();
  setInterval(removeBisAttributes, 25);
  
  // Also run on DOM changes
  const observer = new MutationObserver(() => {
    removeBisAttributes();
  });
  
  if (document.body) {
    observer.observe(document.body, {
      attributes: true,
      subtree: true
    });
  }
}
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HydrationBoundary } from '@/lib/hydration-fix';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  Users, 
  Shield, 
  BarChart3, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Activity,
  Eye,
  Settings
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50" suppressHydrationWarning={true}>
        <div className="text-center" suppressHydrationWarning={true}>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto" suppressHydrationWarning={true}></div>
          <p className="mt-4 text-gray-600" suppressHydrationWarning={true}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // Mock data for statistics
  const stats = {
    totalReports: 24,
    pendingReports: 3,
    completedReports: 18,
    adoptionRequests: 7,
    activeVolunteers: 12,
    animalsHelped: 156
  };

  return (
    <HydrationBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {profile.name || profile.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Reports</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalReports}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pendingReports}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completed</p>
                  <p className="text-3xl font-bold text-green-900">{stats.completedReports}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Animals Helped</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.animalsHelped}</p>
                </div>
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.role === 'admin' && (
              <>
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Reports Management</CardTitle>
                        <CardDescription>Review and approve stray animal reports</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      <Eye className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Heart className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Adoption Requests</CardTitle>
                        <CardDescription>Manage adoption applications</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                      <Users className="w-4 h-4 mr-2" />
                      View Requests
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <BarChart3 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Analytics & Heatmap</CardTitle>
                        <CardDescription>View reports and adoption trends</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {(profile.role === 'user' || profile.role === 'volunteer') && (
              <>
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Report Animal Abuse</CardTitle>
                        <CardDescription>Report cases of animal cruelty, abuse, or animals in distress</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                      onClick={() => router.push('/report')}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Report Abuse
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">My Reports</CardTitle>
                        <CardDescription>View status of your submitted reports</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Heart className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Adoption Requests</CardTitle>
                        <CardDescription>Browse available animals and request adoption</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => router.push('/adopt')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Browse Animals
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Lost and Found Pets - Available to all users */}
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Lost Pets</CardTitle>
                    <CardDescription>Report or search for lost pets</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                  onClick={() => router.push('/lost')}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Lost Pets
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Found Pets</CardTitle>
                    <CardDescription>Report or search for found pets</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  onClick={() => router.push('/found')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Found Pets
                </Button>
              </CardContent>
            </Card>

            {profile.role === 'volunteer' && (
              <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <Shield className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Volunteer Actions</CardTitle>
                      <CardDescription>Help manage community reports</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Reports
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* User Activity - Only show for regular users */}
        {profile.role === 'user' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  My Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your Activity</h3>
                  <p className="text-gray-500">Track your submitted reports and adoption requests here.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  My Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your Requests</h3>
                  <p className="text-gray-500">View the status of your reports and adoption requests.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      </div>
    </HydrationBoundary>
  );
}
