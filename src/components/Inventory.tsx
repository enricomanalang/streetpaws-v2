'use client';

import { useEffect, useMemo, useState } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Card } from '@/components/ui/card';

interface Donation {
  id: string;
  method?: string;
  itemName?: string;
  itemCategory?: string;
  quantity?: number;
  unit?: string;
  status: string;
}

export default function Inventory() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;
    const unsub = onSnapshot(collection(firestore, 'donations'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Donation[];
      setDonations(list);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const stock = useMemo(() => {
    const map = new Map<string, { itemName: string; unit: string; quantity: number }>();
    for (const d of donations) {
      if (d.method !== 'in-kind') continue;
      if (!d.itemName || !d.unit) continue;
      // Consider pledged + completed as stock; reduce when distributed
      const key = `${d.itemName.toLowerCase()}__${d.unit}`;
      const entry = map.get(key) || { itemName: d.itemName, unit: d.unit, quantity: 0 };
      if (d.status === 'distributed') {
        // skip adding; in a fuller system we'd track outflows
      } else {
        entry.quantity += Number(d.quantity || 0);
      }
      map.set(key, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);
  }, [donations]);

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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">In‑Kind Inventory (Simple)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stock.map((s) => (
                <tr key={`${s.itemName}-${s.unit}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{s.itemName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{s.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{s.unit}</div>
                  </td>
                </tr>
              ))}
              {stock.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">No in‑kind items yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


