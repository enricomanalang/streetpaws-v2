'use client';

import { Heart, MapPin, Users, Shield, Clock, CheckCircle, Globe, Code2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6">
              <Globe className="w-4 h-4 mr-2" />
              About StreetPaws
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About StreetPaws
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              A comprehensive Geographic Information System for Stray Animal Welfare in Lipa City, 
              connecting citizens, volunteers, and city officials to create a better future for our furry friends.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              To create a comprehensive platform that enables efficient management and care of stray animals 
              in Lipa City through technology, community engagement, and data-driven solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Compassion</CardTitle>
                <CardDescription className="text-base">
                  We believe every animal deserves care, respect, and a chance at a better life.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Community</CardTitle>
                <CardDescription className="text-base">
                  Building a network of caring citizens working together for animal welfare.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Innovation</CardTitle>
                <CardDescription className="text-base">
                  Using technology and data to create efficient solutions for animal welfare.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Removed duplicated "How It Works" to keep About focused on mission and partners */}

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Partners
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Working together with key organizations to make a difference in animal welfare.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Lipa City Veterinary Office</CardTitle>
                <CardDescription className="text-base">
                  Official government partner providing medical care and oversight
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Volunteer Network</CardTitle>
                <CardDescription className="text-base">
                  Dedicated community volunteers helping with rescue and care
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Animal Welfare Groups</CardTitle>
                <CardDescription className="text-base">
                  Local organizations focused on animal rescue and adoption
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Developers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with passion by BSIT students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Code2 className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Enrico Manalang</CardTitle>
                <CardDescription className="text-base">BSIT • Developer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Frontend and product experience</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Code2 className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Jennie Cuenca</CardTitle>
                <CardDescription className="text-base">BSIT • Developer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">UI, research, and content</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Code2 className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Abion Precious Grace</CardTitle>
                <CardDescription className="text-base">BSIT • Developer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Backend and quality assurance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Making a real difference in the lives of animals and the community.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-100">Animals Helped</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">1,200+</div>
              <div className="text-blue-100">Reports Processed</div>
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

      {/* Contact CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Together, we can make Lipa City a better place for all animals. 
            Every report, every volunteer hour, and every adoption makes a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors">
              Get Started Today
            </a>
            <a href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

