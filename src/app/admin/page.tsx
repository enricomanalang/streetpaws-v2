'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// Aggressive hydration fix for admin page
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HeatMap from '@/components/HeatMap';
import { AdminDashboardCharts } from '@/components/AdminCharts';
import { ref, onValue, off, update, get, set, remove } from 'firebase/database';
// import { collection, onSnapshot, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { database } from '@/lib/firebase';
import { 
  Shield, 
  FileText, 
  Heart, 
  BarChart3, 
  Calendar,
  Activity,
  Eye,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Menu,
  X,
  Search,
  DollarSign,
  UserPlus,
  Map,
  LogOut,
  Camera
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState<Array<{
    id: string;
    [key: string]: any;
  }>>([]);
  const [approvedReports, setApprovedReports] = useState<Array<{
    id: string;
    [key: string]: any;
  }>>([]);
  const [rejectedReports, setRejectedReports] = useState<Array<{
    id: string;
    [key: string]: any;
  }>>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingApprovedReports, setLoadingApprovedReports] = useState(false);
  const [loadingRejectedReports, setLoadingRejectedReports] = useState(false);
  const [processingReports, setProcessingReports] = useState<Set<string>>(new Set());
  const [lostPets, setLostPets] = useState<Array<{
    id: string;
    [key: string]: any;
  }>>([]);
  const [loadingLostPets, setLoadingLostPets] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && profile?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, profile, router]);

  // Fetch reports when admin tab is active
  useEffect(() => {
    if (activeTab === 'abuse-reports' && database) {
      setLoadingReports(true);
      console.log('Fetching abuse reports from Realtime Database...');
      
      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log('Timeout reached, stopping loading...');
        setLoadingReports(false);
      }, 10000); // 10 second timeout
      
      const reportsRef = ref(database, 'reports');
      
      const unsubscribe = onValue(reportsRef, (snapshot) => {
        clearTimeout(timeout); // Clear timeout when data is received
        console.log('Reports snapshot received');
        
        if (snapshot.exists()) {
          const reportsData = snapshot.val();
          const reportsList = Object.keys(reportsData).map(key => ({
            id: key,
            ...reportsData[key]
          }));
          console.log('Reports list:', reportsList);
          setReports(reportsList);
        } else {
          console.log('No reports found');
          setReports([]);
        }
        setLoadingReports(false);
      }, (error) => {
        clearTimeout(timeout); // Clear timeout on error
        console.error('Error fetching reports:', error);
        setLoadingReports(false);
      });

      return () => {
        clearTimeout(timeout);
        off(reportsRef, 'value', unsubscribe);
      };
    } else if (activeTab !== 'abuse-reports') {
      // Reset reports when switching away from abuse-reports
      setReports([]);
      setLoadingReports(false);
    }
  }, [activeTab]);

  // Fetch approved reports when approved-reports tab is active
  useEffect(() => {
    if (activeTab === 'approved-reports' && database) {
      setLoadingApprovedReports(true);
      console.log('Fetching approved reports from Realtime Database...');
      
      const timeout = setTimeout(() => {
        console.log('Timeout reached, stopping loading...');
        setLoadingApprovedReports(false);
      }, 10000);
      
      const approvedReportsRef = ref(database, 'approvedReports');
      
      const unsubscribe = onValue(approvedReportsRef, (snapshot) => {
        clearTimeout(timeout);
        console.log('Approved reports snapshot received');
        
        if (snapshot.exists()) {
          const reportsData = snapshot.val();
          const reportsList = Object.keys(reportsData).map(key => ({
            id: key,
            ...reportsData[key]
          }));
          console.log('Approved reports list:', reportsList);
          setApprovedReports(reportsList);
        } else {
          console.log('No approved reports found');
          setApprovedReports([]);
        }
        setLoadingApprovedReports(false);
      }, (error) => {
        clearTimeout(timeout);
        console.error('Error fetching approved reports:', error);
        setLoadingApprovedReports(false);
      });

      return () => {
        clearTimeout(timeout);
        off(approvedReportsRef, 'value', unsubscribe);
      };
    } else if (activeTab !== 'approved-reports') {
      setApprovedReports([]);
      setLoadingApprovedReports(false);
    }
  }, [activeTab]);

  // Fetch rejected reports when rejected-reports tab is active
  useEffect(() => {
    if (activeTab === 'rejected-reports' && database) {
      setLoadingRejectedReports(true);
      console.log('Fetching rejected reports from Realtime Database...');
      
      const timeout = setTimeout(() => {
        console.log('Timeout reached, stopping loading...');
        setLoadingRejectedReports(false);
      }, 10000);
      
      const rejectedReportsRef = ref(database, 'rejectedReports');
      
      const unsubscribe = onValue(rejectedReportsRef, (snapshot) => {
        clearTimeout(timeout);
        console.log('Rejected reports snapshot received');
        
        if (snapshot.exists()) {
          const reportsData = snapshot.val();
          const reportsList = Object.keys(reportsData).map(key => ({
            id: key,
            ...reportsData[key]
          }));
          console.log('Rejected reports list:', reportsList);
          setRejectedReports(reportsList);
        } else {
          console.log('No rejected reports found');
          setRejectedReports([]);
        }
        setLoadingRejectedReports(false);
      }, (error) => {
        clearTimeout(timeout);
        console.error('Error fetching rejected reports:', error);
        setLoadingRejectedReports(false);
      });

      return () => {
        clearTimeout(timeout);
        off(rejectedReportsRef, 'value', unsubscribe);
      };
    } else if (activeTab !== 'rejected-reports') {
      setRejectedReports([]);
      setLoadingRejectedReports(false);
    }
  }, [activeTab]);

  // Fetch lost pets when lost-reports tab is active
  useEffect(() => {
    if (activeTab === 'lost-reports' && database) {
      setLoadingLostPets(true);
      const lostPetsRef = ref(database, 'lostPets');
      
      const unsubscribe = onValue(lostPetsRef, (snapshot) => {
        if (snapshot.exists()) {
          const pets = snapshot.val();
          const petsList = Object.keys(pets).map(key => ({
            id: key,
            ...pets[key]
          }));
          // Show all for moderation; filtering handled in UI controls
          setLostPets(petsList);
        } else {
          setLostPets([]);
        }
        setLoadingLostPets(false);
      }, (error) => {
        console.error('Error fetching lost pets:', error);
        setLoadingLostPets(false);
      });

      return () => {
        off(lostPetsRef, 'value', unsubscribe);
      };
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    if (!database) {
      console.error('Database not initialized');
      alert('Database connection error. Please refresh the page.');
      return;
    }
    
    if (!user || !profile) {
      console.error('User not authenticated');
      alert('Authentication error. Please log in again.');
      return;
    }
    
    console.log(`Attempting to update report ${reportId} to status: ${status}`);
    
    try {
      // Get the current report data
      const reportRef = ref(database, `reports/${reportId}`);
      const snapshot = await get(reportRef);
      
      if (!snapshot.exists()) {
        console.error('Report not found:', reportId);
        alert('Report not found. It may have been already processed.');
        return;
      }
      
      const reportData = snapshot.val();
      console.log('Current report data:', reportData);
      
      // Add review information
      const updatedReportData = {
        ...reportData,
        status,
        updatedAt: new Date().toISOString(),
        reviewedBy: {
          uid: user.uid,
          name: profile.name || profile.email,
          email: profile.email
        }
      };
      
      console.log('Updated report data:', updatedReportData);
      
      // Move to appropriate collection based on status
      if (status === 'approved') {
        console.log('Moving report to approved collection...');
        
        // Move to approved reports
        const approvedRef = ref(database, `approvedReports/${reportId}`);
        await set(approvedRef, updatedReportData);
        console.log('Report added to approved collection');
        
        // Remove from pending reports
        await remove(reportRef);
        console.log('Report removed from pending collection');
        
        alert(`Report ${reportId} has been approved and is now visible on the heatmap!`);
        console.log(`Report ${reportId} moved to approved reports`);
        
      } else if (status === 'rejected') {
        console.log('Moving report to rejected collection...');
        
        // Move to rejected reports
        const rejectedRef = ref(database, `rejectedReports/${reportId}`);
        await set(rejectedRef, updatedReportData);
        console.log('Report added to rejected collection');
        
        // Remove from pending reports
        await remove(reportRef);
        console.log('Report removed from pending collection');
        
        alert(`Report ${reportId} has been rejected.`);
        console.log(`Report ${reportId} moved to rejected reports`);
        
      } else {
        console.log('Updating report status in place...');
        
        // For investigating status, just update in place
        await update(reportRef, {
          status,
          updatedAt: new Date().toISOString(),
          reviewedBy: {
            uid: user.uid,
            name: profile.name || profile.email,
            email: profile.email
          }
        });
        
        alert(`Report ${reportId} status updated to ${status}`);
        console.log(`Report ${reportId} status updated to ${status}`);
      }
      
      console.log('Report status update completed successfully');
      
    } catch (error) {
      console.error('Error updating report status:', error);
      alert(`Error updating report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateLostPetStatus = async (petId: string, status: string) => {
    if (!database) return;
    
    try {
      const petRef = ref(database, `lostPets/${petId}`);
      await update(petRef, {
        status,
        updatedAt: new Date().toISOString(),
        reviewedBy: {
          uid: user?.uid,
          name: profile?.name || profile?.email,
          email: profile?.email
        }
      });
      console.log(`Lost pet ${petId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating lost pet status:', error);
    }
  };

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

  if (!user || !profile || profile.role !== 'admin') {
    return null;
  }


  // Function to render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Admin Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Pending Reports</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {reports.filter(r => r.status === 'pending').length}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Lost Pets (pending)</p>
                      <p className="text-3xl font-bold text-yellow-900">
                        {lostPets.filter(p => p.status === 'pending').length}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Completed Reports</p>
                      <p className="text-3xl font-bold text-green-900">
                        {reports.filter(r => r.status === 'approved').length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Total Reports</p>
                      <p className="text-3xl font-bold text-red-900">
                        {reports.length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <AdminDashboardCharts />

            {/* Recent Activity & Upcoming Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.length > 0 ? (
                      reports.slice(0, 3).map((report, index) => (
                        <div key={report.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                          report.status === 'approved' ? 'bg-green-50' :
                          report.status === 'pending' ? 'bg-yellow-50' :
                          'bg-blue-50'
                        }`}>
                          {report.status === 'approved' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : report.status === 'pending' ? (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <Heart className="w-5 h-5 text-blue-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {report.status === 'approved' ? 'Report completed' :
                               report.status === 'pending' ? 'New report pending review' :
                               'Report updated'} - {report.animalType}
                            </p>
                            <p className="text-xs text-gray-500">
                              {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Upcoming Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.filter(r => r.status === 'pending').length > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {reports.filter(r => r.status === 'pending').length} pending reports need attention
                          </p>
                          <p className="text-xs text-gray-500">Review and process reports</p>
                        </div>
                      </div>
                    )}
                    
                    {lostPets.filter(p => p.status === 'pending').length > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {lostPets.filter(p => p.status === 'pending').length} lost pet reports need approval
                          </p>
                          <p className="text-xs text-gray-500">Help reunite lost pets</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Review system reports</p>
                        <p className="text-xs text-gray-500">Check dashboard analytics</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 'abuse-reports':
        return (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Abuse Reports</CardTitle>
              <CardDescription>Review and investigate animal abuse reports submitted by users</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingReports ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Abuse Reports Found</h3>
                  <p className="text-gray-500 mb-4">No abuse reports have been submitted yet.</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-blue-800 mb-3">
                      <strong>Note:</strong> Abuse reports are submitted through the Report page and stored in Realtime Database.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        console.log('Testing Realtime Database connection...');
                        console.log('Database instance:', database);
                        if (database) {
                          console.log('Realtime Database is available');
                        } else {
                          console.log('Realtime Database is not available');
                        }
                      }}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {report.animalType} - {report.condition}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Report ID: {report.reportId}
                            </p>
                            <p className="text-sm text-gray-500">
                              Submitted by: {report.submittedBy?.name} on {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant={report.status === 'pending' ? 'destructive' : 
                                   report.status === 'approved' ? 'default' : 'secondary'}
                          >
                            {report.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Location:</p>
                            <p className="text-sm text-gray-600">{report.location}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Urgency:</p>
                            <Badge variant="outline" className="capitalize">
                              {report.urgency}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">Description:</p>
                          <p className="text-sm text-gray-600">{report.description}</p>
                        </div>
                        
                        {/* Display Images if available */}
                        {report.images && report.images.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Evidence Photos:</p>
                            
                            
        {/* Check if all images are placeholders */}
        {report.images.every((img: string) => img.startsWith('placeholder-')) && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This report was submitted before the image system was updated. 
              Images are not available for display. New reports will show images properly.
            </p>
          </div>
        )}
        
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {report.images.map((imageUrl: string, index: number) => {
                                // Check if it's a placeholder URL or not a valid image URL
                                const isPlaceholder = imageUrl.startsWith('placeholder-');
                                const isBase64 = imageUrl.startsWith('data:image');
                                const isSupabase = imageUrl.includes('supabase.co');
                                const isValidImage = isBase64 || isSupabase || (!isPlaceholder && (imageUrl.startsWith('http') || imageUrl.startsWith('https')));
                                
                                return (
                                  <div key={index} className="relative">
                                    {!isValidImage ? (
                                      <div className="w-full h-24 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                                        <div className="text-center">
                                          <div className="w-8 h-8 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">{index + 1}</span>
                                          </div>
                                          <p className="text-xs text-gray-500">
                                            {isPlaceholder ? 'Image Not Available' : 'Invalid Image'}
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      <img
                                        src={imageUrl}
                                        alt={`Evidence ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                        onError={(e) => {
                                          console.error('Image failed to load:', imageUrl);
                                          // Replace with placeholder on error
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          const placeholder = target.nextElementSibling as HTMLElement;
                                          if (placeholder) {
                                            placeholder.style.display = 'block';
                                          }
                                        }}
                                        onClick={() => {
                                          // Open image in new tab for full view
                                          const newWindow = window.open();
                                          if (newWindow) {
                                            newWindow.document.write(`
                                              <html>
                                                <head><title>Evidence Photo ${index + 1}</title></head>
                                                <body style="margin:0; padding:20px; background:#f5f5f5; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                                                  <img src="${imageUrl}" style="max-width:100%; max-height:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15);" />
                                                </body>
                                              </html>
                                            `);
                                          }
                                        }}
                                      />
                                    )}
                                    {/* Fallback placeholder (hidden by default) */}
                                    <div className="w-full h-24 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center" style={{display: 'none'}}>
                                      <div className="text-center">
                                        <div className="w-8 h-8 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                                          <span className="text-white text-xs font-bold">{index + 1}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Failed to Load</p>
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
                        
                        <div className="flex justify-end space-x-2">
                          {/* Show approve/reject buttons for pending and investigating reports */}
                          {(report.status === 'pending' || report.status === 'investigating') && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateReportStatus(report.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateReportStatus(report.id, 'rejected')}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {/* Show investigate button only for pending reports */}
                          {report.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReportStatus(report.id, 'investigating')}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Investigate
                            </Button>
                          )}
                          
                          {/* Show status for completed reports */}
                          {report.status === 'approved' && (
                            <div className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approved
                            </div>
                          )}
                          
                          {report.status === 'rejected' && (
                            <div className="flex items-center text-red-600 text-sm">
                              <X className="w-4 h-4 mr-1" />
                              Rejected
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case 'approved-reports':
        return (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Approved Reports</CardTitle>
              <CardDescription>View approved animal abuse reports that are now visible on the heatmap</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingApprovedReports ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading approved reports...</p>
                </div>
              ) : approvedReports.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Reports</h3>
                  <p className="text-gray-600">No reports have been approved yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedReports.map((report) => (
                    <Card key={report.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {report.animalType} - {report.condition}
                            </h3>
                            <p className="text-sm text-gray-600">Report ID: {report.reportId}</p>
                            <p className="text-sm text-gray-600">
                              Submitted by: {report.submittedBy?.email} on {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Approved
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">Location:</p>
                          <p className="text-sm text-gray-600">{report.location}</p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">Description:</p>
                          <p className="text-sm text-gray-600">{report.description}</p>
                        </div>
                        
                        {report.images && report.images.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Evidence Photos:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {report.images.map((imageUrl: string, index: number) => {
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
                        
                        <div className="flex justify-end space-x-2">
                          <div className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approved by {report.reviewedBy?.name} on {new Date(report.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case 'rejected-reports':
        return (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Rejected Reports</CardTitle>
              <CardDescription>View rejected animal abuse reports that were not approved</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRejectedReports ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading rejected reports...</p>
                </div>
              ) : rejectedReports.length === 0 ? (
                <div className="text-center py-12">
                  <X className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Rejected Reports</h3>
                  <p className="text-gray-600">No reports have been rejected yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rejectedReports.map((report) => (
                    <Card key={report.id} className="border-l-4 border-l-gray-500">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {report.animalType} - {report.condition}
                            </h3>
                            <p className="text-sm text-gray-600">Report ID: {report.reportId}</p>
                            <p className="text-sm text-gray-600">
                              Submitted by: {report.submittedBy?.email} on {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                            Rejected
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">Location:</p>
                          <p className="text-sm text-gray-600">{report.location}</p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">Description:</p>
                          <p className="text-sm text-gray-600">{report.description}</p>
                        </div>
                        
                        {report.images && report.images.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Evidence Photos:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {report.images.map((imageUrl: string, index: number) => {
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
                        
                        <div className="flex justify-end space-x-2">
                          <div className="flex items-center text-gray-600 text-sm">
                            <X className="w-4 h-4 mr-1" />
                            Rejected by {report.reviewedBy?.name} on {new Date(report.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case 'lost-reports':
        return (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Lost Pet Reports</CardTitle>
              <CardDescription>Review and manage lost pet reports submitted by users</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLostPets ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading lost pet reports...</p>
                </div>
              ) : lostPets.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Lost Pet Reports</h3>
                  <p className="text-gray-500">No lost pet reports have been submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lostPets.map((pet) => (
                    <Card key={pet.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {pet.petName} - {pet.animalType}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Report ID: {pet.reportId}
                            </p>
                            <p className="text-sm text-gray-500">
                              Submitted by: {pet.submittedBy?.name} on {new Date(pet.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant={pet.status === 'pending' ? 'destructive' :
                                   pet.status === 'approved' ? 'default' :
                                   pet.status === 'rejected' ? 'secondary' : 'secondary'}
                          >
                            {pet.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Pet Details:</p>
                            <p className="text-sm text-gray-600">Breed: {pet.breed}</p>
                            <p className="text-sm text-gray-600">Color: {pet.color}</p>
                            <p className="text-sm text-gray-600">Size: {pet.size}</p>
                            <p className="text-sm text-gray-600">Age: {pet.age}</p>
                            <p className="text-sm text-gray-600">Gender: {pet.gender}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Last Seen:</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {pet.lastSeenLocation}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(pet.lastSeenDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">Contact: {pet.contactInfo}</p>
                          </div>
                        </div>
                        
                        {pet.description && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                            <p className="text-sm text-gray-600">{pet.description}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {pet.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateLostPetStatus(pet.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateLostPetStatus(pet.id, 'rejected')}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {pet.status === 'approved' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateLostPetStatus(pet.id, 'found')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark as Found
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateLostPetStatus(pet.id, 'closed')}
                              >
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                Close Report
                              </Button>
                            </>
                          )}
                          {pet.status === 'found' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateLostPetStatus(pet.id, 'approved')}
                            >
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Reopen Report
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`mailto:${pet.contactInfo}?subject=Lost Pet Report - ${pet.petName}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Contact Owner
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case 'found-reports':
        return (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Found Pet Reports</CardTitle>
              <CardDescription>Review and verify found pet reports submitted by users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Found Pet Reports</h3>
                <p className="text-gray-500">Review and verify found pet reports submitted by users.</p>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Admin Features:</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• View all submitted found pet reports</li>
                    <li>• Verify and approve reports</li>
                    <li>• Update report status</li>
                    <li>• Contact finders</li>
                    <li>• Match with lost pet reports</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'adopt':
        return (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Adoption Requests</CardTitle>
              <CardDescription>Review and approve adoption requests from users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Adoption Requests</h3>
                <p className="text-gray-500">Review and approve adoption requests submitted by users.</p>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Admin Features:</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• View all adoption requests</li>
                    <li>• Review applicant information</li>
                    <li>• Approve or reject applications</li>
                    <li>• Schedule adoption meetings</li>
                    <li>• Track adoption status</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'volunteers':
        return (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Volunteer Management</CardTitle>
              <CardDescription>Manage volunteers and their activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Volunteers Section</h3>
                <p className="text-gray-500">This section is ready for your volunteer management functionality.</p>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'donors':
        return (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Donor Management</CardTitle>
              <CardDescription>Manage donors and donations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Donors Section</h3>
                <p className="text-gray-500">This section is ready for your donor management functionality.</p>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'heatmap':
        return <HeatMap />;
      
      case 'report':
        return (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Report Generation</CardTitle>
              <CardDescription>Generate and manage system reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reports Section</h3>
                <p className="text-gray-500">This section is ready for your report generation functionality.</p>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col h-screen`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">STREETPAWS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'dashboard' 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('abuse-reports')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'abuse-reports' 
                  ? 'text-white bg-gradient-to-r from-red-600 to-orange-600' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <AlertCircle className="w-5 h-5 mr-3" />
              Pending Reports
            </button>
            <button 
              onClick={() => setActiveTab('approved-reports')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'approved-reports' 
                  ? 'text-white bg-gradient-to-r from-green-600 to-emerald-600' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <CheckCircle className="w-5 h-5 mr-3" />
              Approved Reports
            </button>
            <button 
              onClick={() => setActiveTab('rejected-reports')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'rejected-reports' 
                  ? 'text-white bg-gradient-to-r from-gray-600 to-slate-600' 
                  : 'text-gray-700 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <X className="w-5 h-5 mr-3" />
              Rejected Reports
            </button>
            <button 
              onClick={() => setActiveTab('lost-reports')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'lost-reports' 
                  ? 'text-white bg-gradient-to-r from-orange-600 to-red-600' 
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <AlertCircle className="w-5 h-5 mr-3" />
              Lost Reports
            </button>
            <button 
              onClick={() => setActiveTab('found-reports')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'found-reports' 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Search className="w-5 h-5 mr-3" />
              Found Reports
            </button>
            <button 
              onClick={() => setActiveTab('adopt')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'adopt' 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Heart className="w-5 h-5 mr-3" />
              Adopt
            </button>
            <button 
              onClick={() => setActiveTab('volunteers')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'volunteers' 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Volunteers
            </button>
            <button 
              onClick={() => setActiveTab('donors')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'donors' 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <DollarSign className="w-5 h-5 mr-3" />
              Donors
            </button>
            <button 
              onClick={() => setActiveTab('heatmap')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'heatmap' 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Map className="w-5 h-5 mr-3" />
              Heat Map
            </button>
            <button 
              onClick={() => setActiveTab('report')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'report' 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <FileText className="w-5 h-5 mr-3" />
              Report
            </button>
          </div>
        </nav>
        
        <div className="mt-auto p-3 border-t border-gray-200">
          <div className="space-y-1">
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Shield className="w-5 h-5 mr-3" />
              Admin
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              LogOut
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="ml-64 min-h-screen overflow-y-auto">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">STREETPAWS</span>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Main content area */}
        <main className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeTab === 'dashboard' && 'Admin Dashboard'}
              {activeTab === 'abuse-reports' && 'Abuse Reports Management'}
              {activeTab === 'lost-reports' && 'Lost Reports Management'}
              {activeTab === 'found-reports' && 'Found Reports Management'}
              {activeTab === 'adopt' && 'Adoption Management'}
              {activeTab === 'volunteers' && 'Volunteer Management'}
              {activeTab === 'donors' && 'Donor Management'}
              {activeTab === 'heatmap' && 'Heat Map Analytics'}
              {activeTab === 'report' && 'Report Generation'}
            </h1>
            <p className="text-gray-600">Welcome back, {profile.name || profile.email}</p>
          </div>

          {/* Dynamic Content */}
          {renderContent()}
        </main>
      </div>
    </div>

  );
}

