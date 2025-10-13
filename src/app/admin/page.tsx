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
import PredictiveDashboard from '@/components/PredictiveAnalytics';
import PrescriptiveDashboard from '@/components/PrescriptiveAnalytics';
import TestDataGenerator from '@/components/TestDataGenerator';
import DonationManagement from '@/components/DonationManagement';
import DonorsManagement from '@/components/DonorsManagement';
import Inventory from '@/components/Inventory';
import NewsfeedPostForm from '@/components/NewsfeedPostForm';
import NewsfeedManagement from '@/components/NewsfeedManagement';
import useModernModal from '@/components/ui/modern-modal';
import useNotificationModal from '@/components/ui/notification-modal';
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
  Camera,
  Mail,
  Bell,
  Megaphone,
  TrendingUp,
  Target,
  Settings
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, profile, loading, logout } = useAuth();
  const { ModalComponent, alert, confirm, success, error } = useModernModal();
  const { NotificationModal, openModal, closeModal, unreadCount } = useNotificationModal();
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
  const [lostFilter, setLostFilter] = useState<'all'|'pending'|'approved'|'rejected'|'found'|'closed'>('pending');
  const [selectedLostIds, setSelectedLostIds] = useState<Set<string>>(new Set());
  const [adoptionRequests, setAdoptionRequests] = useState<Array<{
    id: string;
    [key: string]: any;
  }>>([]);
  const [loadingAdoptionRequests, setLoadingAdoptionRequests] = useState(false);
  const [contactMessages, setContactMessages] = useState<Array<{
    id: string;
    [key: string]: any;
  }>>([]);
  const [loadingContactMessages, setLoadingContactMessages] = useState(false);
  const [volunteerApplications, setVolunteerApplications] = useState<Array<{
    id: string;
    [key: string]: any;
  }>>([]);
  const [loadingVolunteerApplications, setLoadingVolunteerApplications] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);

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

  // Fetch adoption requests when adopt tab is active
  useEffect(() => {
    if (activeTab === 'adopt' && database) {
      setLoadingAdoptionRequests(true);
      console.log('Fetching adoption requests from Realtime Database...');
      
      const timeout = setTimeout(() => {
        console.log('Timeout reached, stopping loading...');
        setLoadingAdoptionRequests(false);
      }, 10000);
      
      const adoptionRequestsRef = ref(database, 'adoptionRequests');
      
      const unsubscribe = onValue(adoptionRequestsRef, (snapshot) => {
        clearTimeout(timeout);
        console.log('Adoption requests snapshot received');
        
        if (snapshot.exists()) {
          const requests = snapshot.val();
          const requestsList: Array<{ id: string; [key: string]: any }> = Object.keys(requests).map(key => ({
            id: key,
            ...requests[key]
          }));
          console.log('Adoption requests list:', requestsList);
          setAdoptionRequests(requestsList);
        } else {
          console.log('No adoption requests found');
          setAdoptionRequests([]);
        }
        setLoadingAdoptionRequests(false);
      }, (error) => {
        clearTimeout(timeout);
        console.error('Error fetching adoption requests:', error);
        setLoadingAdoptionRequests(false);
      });

      return () => {
        clearTimeout(timeout);
        off(adoptionRequestsRef, 'value', unsubscribe);
      };
    } else if (activeTab !== 'adopt') {
      setAdoptionRequests([]);
      setLoadingAdoptionRequests(false);
    }
  }, [activeTab]);

  // Fetch contact messages when contact tab is active
  useEffect(() => {
    if (activeTab === 'contact' && database) {
      setLoadingContactMessages(true);
      console.log('Fetching contact messages from Realtime Database...');
      
      const timeout = setTimeout(() => {
        console.log('Timeout reached, stopping loading...');
        setLoadingContactMessages(false);
      }, 10000);
      
      const contactMessagesRef = ref(database, 'contactMessages');
      
      const unsubscribe = onValue(contactMessagesRef, (snapshot) => {
        clearTimeout(timeout);
        setLoadingContactMessages(false);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const messagesArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          
          setContactMessages(messagesArray);
          console.log('Contact messages loaded:', messagesArray.length);
        } else {
          setContactMessages([]);
          console.log('No contact messages found');
        }
      }, (error) => {
        clearTimeout(timeout);
        setLoadingContactMessages(false);
        console.error('Error fetching contact messages:', error);
      });

      return () => {
        clearTimeout(timeout);
        off(contactMessagesRef, 'value', unsubscribe);
      };
    } else if (activeTab !== 'contact') {
      setContactMessages([]);
      setLoadingContactMessages(false);
    }
  }, [activeTab]);

  // Fetch volunteer applications when volunteers tab is active
  useEffect(() => {
    if (activeTab === 'volunteers' && database) {
      setLoadingVolunteerApplications(true);
      console.log('Fetching volunteer applications from Realtime Database...');
      
      const timeout = setTimeout(() => {
        console.log('Timeout reached, stopping loading...');
        setLoadingVolunteerApplications(false);
      }, 10000);
      
      const volunteerApplicationsRef = ref(database, 'volunteerApplications');
      
      const unsubscribe = onValue(volunteerApplicationsRef, (snapshot) => {
        clearTimeout(timeout);
        setLoadingVolunteerApplications(false);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const applicationsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          
          setVolunteerApplications(applicationsArray);
          console.log('Volunteer applications loaded:', applicationsArray.length);
        } else {
          setVolunteerApplications([]);
          console.log('No volunteer applications found');
        }
      }, (error) => {
        clearTimeout(timeout);
        setLoadingVolunteerApplications(false);
        console.error('Error fetching volunteer applications:', error);
      });

      return () => {
        clearTimeout(timeout);
        off(volunteerApplicationsRef, 'value', unsubscribe);
      };
    } else if (activeTab !== 'volunteers') {
      setVolunteerApplications([]);
      setLoadingVolunteerApplications(false);
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

  // Load dashboard data when dashboard tab is active
  useEffect(() => {
    if (activeTab === 'dashboard' && database) {
      console.log('Loading dashboard data...');
      
      // Load all reports for status cards
      const reportsRef = ref(database, 'reports');
      const unsubscribeReports = onValue(reportsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const reportsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setReports(reportsArray);
          console.log('Loaded reports for dashboard:', reportsArray.length);
        } else {
          setReports([]);
          console.log('No reports found for dashboard');
        }
      });

      // Load lost pets for status cards
      const lostPetsRef = ref(database, 'lostPets');
      const unsubscribeLostPets = onValue(lostPetsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const lostPetsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setLostPets(lostPetsArray);
          console.log('Loaded lost pets for dashboard:', lostPetsArray.length);
        } else {
          setLostPets([]);
          console.log('No lost pets found for dashboard');
        }
      });

      return () => {
        off(reportsRef, 'value', unsubscribeReports);
        off(lostPetsRef, 'value', unsubscribeLostPets);
      };
    }
  }, [activeTab, database]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    if (!database) {
      console.error('Database not initialized');
      await error('Database connection error. Please refresh the page.', 'Connection Error');
      return;
    }
    
    if (!user || !profile) {
      console.error('User not authenticated');
      await error('Authentication error. Please log in again.', 'Authentication Error');
      return;
    }
    
    console.log(`Attempting to update report ${reportId} to status: ${status}`);
    
    try {
      // Get the current report data
      const reportRef = ref(database, `reports/${reportId}`);
      const snapshot = await get(reportRef);
      
      if (!snapshot.exists()) {
        console.error('Report not found:', reportId);
        await error('Report not found. It may have been already processed.', 'Report Not Found');
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
        
        await success(`Report ${reportId} has been approved and is now visible on the heatmap!`, 'Report Approved');
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
        
        await success(`Report ${reportId} has been rejected.`, 'Report Rejected');
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
        
        await success(`Report ${reportId} status updated to ${status}`, 'Status Updated');
        console.log(`Report ${reportId} status updated to ${status}`);
      }
      
      console.log('Report status update completed successfully');
      
    } catch (err) {
      console.error('Error updating report status:', err);
      await error(`Error updating report: ${err instanceof Error ? err.message : 'Unknown error'}`, 'Update Failed');
    }
  };

  const markForAdoption = async (reportId: string) => {
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
    
    console.log(`Attempting to mark report ${reportId} for adoption`);
    
    try {
      // Get the current report data from approved reports
      const reportRef = ref(database, `approvedReports/${reportId}`);
      const snapshot = await get(reportRef);
      
      if (!snapshot.exists()) {
        console.error('Report not found:', reportId);
        alert('Report not found. It may have been already processed.');
        return;
      }
      
      const reportData = snapshot.val();
      console.log('Current report data:', reportData);
      
      // Update the report to mark it for adoption
      const updatedReportData = {
        ...reportData,
        availableForAdoption: true,
        status: 'completed',
        updatedAt: new Date().toISOString(),
        markedForAdoptionBy: {
          uid: user.uid,
          name: profile.name || profile.email,
          email: profile.email
        }
      };
      
      console.log('Updated report data for adoption:', updatedReportData);
      
      // Update the report in place
      await update(reportRef, updatedReportData);
      
      alert(`Report ${reportId} has been marked for adoption! The animal is now available on the adopt page.`);
      console.log(`Report ${reportId} marked for adoption`);
      
    } catch (error) {
      console.error('Error marking report for adoption:', error);
      alert(`Error marking report for adoption: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const updateAdoptionRequestStatus = async (requestId: string, status: string) => {
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
    
    console.log(`Attempting to update adoption request ${requestId} to status: ${status}`);
    
    try {
      const requestRef = ref(database, `adoptionRequests/${requestId}`);
      await update(requestRef, {
        status,
        updatedAt: new Date().toISOString(),
        reviewedBy: {
          uid: user.uid,
          name: profile.name || profile.email,
          email: profile.email
        }
      });
      
      alert(`Adoption request ${requestId} status updated to ${status}`);
      console.log(`Adoption request ${requestId} status updated to ${status}`);
      
    } catch (error) {
      console.error('Error updating adoption request status:', error);
      alert(`Error updating adoption request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateContactMessageStatus = async (messageId: string, status: string) => {
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
    
    console.log(`Attempting to update contact message ${messageId} to status: ${status}`);
    
    try {
      const messageRef = ref(database, `contactMessages/${messageId}`);
      await update(messageRef, {
        status,
        updatedAt: new Date().toISOString(),
        reviewedBy: {
          uid: user.uid,
          name: profile.name || profile.email,
          email: profile.email
        }
      });
      
      console.log(`Contact message ${messageId} status updated to ${status}`);
      alert(`Contact message status updated to ${status}`);
      
    } catch (error) {
      console.error('Error updating contact message status:', error);
      alert(`Error updating contact message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteContactMessage = async (messageId: string) => {
    if (!database) {
      alert('Database not initialized');
      return;
    }

    if (!user || !profile) {
      alert('Authentication error. Please log in again.');
      return;
    }

    const confirmDelete = confirm('Are you sure you want to delete this contact message? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const messageRef = ref(database, `contactMessages/${messageId}`);
      await remove(messageRef);
      
      console.log(`Contact message ${messageId} deleted successfully`);
      alert('Contact message deleted successfully');
      
    } catch (error) {
      console.error('Error deleting contact message:', error);
      alert(`Error deleting contact message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateVolunteerApplicationStatus = async (applicationId: string, status: string) => {
    if (!database) {
      alert('Database not initialized');
      return;
    }

    if (!user || !profile) {
      alert('Authentication error. Please log in again.');
      return;
    }

    console.log(`Attempting to update volunteer application ${applicationId} to status: ${status}`);
    
    try {
      const applicationRef = ref(database, `volunteerApplications/${applicationId}`);
      await update(applicationRef, {
        status,
        updatedAt: new Date().toISOString(),
        reviewedBy: profile?.name || profile?.email || 'Admin'
      });
      
      console.log(`Volunteer application ${applicationId} updated to ${status} successfully`);
      setVolunteerApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status, updatedAt: new Date().toISOString() }
            : app
        )
      );
      alert(`Volunteer application ${status} successfully`);
    } catch (error) {
      console.error('Error updating volunteer application status:', error);
      alert(`Error updating volunteer application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteVolunteerApplication = async (applicationId: string) => {
    if (!database) {
      alert('Database not initialized');
      return;
    }

    if (!user || !profile) {
      alert('Authentication error. Please log in again.');
      return;
    }

    const confirmDelete = confirm('Are you sure you want to delete this volunteer application? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const applicationRef = ref(database, `volunteerApplications/${applicationId}`);
      await remove(applicationRef);
      
      console.log(`Volunteer application ${applicationId} deleted successfully`);
      setVolunteerApplications(prev => prev.filter(app => app.id !== applicationId));
      alert('Volunteer application deleted successfully');
    } catch (error) {
      console.error('Error deleting volunteer application:', error);
      alert(`Error deleting volunteer application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const openVolunteerDetailModal = (application: any) => {
    setSelectedVolunteer(application);
    setShowVolunteerModal(true);
  };

  const closeVolunteerModal = () => {
    setShowVolunteerModal(false);
    setSelectedVolunteer(null);
  };

  const openReportDetailModal = (report: any) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
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
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    );
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

            {/* Predictive & Prescriptive Summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-indigo-100">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                    Predictive Analytics (Summary)
                  </CardTitle>
                  <CardDescription>
                    Quick glance of analytics; open the full tab for charts and hotspots
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Forecast preview</p>
                      <p className="text-2xl font-semibold text-gray-900">6‑month outlook</p>
                    </div>
                    <Button
                      onClick={() => setActiveTab('predictive')}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      View details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-100">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-emerald-600" />
                    Prescriptive Analytics (Summary)
                  </CardTitle>
                  <CardDescription>
                    Top recommended actions and resource allocation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Recommendations</p>
                      <p className="text-2xl font-semibold text-gray-900">See priorities</p>
                    </div>
                    <Button
                      onClick={() => setActiveTab('prescriptive')}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      View details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">REPORT</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">LOCATION</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">URGENCY</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">STATUS</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">DATE</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {report.animalType} - {report.condition}
                              </div>
                              <div className="text-sm text-gray-500">ID: {report.reportId}</div>
                              <div className="text-sm text-gray-500">By: {report.submittedBy?.name}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">{report.location}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="capitalize">
                              {report.urgency}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge 
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                report.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : report.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {report.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(report.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openReportDetailModal(report)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Ref: {report.reportId}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">REPORT</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">LOCATION</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">STATUS</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">APPROVED BY</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">DATE</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedReports.map((report) => (
                        <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {report.animalType} - {report.condition}
                              </div>
                              <div className="text-sm text-gray-500">ID: {report.reportId}</div>
                              <div className="text-sm text-gray-500">By: {report.submittedBy?.email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">{report.location}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Approved
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">{report.reviewedBy?.name || 'Admin'}</div>
                            <div className="text-xs text-gray-500">
                              {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(report.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openReportDetailModal(report)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Ref: {report.reportId}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">REPORT</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">LOCATION</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">STATUS</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">REJECTED BY</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">DATE</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rejectedReports.map((report) => (
                        <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {report.animalType} - {report.condition}
                              </div>
                              <div className="text-sm text-gray-500">ID: {report.reportId}</div>
                              <div className="text-sm text-gray-500">By: {report.submittedBy?.email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">{report.location}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                              Rejected
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">{report.reviewedBy?.name || 'Admin'}</div>
                            <div className="text-xs text-gray-500">
                              {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(report.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openReportDetailModal(report)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Ref: {report.reportId}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Filter:</span>
                  <select
                    value={lostFilter}
                    onChange={(e) => setLostFilter(e.target.value as any)}
                    className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="found">Found</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedLostIds(new Set(lostPets.filter(p => lostFilter==='all' ? true : p.status===lostFilter).map(p => p.id)))}
                  >
                    Select All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedLostIds(new Set())}>Clear</Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={selectedLostIds.size === 0}
                    onClick={async () => {
                      for (const id of Array.from(selectedLostIds)) {
                        await updateLostPetStatus(id, 'approved');
                      }
                      setSelectedLostIds(new Set());
                    }}
                  >
                    Approve Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={selectedLostIds.size === 0}
                    onClick={async () => {
                      for (const id of Array.from(selectedLostIds)) {
                        await updateLostPetStatus(id, 'rejected');
                      }
                      setSelectedLostIds(new Set());
                    }}
                  >
                    Reject Selected
                  </Button>
                </div>
              </div>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">PET</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">DETAILS</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">LAST SEEN</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">STATUS</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">DATE</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lostPets.map((pet) => (
                        <tr key={pet.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {pet.petName} - {pet.animalType}
                              </div>
                              <div className="text-sm text-gray-500">ID: {pet.reportId}</div>
                              <div className="text-sm text-gray-500">By: {pet.submittedBy?.name}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">
                              <div>Breed: {pet.breed}</div>
                              <div>Color: {pet.color}</div>
                              <div>Size: {pet.size}</div>
                              <div>Age: {pet.age}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {pet.lastSeenLocation}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(pet.lastSeenDate).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge 
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                pet.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : pet.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : pet.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {pet.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">
                              {new Date(pet.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(pet.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openReportDetailModal(pet)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Ref: {pet.reportId}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              {loadingAdoptionRequests ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading adoption requests...</p>
                </div>
              ) : adoptionRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Adoption Requests</h3>
                  <p className="text-gray-500">No adoption requests have been submitted yet.</p>
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
              ) : (
                <div className="space-y-4">
                  {adoptionRequests.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              Adoption Request - {request.animalInfo?.animalType || 'Unknown Animal'}
                            </h3>
                            <p className="text-sm text-gray-600">Request ID: {request.requestId}</p>
                            <p className="text-sm text-gray-600">
                              Submitted by: {request.applicant?.name || request.applicant?.email} on {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant={request.status === 'pending' ? 'destructive' : 
                                   request.status === 'approved' ? 'default' : 'secondary'}
                          >
                            {request.status}
                          </Badge>
                        </div>
                        
                        {/* Animal Information */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Animal Information:</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p><span className="font-medium">Type:</span> {request.animalInfo?.animalType || 'Unknown'}</p>
                            <p><span className="font-medium">Breed:</span> {request.animalInfo?.breed || 'Unknown'}</p>
                            <p><span className="font-medium">Color:</span> {request.animalInfo?.color || 'Unknown'}</p>
                            <p><span className="font-medium">Size:</span> {request.animalInfo?.size || 'Unknown'}</p>
                            <p><span className="font-medium">Age:</span> {request.animalInfo?.age || 'Unknown'}</p>
                            <p><span className="font-medium">Gender:</span> {request.animalInfo?.gender || 'Unknown'}</p>
                          </div>
                        </div>

                        {/* Applicant Information */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Applicant Information:</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p><span className="font-medium">Name:</span> {request.fullName}</p>
                            <p><span className="font-medium">Email:</span> {request.email}</p>
                            <p><span className="font-medium">Phone:</span> {request.phone}</p>
                            <p><span className="font-medium">Age:</span> {request.age}</p>
                            <p><span className="font-medium">Occupation:</span> {request.occupation || 'Not specified'}</p>
                            <p><span className="font-medium">Experience:</span> {request.experience}</p>
                          </div>
                          <p className="text-sm mt-2"><span className="font-medium">Address:</span> {request.address}</p>
                        </div>

                        {/* Adoption Details */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Adoption Details:</h4>
                          <p className="text-sm"><span className="font-medium">Reason:</span> {request.reasonForAdoption}</p>
                          <p className="text-sm"><span className="font-medium">Living Situation:</span> {request.livingSituation}</p>
                          {request.otherPets && (
                            <p className="text-sm"><span className="font-medium">Other Pets:</span> {request.otherPets}</p>
                          )}
                          {request.additionalInfo && (
                            <p className="text-sm"><span className="font-medium">Additional Info:</span> {request.additionalInfo}</p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateAdoptionRequestStatus(request.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateAdoptionRequestStatus(request.id, 'rejected')}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {request.status === 'approved' && (
                            <div className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approved by {request.reviewedBy?.name} on {new Date(request.updatedAt).toLocaleDateString()}
                            </div>
                          )}
                          
                          {request.status === 'rejected' && (
                            <div className="flex items-center text-red-600 text-sm">
                              <X className="w-4 h-4 mr-1" />
                              Rejected by {request.reviewedBy?.name} on {new Date(request.updatedAt).toLocaleDateString()}
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
      
      case 'contact':
        return (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Contact Messages</CardTitle>
              <CardDescription>Manage and respond to contact messages from users</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingContactMessages ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading contact messages...</span>
                </div>
              ) : contactMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Contact Messages</h3>
                  <p className="text-gray-500">No contact messages have been received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contactMessages.map((message) => (
                    <Card key={message.id} className={`border-l-4 ${
                      message.status === 'new' ? 'border-l-green-500' : 
                      message.status === 'read' ? 'border-l-blue-500' : 
                      message.status === 'replied' ? 'border-l-purple-500' : 
                      'border-l-gray-500'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{message.name}</h3>
                              <Badge variant={
                                message.status === 'new' ? 'default' : 
                                message.status === 'read' ? 'secondary' : 
                                message.status === 'replied' ? 'outline' : 
                                'destructive'
                              }>
                                {message.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Email:</strong> {message.email}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Category:</strong> {message.category}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Subject:</strong> {message.subject}
                            </p>
                            <p className="text-sm text-gray-500">
                              <strong>Received:</strong> {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Message:</h4>
                          <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {message.message}
                          </p>
                        </div>

                        {message.reviewedBy && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                              <strong>Reviewed by:</strong> {message.reviewedBy.name} on {new Date(message.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          {message.status === 'new' && (
                            <Button
                              onClick={() => updateContactMessageStatus(message.id, 'read')}
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              Mark as Read
                            </Button>
                          )}
                          {message.status === 'read' && (
                            <Button
                              onClick={() => updateContactMessageStatus(message.id, 'replied')}
                              size="sm"
                              variant="outline"
                              className="text-purple-600 border-purple-600 hover:bg-purple-50"
                            >
                              Mark as Replied
                            </Button>
                          )}
                          <Button
                            onClick={() => deleteContactMessage(message.id)}
                            size="sm"
                            variant="destructive"
                          >
                            Delete
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

      case 'donations':
        return <DonationManagement />;
      
      case 'volunteers':
        return (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Volunteer Management</CardTitle>
              <CardDescription>Manage volunteer applications and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingVolunteerApplications ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading volunteer applications...</span>
                </div>
              ) : volunteerApplications.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Volunteer Applications</h3>
                  <p className="text-gray-500">No volunteer applications have been submitted yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">VOLUNTEER</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">AGE</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">BACKGROUND</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">STATUS</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">DATE</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteerApplications.map((application) => (
                        <tr key={application.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {application.firstName} {application.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{application.email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">{application.age}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">{application.background}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge 
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                application.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : application.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {application.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">
                              {new Date(application.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(application.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openVolunteerDetailModal(application)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Ref: {application.applicationId}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case 'donors':
        return <DonorsManagement />;
      
      case 'heatmap':
        return <HeatMap />;
      case 'predictive':
        return <PredictiveDashboard />;
      case 'prescriptive':
        return <PrescriptiveDashboard />;
      // case 'test-data':
      //   return <TestDataGenerator />;
      
      case 'inventory':
        return <Inventory />;
      
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
      
      case 'newsfeed':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Newsfeed Management</h2>
              <p className="text-gray-600">Create new posts and manage existing ones</p>
            </div>
            
            {/* Create New Post */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Post</h3>
              <NewsfeedPostForm />
            </div>
            
            {/* Manage Existing Posts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Existing Posts</h3>
              <NewsfeedManagement />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <ModalComponent />
      <NotificationModal />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-[2000] w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col h-screen`}>
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
              onClick={() => setActiveTab('contact')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'contact' 
                  ? 'text-white bg-gradient-to-r from-green-600 to-teal-600' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Mail className="w-5 h-5 mr-3" />
              Contact Messages
            </button>
            <button 
              onClick={() => setActiveTab('donations')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'donations' 
                  ? 'text-white bg-gradient-to-r from-orange-600 to-red-600' 
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <DollarSign className="w-5 h-5 mr-3" />
              Donations
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
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'inventory' 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Inventory
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
              onClick={() => setActiveTab('predictive')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'predictive' 
                  ? 'text-white bg-gradient-to-r from-indigo-600 to-blue-600' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <TrendingUp className="w-5 h-5 mr-3" />
              Predictive Analytics
            </button>
            <button 
              onClick={() => setActiveTab('prescriptive')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'prescriptive' 
                  ? 'text-white bg-gradient-to-r from-emerald-600 to-green-600' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Target className="w-5 h-5 mr-3" />
              Prescriptive Analytics
            </button>
            {/* Temporarily disabled - Test Data Generator */}
            {/* <button 
              onClick={() => setActiveTab('test-data')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'test-data' 
                  ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Settings className="w-5 h-5 mr-3" />
              Test Data Generator
            </button> */}
            
            <button 
              onClick={() => setActiveTab('newsfeed')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'newsfeed' 
                  ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Megaphone className="w-5 h-5 mr-3" />
              Newsfeed
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
          className="fixed inset-0 z-[1500] bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64 ml-0 min-h-screen overflow-y-auto">
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
        <main className="p-4 md:p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {activeTab === 'dashboard' && 'Admin Dashboard'}
                  {activeTab === 'abuse-reports' && 'Abuse Reports Management'}
                  {activeTab === 'lost-reports' && 'Lost Reports Management'}
                  {activeTab === 'found-reports' && 'Found Reports Management'}
                  {activeTab === 'adopt' && 'Adoption Management'}
                  {activeTab === 'contact' && 'Contact Messages Management'}
                  {activeTab === 'donations' && 'Donation Management'}
                  {activeTab === 'volunteers' && 'Volunteer Management'}
                  {activeTab === 'donors' && 'Donor Management'}
                  {activeTab === 'inventory' && 'Inventory Management'}
                  {activeTab === 'heatmap' && 'Heat Map Analytics'}
                  {activeTab === 'predictive' && 'Predictive Analytics'}
                  {activeTab === 'prescriptive' && 'Prescriptive Analytics'}
                  {activeTab === 'test-data' && 'Test Data Generator'}
                  {activeTab === 'newsfeed' && 'Newsfeed Management'}
                </h1>
                <p className="text-gray-600">Welcome back, {profile.name || profile.email}</p>
              </div>
              
              {/* Notification Button */}
              <div className="relative">
                <Button
                  onClick={openModal}
                  variant="outline"
                  className="relative p-3 hover:bg-blue-50 border-blue-200"
                >
                  <Bell className="w-5 h-5 text-blue-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Dynamic Content */}
          {renderContent()}
        </main>
      </div>

      {/* Report Detail Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedReport.animalType} - {selectedReport.condition}
                  </h2>
                  <p className="text-gray-600">Report ID: {selectedReport.reportId}</p>
                  <p className="text-sm text-gray-500">Submitted by: {selectedReport.submittedBy?.name}</p>
                </div>
                <button
                  onClick={closeReportModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                  <p className="text-sm text-gray-900">{selectedReport.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Urgency</h3>
                  <Badge variant="outline" className="capitalize">
                    {selectedReport.urgency}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <Badge 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedReport.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : selectedReport.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedReport.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Date</h3>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-900">{selectedReport.description}</p>
                </div>
              </div>

              {/* Display Images if available */}
              {selectedReport.images && selectedReport.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Evidence Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReport.images.map((imageUrl: string, index: number) => {
                      const isPlaceholder = imageUrl.startsWith('placeholder-');
                      const isBase64 = imageUrl.startsWith('data:image');
                      const isSupabase = imageUrl.includes('supabase.co');
                      const isValidImage = isBase64 || isSupabase || (!isPlaceholder && (imageUrl.startsWith('http') || imageUrl.startsWith('https')));
                      
                      return (
                        <div key={index} className="relative">
                          {!isValidImage ? (
                            <div className="w-full h-32 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
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
                              className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => {
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
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                {(selectedReport.status === 'pending' || selectedReport.status === 'investigating') && (
                  <>
                    <Button
                      onClick={() => {
                        updateReportStatus(selectedReport.id, 'approved');
                        closeReportModal();
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        updateReportStatus(selectedReport.id, 'rejected');
                        closeReportModal();
                      }}
                      variant="destructive"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {selectedReport.status === 'pending' && (
                  <Button
                    onClick={() => {
                      updateReportStatus(selectedReport.id, 'investigating');
                      closeReportModal();
                    }}
                    variant="outline"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Investigate
                  </Button>
                )}
                <Button
                  onClick={closeReportModal}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Detail Modal */}
      {showVolunteerModal && selectedVolunteer && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedVolunteer.firstName} {selectedVolunteer.lastName}
                </h2>
                <p className="text-gray-600">{selectedVolunteer.email}</p>
                <p className="text-sm text-gray-500">Phone: {selectedVolunteer.phone}</p>
              </div>
              <button
                onClick={closeVolunteerModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Age</h3>
                <p className="text-sm text-gray-900">{selectedVolunteer.age}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Background</h3>
                <p className="text-sm text-gray-900">{selectedVolunteer.background}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Address</h3>
                <p className="text-sm text-gray-900">{selectedVolunteer.address}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Birth Date</h3>
                <p className="text-sm text-gray-900">{selectedVolunteer.birthdate || 'Not provided'}</p>
              </div>
            </div>

            {selectedVolunteer.motivation && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Motivation</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-900">{selectedVolunteer.motivation}</p>
                </div>
              </div>
            )}

            {selectedVolunteer.skills && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-900">{selectedVolunteer.skills}</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Application Details</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <Badge 
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedVolunteer.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : selectedVolunteer.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedVolunteer.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Application ID:</span>
                    <span className="ml-2 text-gray-900">{selectedVolunteer.applicationId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Applied:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(selectedVolunteer.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedVolunteer.updatedAt && (
                    <div>
                      <span className="font-medium text-gray-700">Updated:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(selectedVolunteer.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {selectedVolunteer.status === 'pending' && (
                <>
                  <Button
                    onClick={() => {
                      updateVolunteerApplicationStatus(selectedVolunteer.id, 'approved');
                      closeVolunteerModal();
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => {
                      updateVolunteerApplicationStatus(selectedVolunteer.id, 'rejected');
                      closeVolunteerModal();
                    }}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button
                onClick={() => {
                  deleteVolunteerApplication(selectedVolunteer.id);
                  closeVolunteerModal();
                }}
                variant="outline"
              >
                Delete
              </Button>
              <Button
                onClick={closeVolunteerModal}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
    </>
  );
}

