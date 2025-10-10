'use client';

import { useEffect, useMemo, useState } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Download, Users, Trophy, Medal, Crown } from 'lucide-react';

interface Donation {
  id: string;
  amount: number;
  currency: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

interface DonorRow {
  donorEmail: string;
  donorName: string;
  totalAmount: number;
  donationCount: number;
  lastDonationAt: string;
}

export default function DonorsManagement() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!firestore) return;
    const unsub = onSnapshot(collection(firestore, 'donations'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Donation[];
      setDonations(list);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const donors: DonorRow[] = useMemo(() => {
    const byEmail = new Map<string, DonorRow>();
    for (const d of donations) {
      const email = (d.donorEmail || '').trim().toLowerCase();
      if (!email) continue; // skip missing emails
      const existing = byEmail.get(email) || {
        donorEmail: email,
        donorName: d.donorName || 'Anonymous',
        totalAmount: 0,
        donationCount: 0,
        lastDonationAt: d.createdAt,
      };
      existing.totalAmount += d.status === 'failed' ? 0 : (Number(d.amount) || 0);
      existing.donationCount += 1;
      if (new Date(d.createdAt).getTime() > new Date(existing.lastDonationAt).getTime()) {
        existing.lastDonationAt = d.createdAt;
      }
      if (!existing.donorName && d.donorName) existing.donorName = d.donorName;
      byEmail.set(email, existing);
    }
    const rows = Array.from(byEmail.values());
    rows.sort((a, b) => b.totalAmount - a.totalAmount);
    return rows;
  }, [donations]);

  const filtered = donors.filter((d) => {
    const q = search.toLowerCase();
    return d.donorEmail.includes(q) || (d.donorName || '').toLowerCase().includes(q);
  });

  const exportCsv = () => {
    const header = ['Donor Name', 'Email', 'Total Amount', 'Donations', 'Last Donation'];
    const rows = filtered.map((d) => [
      d.donorName,
      d.donorEmail,
      `₱${d.totalAmount.toLocaleString()}`,
      String(d.donationCount),
      new Date(d.lastDonationAt).toLocaleString(),
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const emailDonor = (row: DonorRow) => {
    const subject = encodeURIComponent('Thank you for supporting StreetPaws');
    const body = encodeURIComponent(
      `Hi ${row.donorName || 'Supporter'},\n\n` +
      `Thank you for your total contribution of ₱${row.totalAmount.toLocaleString()}. ` +
      `Your support helps us rescue and care for animals.\n\n— StreetPaws`
    );
    window.open(`mailto:${row.donorEmail}?subject=${subject}&body=${body}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-5 h-5" />
            <span className="font-medium">{filtered.length} Donor{filtered.length === 1 ? '' : 's'}</span>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Input placeholder="Search donors..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button onClick={exportCsv} className="bg-orange-500 hover:bg-orange-600">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Top Donors Leaderboard */}
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Top Donors</span>
          </div>
          <div className="text-xs text-amber-700">Sorted by total given</div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {donors.slice(0, 3).map((d, idx) => (
            <div key={d.donorEmail} className={`rounded-xl p-4 bg-white shadow-sm border ${idx===0?'border-amber-300':'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${idx===0?'bg-amber-500':idx===1?'bg-gray-400':'bg-orange-400'}`}>
                  {idx===0? <Crown className="w-5 h-5" /> : idx===1? <Medal className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 truncate">{d.donorName || 'Anonymous'}</div>
                  <div className="text-xs text-gray-500 truncate">{d.donorEmail}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-lg font-bold text-amber-700">₱{d.totalAmount.toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{d.donationCount} donation{d.donationCount===1?'':'s'}</span>
                <span>Last: {new Date(d.lastDonationAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {donors.length===0 && (
            <div className="md:col-span-3 text-center text-gray-500">No donors yet</div>
          )}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Given</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Donation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((row) => (
                <tr key={row.donorEmail} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{row.donorName || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{row.donorEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₱{row.totalAmount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{row.donationCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(row.lastDonationAt).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button size="sm" variant="outline" onClick={() => emailDonor(row)}>
                      <Mail className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No donors found</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}


