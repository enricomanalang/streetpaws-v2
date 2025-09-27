'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ClientOnly from '@/components/ClientOnly';
import { 
  MapPin, 
  Heart, 
  Shield, 
  BarChart3, 
  Smartphone, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Star,
  Globe
} from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // No automatic redirect - let users choose to go to dashboard or stay on home page

  if (loading) {
    return (
      <ClientOnly>
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: 'url(/Homepage_bg.jpg)', backgroundPosition: 'center center', imageRendering: 'auto' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
      </ClientOnly>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: 'url(/Homepage_bg.jpg)', backgroundPosition: 'center center', imageRendering: 'auto' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
            <Badge variant="secondary" className="mb-6">
              <Globe className="w-4 h-4 mr-2" />
              Serving Lipa City
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            StreetPaws
          </h1>
            <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              A comprehensive Geographic Information System for Stray Animal Welfare. 
              Help us make Lipa City safer and more compassionate for our furry friends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/report">
                    <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                      Report Animal Abuse
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How StreetPaws Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform connects citizens, volunteers, and city officials to create a comprehensive animal welfare network.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Report Animal Abuse</CardTitle>
                <CardDescription className="text-base">
                  Report cases of animal cruelty, abuse, or animals in distress with evidence photos and detailed descriptions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Request Adoptions</CardTitle>
                <CardDescription className="text-base">
                  Browse available animals for adoption, submit requests, and track your application status in real-time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Admin Dashboard</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive management tools for Lipa City Veterinary Office staff to oversee all operations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Making a Difference Together
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join our community of compassionate citizens working towards better animal welfare.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-100">Animals Helped</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">1,200+</div>
              <div className="text-blue-100">Reports Filed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">300+</div>
              <div className="text-blue-100">Successful Adoptions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-blue-100">Active Volunteers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose StreetPaws?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
                    <p className="text-gray-600">Monitor the status of your reports and adoption requests with live updates.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile-Friendly</h3>
                    <p className="text-gray-600">Access all features on your smartphone for convenient reporting on the go.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Analytics</h3>
                    <p className="text-gray-600">Comprehensive insights help city officials make informed decisions about animal welfare.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Driven</h3>
                    <p className="text-gray-600">Built by and for the Lipa City community to address local animal welfare needs.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">95%</div>
                    <div className="text-sm text-gray-600">Response Rate</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Clock className="w-8 h-8 text-green-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">2hrs</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Smartphone className="w-8 h-8 text-purple-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">100%</div>
                    <div className="text-sm text-gray-600">Mobile Ready</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Star className="w-8 h-8 text-yellow-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">4.9</div>
                    <div className="text-sm text-gray-600">User Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community of compassionate citizens and help make Lipa City a better place for animals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                    Access Your Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/adopt">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                    Browse Animals for Adoption
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                    Sign In to Continue
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">StreetPaws</span>
          </div>
            <p className="text-gray-400 mb-4">
              A Geographic Information System for Stray Animal Welfare in City of Lipa
            </p>
            <p className="text-sm text-gray-500">
              © 2024 StreetPaws. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
