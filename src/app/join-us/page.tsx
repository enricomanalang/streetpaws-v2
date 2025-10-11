'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';

export default function JoinUsPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    // Basic validations
    const phone = String(data.get('phone') || '');
    const ageStr = String(data.get('age') || '');
    const agreed = data.get('agree') === 'on';

    const phoneOk = /^09\d{9}$/.test(phone);
    const age = Number(ageStr);
    const ageOk = !Number.isNaN(age) && age >= 18 && age <= 100;

    if (!phoneOk) {
      alert('Please enter a valid phone number (starts with 09 and 11 digits).');
      return;
    }
    if (!ageOk) {
      alert('Age must be 18 or above.');
      return;
    }
    if (!agreed) {
      alert('You must agree to the volunteer waiver and terms.');
      return;
    }

    setSubmitting(true);
    try {
      if (!database) {
        throw new Error('Database not initialized');
      }

      const volunteerApplication = {
        firstName: data.get('firstName') || '',
        lastName: data.get('lastName') || '',
        address: data.get('address') || '',
        phone,
        email: data.get('email') || '',
        age,
        birthdate: data.get('birthdate') || null,
        background: data.get('occupation') || '',
        motivation: data.get('motivation') || '',
        skills: data.get('skills') || '',
        status: 'pending', // Default status
        agree: true,
        createdAt: new Date().toISOString(),
        applicationId: `VOL-${Date.now()}`
      };

      // Save to Firebase Realtime Database
      const volunteerRef = ref(database, 'volunteerApplications');
      const newVolunteerRef = push(volunteerRef);
      await set(newVolunteerRef, volunteerApplication);

      console.log('Volunteer application saved successfully:', volunteerApplication);
      alert('Thanks for applying to volunteer! Your application has been submitted.');
      form.reset();
    } catch (error) {
      console.error('Error saving volunteer application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Volunteer Application</h1>
              <p className="text-gray-600 mt-2">
                Join our mission. Fill out the form and our team will reach out.
              </p>
            </div>
            <a
              href="/waiver.pdf"
              target="_blank"
              title="Download Volunteer Waiver (PDF)"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <FileDown className="w-5 h-5" />
              <span className="sr-only">Download Volunteer Waiver (PDF)</span>
            </a>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Volunteer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                      <Input name="firstName" required placeholder="First" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
                      <Input name="lastName" required placeholder="Last" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <Input name="address" required placeholder="Street, Barangay, City" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone No. *</label>
                      <Input name="phone" type="tel" required placeholder="09xxxxxxxxx" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <Input name="email" type="email" required placeholder="you@example.com" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                      <Input name="age" type="number" min={18} max={100} required placeholder="18+" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                      <Input name="birthdate" type="date" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Background *</label>
                      <Input name="occupation" required placeholder="Occupation or Student" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to volunteer?</label>
                    <Textarea name="motivation" rows={4} placeholder="Tell us briefly" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relevant Skills</label>
                    <Textarea name="skills" rows={3} placeholder="e.g., animal handling, first aid, logistics, photography" />
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <div className="flex items-center gap-6 text-sm text-gray-700">
                        <label className="inline-flex items-center gap-2">
                          <input type="radio" name="status" value="single" className="accent-blue-600" />
                          <span>Single</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input type="radio" name="status" value="married" className="accent-blue-600" />
                          <span>Married</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input type="radio" name="status" value="others" className="accent-blue-600" />
                          <span>Others</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input id="agree" name="agree" type="checkbox" className="mt-1 accent-blue-600" required />
                    <label htmlFor="agree" className="text-sm text-gray-700">
                      I agree to the
                      {' '}<a href="/terms" target="_blank" className="text-blue-600 hover:underline">Volunteer Waiver and Terms</a>.
                    </label>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={submitting} className="px-6">
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="relative w-full h-[560px]">
              <div className="absolute -top-6 right-6">
                <div className="w-72 h-72 rounded-full outline outline-8 outline-white overflow-hidden shadow-md bg-gray-100">
                  <img
                    src="/volunteer-1.jpg"
                    alt="Volunteer team celebrating"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/globe.svg'; }}
                  />
                </div>
              </div>
              <div className="absolute top-36 -left-8">
                <div className="w-64 h-64 rounded-full outline outline-8 outline-white overflow-hidden shadow-md bg-gray-100">
                  <img
                    src="/volunteer-2.jpg"
                    alt="Hands together teamwork"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/window.svg'; }}
                  />
                </div>
              </div>
              <div className="absolute bottom-0 right-0">
                <div className="w-56 h-56 rounded-full outline outline-8 outline-white overflow-hidden shadow-md bg-gray-100">
                  <img
                    src="/volunteer-3.jpg"
                    alt="Children with friendly dog"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/next.svg'; }}
                  />
                </div>
              </div>
            </div>
            {/* waiver link moved to top as icon */}
          </div>
        </div>
      </section>
    </div>
  );
}


