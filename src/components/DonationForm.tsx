'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Heart, CreditCard, Shield, CheckCircle } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface DonationFormProps {
  onSuccess?: (donation: any) => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

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

function CheckoutForm({ onSuccess }: DonationFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    amount: 0,
    customAmount: '',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    purpose: 'general',
    dedication: '',
    isAnonymous: false,
    isRecurring: false,
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

  const getFinalAmount = () => {
    return formData.customAmount ? parseFloat(formData.customAmount) : formData.amount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Payment system not loaded. Please refresh the page.');
      return;
    }

    const finalAmount = getFinalAmount();
    if (finalAmount < 50) {
      setError('Minimum donation amount is ₱50');
      return;
    }

    if (!formData.donorName || !formData.donorEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(finalAmount * 100), // Convert to cents
          currency: 'php',
          donorInfo: {
            name: formData.donorName,
            email: formData.donorEmail,
            phone: formData.donorPhone,
            isAnonymous: formData.isAnonymous,
          },
          purpose: formData.purpose,
          dedication: formData.dedication,
          isRecurring: formData.isRecurring,
        }),
      });

      const { clientSecret, error: serverError } = await response.json();

      if (serverError) {
        setError(serverError);
        return;
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: formData.donorName,
            email: formData.donorEmail,
            phone: formData.donorPhone,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        setSuccess(true);
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isRecurring}
            onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Make this a monthly recurring donation</span>
        </label>
      </div>

      {/* Payment Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Information
        </label>
        <div className="p-4 border rounded-lg bg-gray-50">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <Shield className="w-4 h-4 mr-1" />
          Your payment information is secure and encrypted
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Donate ₱{getFinalAmount().toLocaleString()}
          </div>
        )}
      </Button>
    </form>
  );
}

export default function DonationForm({ onSuccess }: DonationFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm onSuccess={onSuccess} />
    </Elements>
  );
}
