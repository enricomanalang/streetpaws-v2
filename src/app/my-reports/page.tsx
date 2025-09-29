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
  Camera
} from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';

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
        // Query all report collections (pending, approved, rejected)
        const pendingQ = query(ref(database, 'reports'), orderByChild('submittedBy/uid'), equalTo(user.uid));
        const approvedQ = query(ref(database, 'approvedReports'), orderByChild('submittedBy/uid'), equalTo(user.uid));
        const rejectedQ = query(ref(database, 'rejectedReports'), orderByChild('submittedBy/uid'), equalTo(user.uid));

        const [pendingSnap, approvedSnap, rejectedSnap] = await Promise.all([
          get(pendingQ), get(approvedQ), get(rejectedQ)
        ]);

        const toList = (snap: any) => snap.exists() ? Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] })) : [];

        // Combine all reports from different collections
        const allReports = [
          ...toList(pendingSnap),
          ...toList(approvedSnap),
          ...toList(rejectedSnap)
        ].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        setReports(allReports);
        console.log('User reports loaded:', allReports);
      } catch (e) {
        console.error('Failed loading user reports', e);
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
                  <p className="text-gray-500 mb-6">You haven't submitted any animal abuse reports yet.</p>
                  <Button onClick={() => router.push('/report')}>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Submit Your First Report
                  </Button>
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
