'use client';

import { useState } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUploader from '@/components/ImageUploader';

interface InKindDonationFormProps {
  onSuccess?: (donation: any) => void;
}

const CATEGORIES = ['food', 'supplies', 'cage', 'medicine', 'other'];
const UNITS = ['pcs', 'kg', 'box', 'pack', 'liter'];

export default function InKindDonationForm({ onSuccess }: InKindDonationFormProps) {
  const { user } = useAuth();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    itemCategory: 'food',
    itemName: '',
    quantity: 1,
    unit: 'pcs',
    estimatedValue: '',
    message: '',
  });

  const handle = (k: string, v: any) => {
    setForm((p) => ({ ...p, [k]: v }));
    setError('');
  };

  const isValidEmail = (value: string) => /.+@.+\..+/.test(value);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to submit a donation');
      return;
    }
    if (!form.donorName || !form.donorEmail) {
      setError('Please fill in your name and email');
      return;
    }
    if (!isValidEmail(form.donorEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!form.itemName) {
      setError('Please enter the item name');
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    try {
      const donationData = {
        method: 'in-kind',
        donorName: form.donorName,
        donorEmail: form.donorEmail,
        donorPhone: form.donorPhone,
        itemCategory: form.itemCategory,
        itemName: form.itemName,
        quantity: Number(form.quantity),
        unit: form.unit,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined,
        message: form.message || '',
        screenshots: imageUrls,
        status: 'pledged',
        createdAt: new Date().toISOString(),
        userId: user.uid,
      };

      const donationsRef = collection(firestore, 'donations');
      const docRef = await addDoc(donationsRef, donationData as any);

      setSuccess(true);
      onSuccess?.({ ...donationData, id: docRef.id });
    } catch (err: any) {
      setError(err?.message || 'Failed to save donation');
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
        <p className="text-gray-600">We have received your pledge. Our team will coordinate with you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm text-gray-700">Donate goods or supplies</div>
        <div className="text-gray-900 font-semibold">Thank you for supporting StreetPaws</div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <Input value={form.donorName} onChange={(e) => handle('donorName', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <Input type="email" value={form.donorEmail} onChange={(e) => handle('donorEmail', e.target.value)} required />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select className="w-full border rounded-md px-3 py-2" value={form.itemCategory} onChange={(e) => handle('itemCategory', e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
          <Input value={form.itemName} onChange={(e) => handle('itemName', e.target.value)} placeholder="e.g., Cat Cage" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <Input type="number" min="1" value={form.quantity} onChange={(e) => handle('quantity', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
            <select className="w-full border rounded-md px-3 py-2" value={form.unit} onChange={(e) => handle('unit', e.target.value)}>
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value (₱, optional)</label>
          <Input type="number" min="0" value={form.estimatedValue} onChange={(e) => handle('estimatedValue', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
          <Input value={form.donorPhone} onChange={(e) => handle('donorPhone', e.target.value)} placeholder="+63 9xx xxx xxxx" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
        <Textarea value={form.message} onChange={(e) => handle('message', e.target.value)} rows={3} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Photos (optional)</label>
        <ImageUploader folder="inkind" max={3} onChange={setImageUrls} onUploadingChange={setUploading} />
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      <Button type="submit" disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold">
        Submit In‑Kind Donation
      </Button>
    </form>
  );
}


