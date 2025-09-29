'use client';

import { useEffect, useMemo, useState } from 'react';

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
  Settings,
  Plus
} from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [myReports, setMyReports] = useState<any[]>([]);
  const [myLost, setMyLost] = useState<any[]>([]);
  const [myFound, setMyFound] = useState<any[]>([]);
  const [myAdoptions, setMyAdoptions] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !database) return;
      try {
        // Query all report collections (pending, approved, rejected)
        const pendingQ = query(ref(database, 'reports'), orderByChild('submittedBy/uid'), equalTo(user.uid));
        const approvedQ = query(ref(database, 'approvedReports'), orderByChild('submittedBy/uid'), equalTo(user.uid));
        const rejectedQ = query(ref(database, 'rejectedReports'), orderByChild('submittedBy/uid'), equalTo(user.uid));
        
        // Other collections
        const lostQ = query(ref(database, 'lostPets'), orderByChild('submittedBy/uid'), equalTo(user.uid));
        const foundQ = query(ref(database, 'foundPets'), orderByChild('submittedBy/uid'), equalTo(user.uid));
        const adoptQ = query(ref(database, 'adoptionRequests'), orderByChild('applicant/uid'), equalTo(user.uid));

        const [pendingSnap, approvedSnap, rejectedSnap, lSnap, fSnap, aSnap] = await Promise.all([
          get(pendingQ), get(approvedQ), get(rejectedQ), get(lostQ), get(foundQ), get(adoptQ)
        ]);

        const toList = (snap: any) => snap.exists() ? Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] })) : [];

        // Combine all reports from different collections
        const allReports = [
          ...toList(pendingSnap),
          ...toList(approvedSnap),
          ...toList(rejectedSnap)
        ].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        setMyReports(allReports);
        setMyLost(toList(lSnap).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
        setMyFound(toList(fSnap).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
        setMyAdoptions(toList(aSnap).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
        
        console.log('User reports loaded:', allReports);
      } catch (e) {
        console.error('Failed loading dashboard activity', e);
      }
    };
    loadData();
  }, [user]);

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
                        <CardDescription>
                          {myReports.length === 0 
                            ? "No reports submitted yet" 
                            : `${myReports.length} report${myReports.length > 1 ? 's' : ''} submitted`
                          }
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {myReports.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-gray-400 mb-2">
                          <FileText className="w-12 h-12 mx-auto" />
                        </div>
                        <p className="text-sm text-gray-500 mb-3">No reports submitted yet</p>
                        <p className="text-xs text-gray-400">Submit your first report using the "Report Animal Abuse" card</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <div className="flex justify-between items-center mb-2">
                            <span>Pending: {myReports.filter(r => r.status === 'pending' || r.status === 'investigating').length}</span>
                            <span className="text-yellow-600">⏳</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span>Approved: {myReports.filter(r => r.status === 'approved').length}</span>
                            <span className="text-green-600">✅</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Rejected: {myReports.filter(r => r.status === 'rejected').length}</span>
                            <span className="text-red-600">❌</span>
                          </div>
                        </div>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => {
                            // Show a simple modal or navigate to a reports page
                            alert(`You have ${myReports.length} reports:\n\n` +
                              `• ${myReports.filter(r => r.status === 'pending' || r.status === 'investigating').length} Pending/Investigating\n` +
                              `• ${myReports.filter(r => r.status === 'approved').length} Approved (visible on map)\n` +
                              `• ${myReports.filter(r => r.status === 'rejected').length} Rejected\n\n` +
                              `Your latest report: ${myReports[0]?.animalType || 'N/A'} - ${myReports[0]?.condition || 'N/A'}`
                            );
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Report Status
                        </Button>
                      </div>
                    )}
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
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest submissions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {myReports.length + myLost.length + myFound.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
                    <p className="text-gray-500 mb-4">Start by submitting a report or posting about lost/found pets</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button size="sm" variant="outline" onClick={() => router.push('/report')}>
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Report Abuse
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => router.push('/lost')}>
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Lost Pet
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Show total counts */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-red-50 rounded-lg">
                        <div className="text-lg font-semibold text-red-600">{myReports.length}</div>
                        <div className="text-xs text-red-500">Reports</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded-lg">
                        <div className="text-lg font-semibold text-orange-600">{myLost.length}</div>
                        <div className="text-xs text-orange-500">Lost</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-600">{myFound.length}</div>
                        <div className="text-xs text-green-500">Found</div>
                      </div>
                    </div>
                    
                    {/* Recent submissions */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {myReports.slice(0, 3).map((r) => (
                        <div key={r.id} className="flex items-center justify-between border rounded-md p-3 hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Abuse Report • {r.animalType || 'Animal'}</p>
                              <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            r.status === 'approved' ? 'bg-green-100 text-green-700' :
                            r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                      {myLost.slice(0, 2).map((r) => (
                        <div key={r.id} className="flex items-center justify-between border rounded-md p-3 hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Lost Pet • {r.petName || r.animalType}</p>
                              <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <span className="text-xs capitalize px-2 py-1 rounded bg-gray-100 text-gray-700">{r.status}</span>
                        </div>
                      ))}
                      {myFound.slice(0, 2).map((r) => (
                        <div key={r.id} className="flex items-center justify-between border rounded-md p-3 hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Found Pet • {r.animalType}</p>
                              <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <span className="text-xs capitalize px-2 py-1 rounded bg-gray-100 text-gray-700">{r.status}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* View all button */}
                    {(myReports.length + myLost.length + myFound.length) > 5 && (
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        <Eye className="w-4 h-4 mr-2" />
                        View All Activity
                      </Button>
                    )}
                  </div>
                )}
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
                {myAdoptions.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your Requests</h3>
                    <p className="text-gray-500">No adoption requests yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myAdoptions.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center justify-between border rounded-md p-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Adoption request • {r.animalInfo?.breed || r.animalInfo?.animalType}</p>
                          <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</p>
                        </div>
                        <span className="text-xs capitalize px-2 py-1 rounded bg-gray-100 text-gray-700">{r.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      </div>
    </HydrationBoundary>
  );
}
