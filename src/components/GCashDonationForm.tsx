'use client';

import { useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, push, update } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import ImageUploader from '@/components/ImageUploader';
import { CheckCircle, Shield, CreditCard, Smartphone, Upload } from 'lucide-react';

interface GCashDonationFormProps {
  gcashName: string;
  gcashNumber: string;
  gcashQrUrl?: string;
  onSuccess?: (donation: any) => void;
}

const QUICK_AMOUNTS = [100, 200, 300, 500, 1000, 2500];

export default function GCashDonationForm({ gcashName, gcashNumber, gcashQrUrl, onSuccess }: GCashDonationFormProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    amount: 0,
    customAmount: '',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    referenceNumber: '',
    purpose: 'general',
    message: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleAmountSelect = (amount: number) => {
    setFormData(prev => ({ ...prev, amount, customAmount: '' }));
  };

  const handleCustomAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, customAmount: value, amount }));
  };

  // Enforce digits-only and max length 13 for GCash reference number
  const handleReferenceChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 13);
    setFormData(prev => ({ ...prev, referenceNumber: digitsOnly }));
    setError('');
  };

  const getFinalAmount = () => (formData.customAmount ? parseFloat(formData.customAmount) : formData.amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = getFinalAmount();

    if (finalAmount < 50) {
      setError('Minimum donation amount is ₱50');
      return;
    }
    if (!formData.donorName || !formData.donorEmail) {
      setError('Please fill in your name and email');
      return;
    }
    if (!formData.referenceNumber) {
      setError('Please enter the GCash reference number');
      return;
    }
    if (formData.referenceNumber.length !== 13) {
      setError('GCash reference number must be exactly 13 digits');
      return;
    }

    try {
      if (!database) throw new Error('Database not initialized');

      const donationData = {
        method: 'gcash',
        amount: finalAmount,
        currency: 'PHP',
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone,
        purpose: formData.purpose,
        message: formData.message,
        referenceNumber: formData.referenceNumber,
        screenshots: imageUrls,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const donationsRef = ref(database, 'donations');
      const newRef = push(donationsRef);
      await update(newRef, donationData);

      setSuccess(true);
      onSuccess?.(donationData);
    } catch (err: any) {
      console.error('GCash donation error:', err);
      setError(err?.message || 'Failed to save donation');
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
        <p className="text-gray-600">We have received your GCash donation submission. Our team will verify it shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-4 bg-orange-50 border-orange-200">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-orange-600" />
          <div>
            <div className="text-sm text-gray-700">Send via GCash to</div>
            <div className="font-semibold text-gray-900">{gcashName} • {gcashNumber}</div>
          </div>
        </div>
        {gcashQrUrl && (
          <div className="mt-3">
            <img src={gcashQrUrl} alt="GCash QR" className="w-40 h-40 object-contain" />
          </div>
        )}
      </Card>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Donation Amount</label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleAmountSelect(amt)}
              className={`px-3 py-2 rounded-md border text-sm ${
                formData.amount === amt && !formData.customAmount ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              ₱{amt.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Custom amount"
            value={formData.customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            className="flex-1"
            min="50"
          />
          <span className="text-gray-500">₱</span>
        </div>
      </div>

      {/* Donor info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <Input value={formData.donorName} onChange={(e) => handleInputChange('donorName', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <Input type="email" value={formData.donorEmail} onChange={(e) => handleInputChange('donorEmail', e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
        <Input value={formData.donorPhone} onChange={(e) => handleInputChange('donorPhone', e.target.value)} placeholder="+63 9xx xxx xxxx" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose (optional)</label>
        <Input value={formData.purpose} onChange={(e) => handleInputChange('purpose', e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
        <Textarea value={formData.message} onChange={(e) => handleInputChange('message', e.target.value)} rows={3} />
      </div>

      {/* Reference + Screenshot */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GCash Reference No. *</label>
          <Input 
            value={formData.referenceNumber}
            onChange={(e) => handleReferenceChange(e.target.value)}
            required 
            placeholder="Enter the 13-digit reference number" 
            inputMode="numeric"
            pattern="\\d*"
            maxLength={13}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Upload className="w-4 h-4" /> Screenshot (optional)</label>
          <ImageUploader folder="gcash-receipts" max={3} onChange={setImageUrls} onUploadingChange={setUploading} />
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      <Button type="submit" disabled={uploading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold">
        Submit GCash Donation
      </Button>

      <div className="flex items-center mt-2 text-sm text-gray-500">
        <Shield className="w-4 h-4 mr-1" /> We will verify your submission within 24-48 hours
      </div>
    </form>
  );
}
