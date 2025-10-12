'use client';

import { useEffect, useMemo, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { Card } from '@/components/ui/card';
import { Package, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Donation {
  id: string;
  method?: string;
  itemName?: string;
  itemCategory?: string;
  quantity?: number;
  unit?: string;
  status: string;
  createdAt?: string;
}

interface StockItem {
  itemName: string;
  unit: string;
  quantity: number;
  category?: string;
  lastUpdated?: string;
}

export default function Inventory() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database) return;
    const donationsRef = ref(database, 'donations');
    const unsub = onValue(donationsRef, (snap) => {
      if (snap.exists()) {
        const donationsData = snap.val();
        const list = Object.keys(donationsData).map(key => ({
          id: key,
          ...donationsData[key]
        })) as Donation[];
        setDonations(list);
      } else {
        setDonations([]);
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => off(donationsRef, 'value', unsub);
  }, []);

  const stock = useMemo(() => {
    const map = new Map<string, StockItem>();
    for (const d of donations) {
      if (d.method !== 'in-kind') continue;
      if (!d.itemName || !d.unit) continue;
      
      const key = `${d.itemName.toLowerCase()}__${d.unit}`;
      const entry = map.get(key) || { 
        itemName: d.itemName, 
        unit: d.unit, 
        quantity: 0,
        category: d.itemCategory,
        lastUpdated: d.createdAt
      };
      
      if (d.status === 'distributed') {
        // skip adding; in a fuller system we'd track outflows
      } else {
        entry.quantity += Number(d.quantity || 0);
        if (d.createdAt && (!entry.lastUpdated || d.createdAt > entry.lastUpdated)) {
          entry.lastUpdated = d.createdAt;
        }
      }
      map.set(key, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);
  }, [donations]);

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'food': return '🍽️';
      case 'supplies': return '📦';
      case 'cage': return '🏠';
      case 'medicine': return '💊';
      default: return '📋';
    }
  };

  const getQuantityStatus = (quantity: number) => {
    if (quantity === 0) return { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle, text: 'Out of Stock' };
    if (quantity <= 5) return { color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle, text: 'Low Stock' };
    if (quantity <= 20) return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock, text: 'Medium Stock' };
    return { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, text: 'In Stock' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalItems = stock.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = stock.filter(item => item.quantity <= 5).length;
  const outOfStockItems = stock.filter(item => item.quantity === 0).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Items</p>
              <p className="text-2xl font-bold text-blue-900">{totalItems}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-900">{lowStockItems}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900">{outOfStockItems}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">In-Kind Inventory</h3>
              <p className="text-sm text-gray-600">Current stock levels and item status</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 mr-1" />
              {stock.length} items
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stock.map((item) => {
                const status = getQuantityStatus(item.quantity);
                const StatusIcon = status.icon;
                
                return (
                  <tr key={`${item.itemName}-${item.unit}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">{getCategoryIcon(item.category)}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                          <div className="text-sm text-gray-500">Unit: {item.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-semibold text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.text}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 capitalize">
                        {item.category || 'Other'}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {stock.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Package className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items yet</h3>
                      <p className="text-gray-500">In-kind donations will appear here once they are received.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


