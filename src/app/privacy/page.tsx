'use client';

import { Heart, Shield, Eye, Lock, Database, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, 
              use, and protect your personal information when you use StreetPaws.
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
                <Shield className="w-6 h-6 mr-2" />
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                submit a report, or contact us for support. This may include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Personal information (name, email address, phone number)</li>
                <li>Account information (username, password, role preferences)</li>
                <li>Report data (location, photos, descriptions of animals)</li>
                <li>Communication data (messages, feedback, support requests)</li>
                <li>Usage data (how you interact with our service)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-6 h-6 mr-2" />
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process and respond to animal welfare reports</li>
                <li>Communicate with you about your account and our services</li>
                <li>Send you important updates and notifications</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Ensure the safety and security of our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-6 h-6 mr-2" />
                3. Information Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>With City Officials:</strong> Report data may be shared with Lipa City Veterinary Office and other relevant city departments</li>
                <li><strong>With Volunteers:</strong> Limited information may be shared with verified volunteers to facilitate animal care</li>
                <li><strong>For Legal Reasons:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                <li><strong>In Emergency Situations:</strong> To protect the welfare of animals or public safety</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We do not sell, trade, or rent your personal information to third parties for marketing purposes.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-6 h-6 mr-2" />
                4. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication systems</li>
                <li>Secure data storage and backup procedures</li>
                <li>Staff training on data protection practices</li>
              </ul>
              <p className="text-gray-700 mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-6 h-6 mr-2" />
                5. Your Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Request a copy of your data in a structured format</li>
                <li><strong>Objection:</strong> Object to certain processing of your information</li>
                <li><strong>Withdrawal of Consent:</strong> Withdraw consent for data processing where applicable</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, 
                unless a longer retention period is required or permitted by law. Report data may be retained longer for statistical 
                and analytical purposes to improve animal welfare services.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We use cookies and similar tracking technologies to enhance your experience on our website. 
                These technologies help us understand how you use our service and improve its functionality. 
                You can control cookie settings through your browser preferences.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Our service may integrate with third-party services (such as mapping services, cloud storage, etc.). 
                These services have their own privacy policies, and we encourage you to review them. 
                We are not responsible for the privacy practices of these third-party services.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Our service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If we become aware that we have collected personal 
                information from a child under 13, we will take steps to delete such information.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>10. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure that such transfers comply with applicable data protection laws and implement appropriate 
                safeguards to protect your information.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>11. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any changes by posting 
                the new privacy policy on this page and updating the "Last updated" date. We encourage you to review 
                this privacy policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Data Protection Officer:</strong><br />
                  <strong>Email:</strong> privacy@streetpaws.ph<br />
                  <strong>Phone:</strong> +63 43 123 4567<br />
                  <strong>Address:</strong> City Hall Complex, Lipa City, Batangas, Philippines
                </p>
              </div>
              <p className="text-gray-700 mt-4">
                We will respond to your inquiry within 30 days of receipt.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>13. Compliance with Laws</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                This privacy policy is designed to comply with applicable data protection laws, including the 
                Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines. If you believe we have 
                not complied with applicable laws, you have the right to file a complaint with the National 
                Privacy Commission.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

