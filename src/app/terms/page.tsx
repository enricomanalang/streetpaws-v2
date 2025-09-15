'use client';

import { Heart, Shield, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Please read these terms carefully before using StreetPaws. 
              By using our service, you agree to be bound by these terms.
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                By accessing and using StreetPaws, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                2. Use License
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily use StreetPaws for personal, non-commercial transitory viewing only. 
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-6 h-6 mr-2" />
                3. User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                As a user of StreetPaws, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate and truthful information in all reports</li>
                <li>Respect the privacy and safety of animals and other users</li>
                <li>Not use the service for any illegal or unauthorized purpose</li>
                <li>Not interfere with or disrupt the service or servers</li>
                <li>Not attempt to gain unauthorized access to any part of the service</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>4. Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, 
                to understand our practices. We collect and use your information as described in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                You may not use our service:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>6. Content and Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                All content, including but not limited to text, graphics, images, and data, contained in or available through StreetPaws 
                is the property of the City of Lipa or its content suppliers and is protected by copyright laws. 
                You may not reproduce, distribute, or create derivative works from this content without express written permission.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, 
                the City of Lipa excludes all representations, warranties, conditions and terms relating to our website and the use of this website.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Limitations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                In no event shall the City of Lipa or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use StreetPaws, 
                even if the City of Lipa or a City of Lipa authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. Accuracy of Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                The materials appearing on StreetPaws could include technical, typographical, or photographic errors. 
                The City of Lipa does not warrant that any of the materials on its website are accurate, complete, or current. 
                The City of Lipa may make changes to the materials contained on its website at any time without notice.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>10. Links</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                The City of Lipa has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. 
                The inclusion of any link does not imply endorsement by the City of Lipa of the site. 
                Use of any such linked website is at the user's own risk.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>11. Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                The City of Lipa may revise these terms of service for its website at any time without notice. 
                By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>12. Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                These terms and conditions are governed by and construed in accordance with the laws of the Philippines 
                and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@streetpaws.ph<br />
                  <strong>Phone:</strong> +63 43 123 4567<br />
                  <strong>Address:</strong> City Hall Complex, Lipa City, Batangas, Philippines
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

