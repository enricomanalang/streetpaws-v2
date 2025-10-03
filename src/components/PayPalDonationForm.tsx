'use client';

import { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Heart, CreditCard, Shield, CheckCircle } from 'lucide-react';

interface PayPalDonationFormProps {
  onSuccess?: (donation: any) => void;
}

const QUICK_AMOUNTS = [
  { amount: 100, label: '₱100', description: 'Feeds 2 animals' },
  { amount: 500, label: '₱500', description: 'Feeds 10 animals' },
  { amount: 1000, label: '₱1,000', description: 'Medical care' },
  { amount: 2500, label: '₱2,500', description: 'Rescue operation' },
  { amount: 5000, label: '₱5,000', description: 'Major campaign' },
];

const DONATION_PURPOSES = [
  { value: 'general', label: 'General Fund', description: 'Support all our programs' },
  { value: 'medical', label: 'Medical Care', description: 'Veterinary treatments and medicine' },
  { value: 'food', label: 'Food & Supplies', description: 'Daily care and nutrition' },
  { value: 'rescue', label: 'Rescue Operations', description: 'Emergency rescue missions' },
  { value: 'education', label: 'Education Programs', description: 'Community awareness campaigns' },
];

function PayPalButtonWrapper({ 
  amount, 
  formData, 
  onSuccess, 
  onError 
}: { 
  amount: number; 
  formData: any; 
  onSuccess: (data: any) => void; 
  onError: (error: string) => void; 
}) {
  const [{ isPending }] = usePayPalScriptReducer();

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: 'PHP',
          value: amount.toString(),
        },
        description: `Donation to StreetPaws - ${formData.purpose}`,
        custom_id: JSON.stringify({
          donorName: formData.donorName,
          donorEmail: formData.donorEmail,
          donorPhone: formData.donorPhone,
          purpose: formData.purpose,
          dedication: formData.dedication,
          isAnonymous: formData.isAnonymous,
        })
      }],
    });
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order?.capture();
      
      // Save donation to database
      const donationData = {
        id: details.id,
        amount: amount,
        currency: 'PHP',
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone,
        isAnonymous: formData.isAnonymous,
        purpose: formData.purpose,
        dedication: formData.dedication,
        paymentMethod: 'paypal',
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        receiptSent: false,
        paypalOrderId: details.id,
      };

      // Save to Firebase (you'll need to implement this)
      console.log('Donation data:', donationData);
      
      onSuccess(donationData);
    } catch (error) {
      console.error('PayPal error:', error);
      onError('Payment processing failed. Please try again.');
    }
  };

  const onPayPalError = (err: any) => {
    console.error('PayPal error:', err);
    onError('Payment failed. Please try again.');
  };

  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onPayPalError}
      style={{
        layout: 'vertical',
        color: 'orange',
        shape: 'rect',
        label: 'donate'
      }}
    />
  );
}

export default function PayPalDonationForm({ onSuccess }: PayPalDonationFormProps) {
  const [formData, setFormData] = useState({
    amount: 0,
    customAmount: '',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    purpose: 'general',
    dedication: '',
    isAnonymous: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);

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

  const getFinalAmount = () => {
    return formData.customAmount ? parseFloat(formData.customAmount) : formData.amount;
  };

  const handleProceedToPayment = () => {
    const finalAmount = getFinalAmount();
    
    if (finalAmount < 50) {
      setError('Minimum donation amount is ₱50');
      return;
    }

    if (!formData.donorName || !formData.donorEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setShowPayPal(true);
    setError('');
  };

  const handleSuccess = (donation: any) => {
    setSuccess(true);
    onSuccess?.(donation);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setShowPayPal(false);
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-4">
          Your donation of ₱{getFinalAmount().toLocaleString()} has been processed successfully.
        </p>
        <p className="text-sm text-gray-500">
          A receipt has been sent to {formData.donorEmail}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showPayPal ? (
        <>
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Donation Amount
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {QUICK_AMOUNTS.map((option) => (
                <button
                  key={option.amount}
                  type="button"
                  onClick={() => handleAmountSelect(option.amount)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    formData.amount === option.amount && !formData.customAmount
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="font-bold text-lg">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
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

          {/* Donation Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Where should your donation go?
            </label>
            <div className="grid gap-2">
              {DONATION_PURPOSES.map((purpose) => (
                <label key={purpose.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="purpose"
                    value={purpose.value}
                    checked={formData.purpose === purpose.value}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{purpose.label}</div>
                    <div className="text-sm text-gray-500">{purpose.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Donor Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <Input
                type="text"
                value={formData.donorName}
                onChange={(e) => handleInputChange('donorName', e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.donorEmail}
                onChange={(e) => handleInputChange('donorEmail', e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <Input
              type="tel"
              value={formData.donorPhone}
              onChange={(e) => handleInputChange('donorPhone', e.target.value)}
              placeholder="+63 912 345 6789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dedication Message (Optional)
            </label>
            <Textarea
              value={formData.dedication}
              onChange={(e) => handleInputChange('dedication', e.target.value)}
              placeholder="Leave a message of hope or dedication..."
              rows={3}
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Make this donation anonymous</span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleProceedToPayment}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Proceed to Payment - ₱{getFinalAmount().toLocaleString()}
          </Button>
        </>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Donation</h3>
            <p className="text-gray-600">Amount: ₱{getFinalAmount().toLocaleString()}</p>
            <p className="text-sm text-gray-500">Purpose: {DONATION_PURPOSES.find(p => p.value === formData.purpose)?.label}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm text-gray-600">Secure payment by PayPal</span>
            </div>
            
            <PayPalButtonWrapper
              amount={getFinalAmount()}
              formData={formData}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>

          <div className="text-center">
            <Button
              onClick={() => setShowPayPal(false)}
              variant="outline"
            >
              Back to Form
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
