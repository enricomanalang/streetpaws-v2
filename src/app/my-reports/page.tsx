'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HydrationBoundary } from '@/lib/hydration-fix';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  FileText,
  Eye,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  Camera,
  Plus
} from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, get, query, orderByChild, equalTo, set } from 'firebase/database';

export default function MyReportsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadReports = async () => {
      if (!user || !database) return;
      setLoadingReports(true);
      
      try {
        console.log('Loading reports for user:', user.uid);
        
        // Query all report collections (pending, approved, rejected)
        const pendingQ = query(ref(database, 'reports'), orderByChild('submittedBy/uid'), equalTo(user.uid));
        const approvedQ = query(ref(database, 'approvedReports'), orderByChild('submittedBy/uid'), equalTo(user.uid));
        const rejectedQ = query(ref(database, 'rejectedReports'), orderByChild('submittedBy/uid'), equalTo(user.uid));

        console.log('Querying reports from all collections...');
        const [pendingSnap, approvedSnap, rejectedSnap] = await Promise.all([
          get(pendingQ), get(approvedQ), get(rejectedQ)
        ]);

        console.log('Query results:', {
          pending: pendingSnap.exists() ? pendingSnap.val() : null,
          approved: approvedSnap.exists() ? approvedSnap.val() : null,
          rejected: rejectedSnap.exists() ? rejectedSnap.val() : null
        });

        const toList = (snap: any) => {
          if (!snap.exists()) {
            console.log('No data in snapshot');
            return [];
          }
          const data = snap.val();
          const reports = Object.keys(data).map(k => ({ id: k, ...data[k] }));
          console.log('Converted to list:', reports);
          return reports;
        };

        // Combine all reports from different collections
        const pendingReports = toList(pendingSnap);
        const approvedReports = toList(approvedSnap);
        const rejectedReports = toList(rejectedSnap);
        
        const allReports = [
          ...pendingReports,
          ...approvedReports,
          ...rejectedReports
        ].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        console.log('All user reports:', allReports);
        setReports(allReports);
        
        // If no reports found with query, try fetching all reports and filtering client-side
        if (allReports.length === 0) {
          console.log('No reports found with query, trying fallback method...');
          try {
            const allReportsRef = ref(database, 'reports');
            const allReportsSnap = await get(allReportsRef);
            
            if (allReportsSnap.exists()) {
              const allReportsData = allReportsSnap.val();
              const userReports = Object.keys(allReportsData)
                .map(k => ({ id: k, ...allReportsData[k] }))
                .filter(report => report.submittedBy && report.submittedBy.uid === user.uid);
              
              console.log('Fallback method found reports:', userReports);
              setReports(userReports);
            }
          } catch (fallbackError) {
            console.error('Fallback method also failed:', fallbackError);
          }
        }
      } catch (e) {
        console.error('Failed loading user reports', e);
        console.error('Error details:', e);
      } finally {
        setLoadingReports(false);
      }
    };

    loadReports();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'investigating':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Eye className="w-3 h-3 mr-1" />Investigating</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <HydrationBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  console.log('=== COMPREHENSIVE DEBUG INFO ===');
                  console.log('User:', user);
                  console.log('Profile:', profile);
                  console.log('Database:', database);
                  console.log('User UID:', user?.uid);
                  
                  if (database) {
                    try {
                      // Check all possible database paths
                      const paths = ['reports', 'approvedReports', 'rejectedReports', 'lostPets', 'foundPets', 'adoptionRequests'];
                      
                      for (const path of paths) {
                        try {
                          const refPath = ref(database, path);
                          const snap = await get(refPath);
                          console.log(`\n=== ${path.toUpperCase()} ===`);
                          if (snap.exists()) {
                            const data = snap.val();
                            console.log('Data exists:', Object.keys(data).length, 'items');
                            console.log('Sample data:', Object.keys(data).slice(0, 2).map(k => ({ id: k, ...data[k] })));
                            
                            // Check if any reports belong to current user
                            const userReports = Object.keys(data)
                              .map(k => ({ id: k, ...data[k] }))
                              .filter(item => {
                                if (item.submittedBy && item.submittedBy.uid === user?.uid) return true;
                                if (item.applicant && item.applicant.uid === user?.uid) return true;
                                return false;
                              });
                            console.log(`User reports in ${path}:`, userReports.length);
                            if (userReports.length > 0) {
                              console.log('User reports found:', userReports);
                            }
                          } else {
                            console.log('No data found');
                          }
                        } catch (pathError) {
                          console.error(`Error checking ${path}:`, pathError);
                        }
                      }
                      
                      // Also check root level
                      console.log('\n=== ROOT LEVEL CHECK ===');
                      const rootRef = ref(database, '/');
                      const rootSnap = await get(rootRef);
                      if (rootSnap.exists()) {
                        const rootData = rootSnap.val();
                        console.log('Root level keys:', Object.keys(rootData));
                      }
                      
                    } catch (e) {
                      console.error('Error in comprehensive debug:', e);
                    }
                  } else {
                    console.error('Database not initialized');
                  }
                }}
                className="flex items-center"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Debug Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!user || !database) return;
                  
                  try {
                    console.log('Creating test report...');
                    const testReport = {
                      animalType: 'dog',
                      breed: 'Aspin',
                      color: 'Brown',
                      size: 'medium',
                      condition: 'neglect',
                      location: 'Test Location',
                      description: 'Test report for debugging',
                      urgency: 'medium',
                      contactInfo: '+63 912 345 6789',
                      images: [],
                      submittedBy: {
                        uid: user.uid,
                        name: profile?.name || profile?.email,
                        email: profile?.email,
                        role: profile?.role
                      },
                      status: 'pending',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      reportId: `TEST-${Date.now()}`
                    };
                    
                    const testRef = ref(database, `reports/TEST-${Date.now()}`);
                    await set(testRef, testReport);
                    console.log('Test report created successfully!');
                    alert('Test report created! Check the debug info to see if it appears.');
                  } catch (e) {
                    console.error('Error creating test report:', e);
                    alert('Error creating test report: ' + e.message);
                  }
                }}
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Test Report
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reports</h1>
            <p className="text-gray-600">View and track the status of your submitted animal abuse reports</p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reports.filter(r => r.status === 'pending' || r.status === 'investigating').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reports.filter(r => r.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reports.filter(r => r.status === 'rejected').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          {loadingReports ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your reports...</p>
                </div>
              </CardContent>
            </Card>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
                  <p className="text-gray-500 mb-4">You haven't submitted any animal abuse reports yet.</p>
                  <p className="text-sm text-gray-400 mb-6">
                    Submit your first report using the 'Report Animal Abuse' card on the dashboard.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => router.push('/report')}>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Submit Your First Report
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      <Eye className="w-4 h-4 mr-2" />
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {report.animalType} - {report.condition}
                        </h3>
                        <p className="text-sm text-gray-600">Report ID: {report.reportId}</p>
                        <p className="text-sm text-gray-600">
                          Submitted: {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Location:</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {report.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Urgency:</p>
                        <Badge variant="outline" className="capitalize">
                          {report.urgency}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>

                    {report.images && report.images.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Evidence Photos:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {report.images.slice(0, 6).map((imageUrl: string, index: number) => {
                            const isPlaceholder = imageUrl.startsWith('placeholder-');
                            const isBase64 = imageUrl.startsWith('data:image');
                            
                            return (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                  {isPlaceholder ? (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Camera className="w-8 h-8" />
                                    </div>
                                  ) : (
                                    <img
                                      src={isBase64 ? imageUrl : imageUrl}
                                      alt={`Evidence ${index + 1}`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  )}
                                  <div className="hidden w-full h-full flex items-center justify-center text-gray-400">
                                    <Camera className="w-8 h-8" />
                                  </div>
                                </div>
                                <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                                  {index + 1}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {report.reviewedBy && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          {report.status === 'approved' ? 'Approved' : 'Rejected'} by {report.reviewedBy.name} on {new Date(report.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </HydrationBoundary>
  );
}

