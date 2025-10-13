'use client';

import { useState, useEffect } from 'react';
import { database, firestore } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ref, onValue, off, update, push, set, query, orderByChild, get } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import useModernModal from '@/components/ui/modern-modal';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Download, 
  Search, 
  Filter,
  Eye,
  Mail,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface Donation {
  id: string;
  amount: number;
  currency: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  isAnonymous?: boolean;
  purpose: string;
  dedication?: string;
  paymentMethod?: string; // stripe/paypal
  paymentIntentId?: string; // stripe
  method?: string; // gcash
  referenceNumber?: string; // gcash
  screenshots?: string[]; // gcash
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  completedAt?: string;
  receiptSent?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
}

interface DonationStats {
  totalAmount: number;
  totalCount: number;
  monthlyAmount: number;
  monthlyCount: number;
  averageDonation: number;
}

export default function DonationManagement() {
  const { user, profile } = useAuth();
  const { ModalComponent, alert, confirm, prompt, success, error } = useModernModal();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationStats>({
    totalAmount: 0,
    totalCount: 0,
    monthlyAmount: 0,
    monthlyCount: 0,
    averageDonation: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    if (!database) {
      console.warn('Database not available. Donation management will not work.');
      setLoading(false);
      return;
    }

    // Listen to donations from Realtime Database
    const donationsRef = ref(database, 'donations');
    const unsubscribe = onValue(donationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const donationsData = snapshot.val();
        const donationsList = Object.keys(donationsData).map(key => ({
          id: key,
          ...donationsData[key]
        })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        
        setDonations(donationsList);
        calculateStats(donationsList);
      } else {
        setDonations([]);
        calculateStats([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching donations:', error);
      setLoading(false);
    });

    return () => off(donationsRef, 'value', unsubscribe);
  }, []);

  const calculateStats = (donationsList: Donation[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalAmount = donationsList
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    
    const totalCount = donationsList.filter(d => d.status === 'completed').length;
    
    const monthlyDonations = donationsList.filter(d => {
      if (d.status !== 'completed') return false;
      const donationDate = new Date(d.createdAt);
      return donationDate.getMonth() === currentMonth && donationDate.getFullYear() === currentYear;
    });
    
    const monthlyAmount = monthlyDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const monthlyCount = monthlyDonations.length;
    const averageDonation = totalCount > 0 ? totalAmount / totalCount : 0;

    setStats({
      totalAmount,
      totalCount,
      monthlyAmount,
      monthlyCount,
      averageDonation,
    });
  };

  const filteredDonations = donations.filter(donation => {
    const needle = searchTerm.toLowerCase();
    const matchesSearch =
      (donation.donorName || '').toLowerCase().includes(needle) ||
      (donation.donorEmail || '').toLowerCase().includes(needle) ||
      (donation.paymentIntentId || '').toLowerCase().includes(needle) ||
      (donation.referenceNumber || '').toLowerCase().includes(needle);

    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter as any;
    const matchesPurpose = purposeFilter === 'all' || donation.purpose === purposeFilter;

    return matchesSearch && matchesStatus && matchesPurpose;
  });

  const approveDonation = async (donation: Donation) => {
    if (!database) return;
    const notes = await prompt('Optional: add verification notes', '', 'Approve Donation');
    const donationRef = ref(database, `donations/${donation.id}`);
    await update(donationRef, {
      status: 'completed',
      verifiedAt: new Date().toISOString(),
      verifiedBy: profile?.email || user?.email || 'admin',
      verificationNotes: notes || '',
      completedAt: new Date().toISOString(),
    });
    await success('Donation approved successfully!', 'Success');
  };

  const rejectDonation = async (donation: Donation) => {
    if (!database) return;
    const notes = await prompt('Reason for rejection?', 'Invalid reference number', 'Reject Donation');
    if (notes === null) return; // User cancelled
    
    const donationRef = ref(database, `donations/${donation.id}`);
    await update(donationRef, {
      status: 'failed',
      verifiedAt: new Date().toISOString(),
      verifiedBy: profile?.email || user?.email || 'admin',
      verificationNotes: notes || '',
    });
    await success('Donation rejected successfully!', 'Success');

    // Send notification to donor (if we have their userId)
    try {
      const userId = (donation as any).userId;
      if (database && userId) {
        const notifsRef = ref(database, `notifications/${userId}`);
        const notifRef = push(notifsRef);
        await set(notifRef, {
          type: 'donation_rejected',
          message: `Your donation was rejected${notes ? `: ${notes}` : ''}.`,
          amount: donation.amount,
          purpose: donation.purpose,
          referenceNumber: donation.referenceNumber || null,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    } catch (e) {
      console.error('Failed to create rejection notification:', e);
    }
  };

  const openDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setDetailsOpen(true);
  };

  const sendReceipt = async (donation: Donation) => {
    if (!donation.donorEmail) return;
    const subject = encodeURIComponent('StreetPaws Donation Receipt');
    const body = encodeURIComponent(
      `Hi ${donation.donorName || 'Donor'},\n\n` +
      `Thank you for your donation of ₱${(donation.amount || 0).toLocaleString()} for ${getPurposeLabel(donation.purpose)}.\n` +
      `Date: ${new Date(donation.createdAt).toLocaleString()}\n` +
      (donation.method === 'gcash' && donation.referenceNumber ? `GCash Ref: ${donation.referenceNumber}\n` : '') +
      `\nWe appreciate your support!\n\n— StreetPaws`
    );
    window.open(`mailto:${donation.donorEmail}?subject=${subject}&body=${body}`);
    try {
      if (database) {
        const donationRef = ref(database, `donations/${donation.id}`);
        await update(donationRef, { receiptSent: true });
      }
    } catch {}
  };

  const renderMethodMeta = (donation: Donation) => {
    if (donation.method === 'gcash') {
      return (
        <div className="text-xs text-gray-500 mt-1">
          Ref: {donation.referenceNumber || '—'}
        </div>
      );
    }
    if ((donation as any).method === 'in-kind') {
      const d: any = donation as any;
      return (
        <div className="text-xs text-gray-500 mt-1">
          {d.itemName || 'Item'} • {d.quantity} {d.unit}
        </div>
      );
    }
    return null;
  };

  const exportDonations = () => {
    const csvContent = [
      ['Date', 'Donor Name', 'Email', 'Amount', 'Purpose', 'Status', 'Payment Method'],
      ...filteredDonations.map(d => [
        new Date(d.createdAt).toLocaleDateString(),
        d.isAnonymous ? 'Anonymous' : d.donorName,
        d.donorEmail,
        `₱${(d.amount || 0).toLocaleString()}`,
        d.purpose,
        d.status,
        d.paymentMethod
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const migrateFromFirestore = async () => {
    if (!firestore || !database) {
      await error('Firestore/Realtime Database not initialized', 'Migration Error');
      return;
    }
    const yes = await confirm('Copy donations from Firestore → Realtime Database? Existing duplicates will be skipped.', 'Sync from Firestore');
    if (!yes) return;
    setMigrating(true);
    try {
      const snap = await getDocs(collection(firestore, 'donations'));
      const existingKeys = new Set(
        donations.map(d => (d as any).sourceId || d.paymentIntentId || d.referenceNumber)
      );
      let copied = 0;
      for (const doc of snap.docs) {
        const data: any = doc.data();
        const uniqueKey = data.sourceId || data.paymentIntentId || data.referenceNumber || doc.id;
        if (existingKeys.has(uniqueKey)) continue;
        const donationData: any = {
          amount: data.amount || 0,
          currency: (data.currency || 'php').toUpperCase(),
          donorName: data.donorName || data.name || 'Donor',
          donorEmail: data.donorEmail || data.email || '',
          donorPhone: data.donorPhone || data.phone || '',
          isAnonymous: data.isAnonymous ?? false,
          purpose: data.purpose || 'general',
          dedication: data.dedication || '',
          paymentMethod: data.paymentMethod || data.method || 'manual',
          paymentIntentId: data.paymentIntentId || undefined,
          method: data.method,
          referenceNumber: data.referenceNumber,
          screenshots: data.screenshots || [],
          status: (data.status || 'completed') as any,
          createdAt: data.createdAt || new Date().toISOString(),
          completedAt: data.completedAt || (data.status === 'completed' ? new Date().toISOString() : undefined),
          receiptSent: data.receiptSent || false,
          sourceId: doc.id,
        };
        const donationsRef = ref(database, 'donations');
        const newRef = push(donationsRef);
        await set(newRef, donationData);
        copied++;
      }
      await success(`Synced ${copied} donation(s) from Firestore.`, 'Sync Complete');
    } catch (e: any) {
      console.error('Migration error:', e);
      await error(e?.message || 'Failed to migrate donations');
    } finally {
      setMigrating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPurposeLabel = (purpose: string) => {
    const purposeLabels = {
      general: 'General Fund',
      medical: 'Medical Care',
      food: 'Food & Supplies',
      rescue: 'Rescue Operations',
      education: 'Education Programs',
    };
    return purposeLabels[purpose as keyof typeof purposeLabels] || purpose;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!database) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-900">Firebase Configuration Error</h3>
              <p className="text-red-700">Firebase is not properly configured. Please check your environment variables.</p>
              <p className="text-sm text-red-600 mt-2">
                Missing: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, etc.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ModalComponent />
      <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Raised</p>
              <p className="text-2xl font-bold text-gray-900">₱{stats.totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCount}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">₱{stats.monthlyAmount.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Donation</p>
              <p className="text-2xl font-bold text-gray-900">₱{stats.averageDonation.toFixed(0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            
            <select
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Purposes</option>
              <option value="general">General Fund</option>
              <option value="medical">Medical Care</option>
              <option value="food">Food & Supplies</option>
              <option value="rescue">Rescue Operations</option>
              <option value="education">Education Programs</option>
            </select>
          </div>
          
          <div className="flex gap-2">
          <Button onClick={migrateFromFirestore} disabled={migrating} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60">
            {migrating ? 'Syncing…' : 'Sync from Firestore'}
          </Button>
          <Button onClick={exportDonations} className="bg-orange-500 hover:bg-orange-600">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          </div>
        </div>
      </Card>

      {/* Donations Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                      </div>
                      <div className="text-sm text-gray-500">{donation.donorEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₱{donation.amount ? donation.amount.toLocaleString() : '0'}
                    </div>
                    <div className="text-sm text-gray-500">{donation.currency ? donation.currency.toUpperCase() : 'PHP'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getPurposeLabel(donation.purpose)}</div>
                    {donation.dedication && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        "{donation.dedication}"
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(donation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(donation.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openDetails(donation)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {donation.status === 'completed' && !donation.receiptSent && donation.donorEmail && (
                        <Button size="sm" variant="outline" onClick={() => sendReceipt(donation)}>
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                      {(donation.method === 'gcash' || (donation as any).method === 'bank') && donation.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => approveDonation(donation)}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectDonation(donation)}>Reject</Button>
                        </>
                      )}
                      {(donation as any).method === 'in-kind' && donation.status !== 'distributed' && (
                        <>
                          {donation.status === 'pledged' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => approveDonation({ ...donation, status: 'completed' } as any)}>Mark Received</Button>
                          )}
                          {donation.status === 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => approveDonation({ ...donation, status: 'distributed' } as any)}>Mark Distributed</Button>
                          )}
                        </>
                      )}
                    </div>
                    {renderMethodMeta(donation)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDonations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No donations found</div>
            </div>
          )}
        </div>
      </Card>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Donor</div>
                  <div className="font-medium">{selectedDonation.isAnonymous ? 'Anonymous' : selectedDonation.donorName}</div>
                  <div className="text-sm text-gray-600">{selectedDonation.donorEmail || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Amount</div>
                  <div className="font-medium">₱{(selectedDonation.amount || 0).toLocaleString()} {selectedDonation.currency?.toUpperCase() || 'PHP'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Purpose</div>
                  <div className="font-medium">{getPurposeLabel(selectedDonation.purpose)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div>{getStatusBadge(selectedDonation.status)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">{new Date(selectedDonation.createdAt).toLocaleString()}</div>
                </div>
                {selectedDonation.method === 'gcash' && (
                  <div>
                    <div className="text-sm text-gray-500">GCash Ref</div>
                    <div className="font-medium">{selectedDonation.referenceNumber || '—'}</div>
                  </div>
                )}
              </div>
              {selectedDonation.message && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Message</div>
                  <div className="p-3 bg-gray-50 rounded border text-sm text-gray-700">{selectedDonation.message}</div>
                </div>
              )}
              {!!selectedDonation.screenshots?.length && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Screenshots</div>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedDonation.screenshots!.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt={`receipt-${idx}`} className="w-full h-24 object-cover rounded border" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                {selectedDonation.status === 'completed' && !selectedDonation.receiptSent && selectedDonation.donorEmail && (
                  <Button variant="outline" onClick={() => sendReceipt(selectedDonation)}>Send Receipt</Button>
                )}
                <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
