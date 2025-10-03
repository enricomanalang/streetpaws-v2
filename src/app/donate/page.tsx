'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DonationForm from '@/components/DonationForm';
import { Heart, Shield, Users, PawPrint } from 'lucide-react';

export default function DonatePage() {
  const [showForm, setShowForm] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState<any>(null);

  const handleDonationSuccess = (donation: any) => {
    setDonationSuccess(donation);
  };

  if (donationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Generosity!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your donation of ₱{donationSuccess.amount?.toLocaleString()} will help us make a real difference in the lives of stray animals.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-orange-800 font-medium">
                A receipt has been sent to your email address.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Return Home
              </Button>
              <Button 
                onClick={() => setDonationSuccess(null)}
                variant="outline"
              >
                Make Another Donation
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {!showForm ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600 tracking-wide mb-6">
              DONATE ONLINE
            </h1>
            <div className="max-w-3xl mx-auto">
              <div className="bg-orange-100 border border-orange-300 rounded-xl p-6 mb-8">
                <p className="text-xl font-bold text-orange-700 mb-2">
                  "HELP US MAKE STREETS SAFER FOR ANIMALS"
                </p>
                <p className="text-orange-600">
                  Your donation supports rescue operations, medical care, and community education for stray animals across the Philippines.
                </p>
              </div>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-6 text-lg font-extrabold"
              >
                <Heart className="w-5 h-5 mr-2" />
                DONATE NOW
              </Button>
            </div>
          </div>

          {/* Impact Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PawPrint className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rescue Operations</h3>
              <p className="text-gray-600">Emergency rescue missions for injured and abandoned animals</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Medical Care</h3>
              <p className="text-gray-600">Veterinary treatments, vaccinations, and rehabilitation</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Education</h3>
              <p className="text-gray-600">Community awareness and responsible pet ownership programs</p>
            </Card>
          </div>

          {/* Donation Impact */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Your Impact</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">₱100</div>
                <div className="text-sm text-gray-600">Feeds 2 animals for a day</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">₱500</div>
                <div className="text-sm text-gray-600">Covers basic medical care</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">₱1,000</div>
                <div className="text-sm text-gray-600">Funds a rescue operation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">₱5,000</div>
                <div className="text-sm text-gray-600">Supports major campaign</div>
              </div>
            </div>
          </div>

          {/* Security & Trust */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Secure & Encrypted</span>
            </div>
            <p className="text-sm text-gray-500">
              Your payment information is protected with bank-level security
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Make a Donation</h2>
              <p className="text-gray-600">Help us make a difference in the lives of stray animals</p>
            </div>
            <DonationForm onSuccess={handleDonationSuccess} />
            <div className="mt-6 text-center">
              <Button 
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Back to Donation Info
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}



