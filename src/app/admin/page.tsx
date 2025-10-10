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
import DonationManagement from '@/components/DonationManagement';
import DonorsManagement from '@/components/DonorsManagement';
import Inventory from '@/components/Inventory';
import { ref, onValue, off, update, get, set, remove } from 'firebase/database';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { database, firestore } from '@/lib/firebase';
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
  Camera,
  Mail,
  TrendingUp,
  Users,
  Download,
  Filter,
  Trash2,
  Edit,
  Plus,
  Settings,
  Bell,
  Home,
  Database,
  RefreshCw
} from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AdminDashboard() {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState<any[]>([]);
  const [approvedReports, setApprovedReports] = useState<any[]>([]);
  const [rejectedReports, setRejectedReports] = useState<any[]>([]);
  const [lostPets, setLostPets] = useState<any[]>([]);
  const [foundPets, setFoundPets] = useState<any[]>([]);
  const [adoptionRequests, setAdoptionRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
    totalLostPets: 0,
    totalFoundPets: 0,
    totalAdoptionRequests: 0,
    recentActivity: 0
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && user && profile && profile.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, profile, loading, router]);

  // Fetch data from Firebase
  useEffect(() => {
    if (!database) {
      console.log('Database not available');
      return;
    }

    const fetchData = async () => {
      try {
        console.log('Fetching admin dashboard data...');
        
        // Fetch all data in parallel
        const [reportsSnap, approvedSnap, rejectedSnap, lostSnap, foundSnap, adoptSnap] = await Promise.all([
          get(ref(database, 'reports')),
          get(ref(database, 'approvedReports')),
          get(ref(database, 'rejectedReports')),
          get(ref(database, 'lostPets')),
          get(ref(database, 'foundPets')),
          get(ref(database, 'adoptionRequests'))
        ]);

        // Process reports
        const reportsData = reportsSnap.exists() ? Object.values(reportsSnap.val()) : [];
        const approvedData = approvedSnap.exists() ? Object.values(approvedSnap.val()) : [];
        const rejectedData = rejectedSnap.exists() ? Object.values(rejectedSnap.val()) : [];
        const lostData = lostSnap.exists() ? Object.values(lostSnap.val()) : [];
        const foundData = foundSnap.exists() ? Object.values(foundSnap.val()) : [];
        const adoptData = adoptSnap.exists() ? Object.values(adoptSnap.val()) : [];

        setReports(reportsData);
        setApprovedReports(approvedData);
        setRejectedReports(rejectedData);
        setLostPets(lostData);
        setFoundPets(foundData);
        setAdoptionRequests(adoptData);

        // Calculate stats
        const totalReports = reportsData.length;
        const pendingReports = reportsData.filter((r: any) => r.status === 'pending').length;
        const approvedCount = approvedData.length;
        const rejectedCount = rejectedData.length;
        const totalLostPets = lostData.length;
        const totalFoundPets = foundData.length;
        const totalAdoptionRequests = adoptData.length;

        // Calculate recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentActivity = [
          ...reportsData,
          ...approvedData,
          ...rejectedData,
          ...lostData,
          ...foundData,
          ...adoptData
        ].filter((item: any) => {
          const createdAt = new Date(item.createdAt || item.timestamp);
          return createdAt >= sevenDaysAgo;
        }).length;

        setStats({
          totalReports,
          pendingReports,
          approvedReports: approvedCount,
          rejectedReports: rejectedCount,
          totalLostPets,
          totalFoundPets,
          totalAdoptionRequests,
          recentActivity
        });

        console.log('Admin dashboard data loaded successfully');
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <p className="mt-2 text-sm text-gray-500">
            User: {user ? 'Logged in' : 'Not logged in'} | 
            Profile: {profile ? 'Loaded' : 'Not loaded'} | 
            Role: {profile?.role || 'Unknown'}
          </p>
        </div>
      </div>
    );
  }

  if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have admin privileges.</p>
          <p className="text-sm text-gray-500 mb-4">
            User: {user ? 'Logged in' : 'Not logged in'} | 
            Profile: {profile ? 'Loaded' : 'Not loaded'} | 
            Role: {profile?.role || 'Unknown'}
          </p>
          <Button onClick={logout}>Logout</Button>
        </div>
      </div>
    );
  }

  // Function to render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <p className="text-sm font-medium text-green-600">Approved</p>
                      <p className="text-3xl font-bold text-green-900">{stats.approvedReports}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Rejected</p>
                      <p className="text-3xl font-bold text-red-900">{stats.rejectedReports}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Lost Pets</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.totalLostPets}</p>
                    </div>
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600">Found Pets</p>
                      <p className="text-2xl font-bold text-indigo-900">{stats.totalFoundPets}</p>
                    </div>
                    <MapPin className="w-6 h-6 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-pink-600">Adoption Requests</p>
                      <p className="text-2xl font-bold text-pink-900">{stats.totalAdoptionRequests}</p>
                    </div>
                    <UserPlus className="w-6 h-6 text-pink-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Trends</CardTitle>
                <CardDescription>Data visualization and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <AdminDashboardCharts />
                </ErrorBoundary>
              </CardContent>
            </Card>

            {/* Heat Map */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Reports and incidents by location</CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <HeatMap />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports Management</CardTitle>
                <CardDescription>Manage animal abuse reports and submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Pending Reports</h3>
                      <p className="text-2xl font-bold text-blue-600">{stats.pendingReports}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">Approved Reports</h3>
                      <p className="text-2xl font-bold text-green-600">{stats.approvedReports}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h3 className="font-semibold text-red-900 mb-2">Rejected Reports</h3>
                      <p className="text-2xl font-bold text-red-600">{stats.rejectedReports}</p>
                    </div>
                  </div>
                  <p className="text-gray-600">Detailed reports management interface will be available soon.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'donations':
        return (
          <div className="space-y-6">
            <ErrorBoundary>
              <DonationManagement />
            </ErrorBoundary>
          </div>
        );

      case 'donors':
        return (
          <div className="space-y-6">
            <ErrorBoundary>
              <DonorsManagement />
            </ErrorBoundary>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <ErrorBoundary>
              <Inventory />
            </ErrorBoundary>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">User management interface will be available soon.</p>
              </CardContent>
            </Card>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Detailed analytics and reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <AdminDashboardCharts />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Not Found</CardTitle>
                <CardDescription>The requested page could not be found</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Please select a valid option from the sidebar.</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600">Welcome back, {profile.name || profile.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button onClick={logout} variant="outline">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant={activeTab === 'reports' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('reports')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Reports
                  </Button>
                  <Button
                    variant={activeTab === 'donations' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('donations')}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Donations
                  </Button>
                  <Button
                    variant={activeTab === 'donors' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('donors')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Donors
                  </Button>
                  <Button
                    variant={activeTab === 'inventory' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('inventory')}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Inventory
                  </Button>
                  <Button
                    variant={activeTab === 'users' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('users')}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Users
                  </Button>
                  <Button
                    variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}