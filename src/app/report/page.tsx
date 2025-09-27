'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HydrationBoundary, useHydrationFix } from '@/lib/hydration-fix';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// Removed Select components to fix scroll jumping issue
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Camera, 
  Upload, 
  Send,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Heart
} from 'lucide-react';
import { ref, push, set } from 'firebase/database';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { database, firestore } from '@/lib/firebase';
import ImageUploader from '@/components/ImageUploader';
import LocationPicker from '@/components/LocationPicker';

export default function ReportPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Fix hydration issues caused by browser extensions
  useHydrationFix();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [formData, setFormData] = useState({
    animalType: '',
    breed: '',
    color: '',
    size: '',
    condition: '',
    location: '',
    latitude: '',
    longitude: '',
    description: '',
    urgency: 'medium',
    contactInfo: '',
    additionalNotes: ''
  });

  // Prevent unnecessary re-renders by memoizing form data
  const stableFormData = useRef(formData);
  stableFormData.current = formData;

  // Handle authentication redirect
  useEffect(() => {
    // Only redirect if auth is not loading and user is not authenticated
    if (!authLoading && (!user || !profile) && !hasRedirected) {
      setHasRedirected(true);
      router.push('/login');
    }
  }, [user, profile, authLoading, hasRedirected, router]);

  // Debug Firebase configuration (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== FIREBASE DEBUG INFO ===');
      console.log('Supabase Storage configured');
      console.log('Database object:', database);
      console.log('Environment variables:');
      console.log('- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
      console.log('- NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
      console.log('- NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set');
      console.log('- NEXT_PUBLIC_FIREBASE_DATABASE_URL:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
      
      // Test Firebase connection
      if (database) {
        console.log('Testing Firebase Database connection...');
        const testRef = ref(database, 'test');
        console.log('Database test reference created:', testRef);
      } else {
        console.error('Database is null - Firebase not initialized properly');
      }
      
      console.log('Supabase Storage ready for image uploads');
    }
  }, [database]);


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (location: {
    address: string;
    latitude: number;
    longitude: number;
  }) => {
    setFormData(prev => ({
      ...prev,
      location: location.address,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    }));
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    console.log('=== TESTING FIREBASE CONNECTION ===');
    
    try {
      // Test database
      if (database) {
        console.log('Testing database write...');
        const testRef = ref(database, 'test/connection');
        await set(testRef, { 
          timestamp: new Date().toISOString(),
          test: true 
        });
        console.log('Database write test successful');
      } else {
        console.error('Database is null');
        alert('Database is not initialized. Check Firebase configuration.');
        return;
      }
      
      // Test Firestore
      if (firestore) {
        console.log('Testing Firestore write...');
        const testDocRef = await addDoc(collection(firestore, 'test'), {
          timestamp: new Date().toISOString(),
          test: true
        });
        console.log('Firestore write test successful with ID:', testDocRef.id);
      } else {
        console.error('Firestore is null');
        alert('Firestore is not initialized. Check Firebase configuration.');
        return;
      }
      
      // Supabase Storage is ready
      console.log('Supabase Storage ready for image uploads');
      
      alert('Firebase connection test successful! Both Database and Firestore are working. You can now submit reports.');
    } catch (error) {
      console.error('Firebase test failed:', error);
      alert(`Firebase test failed: ${(error as any)?.message || 'Unknown error'}`);
    }
  };


  const handleImagesChange = (urls: string[]) => {
    setImageUrls(urls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    if (!user || !profile) {
      console.error('User or profile not available');
      setError('Please log in to submit a report');
      return;
    }

    setLoading(true);
    setError('');
    console.log('Loading state set to true');

    // Add a global timeout for the entire submission process
    const globalTimeout = setTimeout(() => {
      console.error('Global timeout reached - submission taking too long');
      console.error('Current state:', { loading, uploadingImages, error });
      setError('Submission is taking too long. Please try again.');
      setLoading(false);
      setUploadingImages(false);
    }, 30000); // 30 second global timeout

    try {
      console.log('=== SUBMISSION PROCESS START ===');
      console.log('User:', user?.uid);
      console.log('Profile:', profile);
      console.log('Images count:', imageUrls.length);
      console.log('Form data:', formData);
      
      // Progress tracker
      let progressStep = 0;
      const updateProgress = (step: string) => {
        progressStep++;
        const timestamp = new Date().toISOString();
        console.log(`[${progressStep}] ${timestamp} - ${step}`);
        console.log(`[${progressStep}] Current state:`, { loading, uploadingImages, error });
      };
      
      updateProgress('Starting submission process');
      
      // Use already uploaded Supabase URLs
      let uploadedImageUrls: string[] = imageUrls;
      updateProgress(`Images ready: ${uploadedImageUrls.length}`);
      
      // Create report data
      updateProgress('Creating report data object');
      // Prepend +63 to phone number
      const contactInfo = `+63 ${formData.contactInfo}`;

      const reportData = {
        ...formData,
        contactInfo,
        images: uploadedImageUrls,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        submittedBy: {
          uid: user.uid,
          name: profile.name || profile.email,
          email: profile.email,
          role: profile.role
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reportId: `RPT-${Date.now()}`
      };

      updateProgress('Report data prepared');
      console.log('Report data prepared:', reportData);

      // Save to Firestore with improved error handling
      updateProgress('Starting Firestore save');
      console.log('=== FIRESTORE SAVE START ===');
      console.log('Firestore object:', firestore);
      console.log('Firestore type:', typeof firestore);
      
      if (!firestore) {
        console.error('Firestore not initialized');
        throw new Error('Firestore not initialized');
      }
      
      updateProgress('Firestore validation passed');
      console.log('Saving to Firestore...');
      
      // Prepare data with server timestamp
      const firestoreData = {
        ...reportData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      updateProgress('Data prepared for database save');
      console.log('Starting database save operation...');
      
      updateProgress('Saving report to database...');
      
      // Skip Firestore due to timeout issues, use Realtime Database directly
      let docRef: any = null;
      let firestoreSuccess = false;
      
      // Use Realtime Database directly (more reliable)
      try {
        if (!database) {
          throw new Error('Database not initialized');
        }
        
        updateProgress('Saving to Realtime Database...');
        const reportRef = ref(database, `reports/${reportData.reportId}`);
        await set(reportRef, {
          ...reportData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          savedTo: 'realtime-database' // Mark where it was saved
        });
        
        updateProgress('Report saved to Realtime Database successfully');
        console.log('Report saved to Realtime Database successfully with ID:', reportData.reportId);
        
        // Create a mock docRef for consistency
        docRef = { id: reportData.reportId };
        firestoreSuccess = false;
      } catch (databaseError) {
        console.error('Database save failed:', databaseError);
        throw new Error(`Failed to save report: ${(databaseError as any)?.message || 'Unknown error'}`);
      }

      updateProgress('Setting success state');
      setSuccess(true);
      console.log('Success state set to true');
      
      // Show success message with save location
      console.log('Report saved to Realtime Database successfully');
      
      updateProgress('Preparing redirect to dashboard');
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Error submitting report:', err);
      console.error('Error details:', {
        message: (err as any)?.message,
        code: (err as any)?.code,
        stack: (err as any)?.stack
      });
      setError(`Failed to submit report: ${(err as any)?.message || 'Unknown error'}`);
      setUploadingImages(false);
    } finally {
      console.log('Setting loading to false');
      clearTimeout(globalTimeout);
      setLoading(false);
      setUploadingImages(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading || (!user || !profile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center" suppressHydrationWarning={true}>
        <div className="text-center" suppressHydrationWarning={true}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4" suppressHydrationWarning={true}></div>
          <p className="text-gray-600" suppressHydrationWarning={true}>Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center" suppressHydrationWarning={true}>
        <Card className="w-full max-w-md" suppressHydrationWarning={true}>
          <CardContent className="pt-6" suppressHydrationWarning={true}>
            <div className="text-center" suppressHydrationWarning={true}>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" suppressHydrationWarning={true} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2" suppressHydrationWarning={true}>Abuse Report Submitted!</h2>
              <p className="text-gray-600 mb-4" suppressHydrationWarning={true}>
                Your animal abuse report has been submitted successfully and is being reviewed by authorities.
              </p>
              <Button onClick={() => router.push('/dashboard')} className="w-full" suppressHydrationWarning={true}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Report Animal Abuse</h1>
              <p className="text-gray-600 mt-1">Report cases of animal cruelty, abuse, or animals in distress in Lipa City</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8 scroll-stable" style={{ pointerEvents: 'auto' }}>
          {/* Animal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Animal Information
              </CardTitle>
              <CardDescription>Provide details about the animal in distress or being abused</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animal Type *
                  </label>
                  <select 
                    value={formData.animalType} 
                    onChange={(e) => handleInputChange('animalType', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <option value="">Select animal type</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Breed
                  </label>
                  <Input
                    value={formData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    placeholder="e.g., Aspin, Persian, Mixed"
                    style={{ pointerEvents: 'auto' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <Input
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="e.g., Brown, Black, White"
                    style={{ pointerEvents: 'auto' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <select 
                    value={formData.size} 
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition/Abuse Type *
                  </label>
                  <select 
                    value={formData.condition} 
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select condition or abuse type</option>
                    <option value="physical-abuse">Physical Abuse/Beating</option>
                    <option value="neglect">Neglect/Starvation</option>
                    <option value="injured">Injured/In Pain</option>
                    <option value="chained">Chained/Confined</option>
                    <option value="abandoned">Abandoned</option>
                    <option value="fighting">Dog Fighting</option>
                    <option value="other-abuse">Other Abuse</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Information
              </CardTitle>
              <CardDescription>Where did you find this animal?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                placeholder="e.g., Barangay 1, Lipa City, Batangas"
                label="Location"
                required={true}
              />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description of Abuse/Situation *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what you witnessed: the abuse, neglect, or distress the animal is experiencing. Include details about the perpetrator if known, and the animal's current condition..."
                    rows={4}
                    required
                  />
                </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Evidence Photos
              </CardTitle>
              <CardDescription>Upload photos as evidence of the abuse or animal's condition (max 5 images)</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader 
                folder="reports"
                max={5}
                onChange={handleImagesChange}
                onUploadingChange={setUploadingImages}
              />
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level *
                  </label>
                  <select 
                    value={formData.urgency} 
                    onChange={(e) => handleInputChange('urgency', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="low">Low - Minor neglect, not life-threatening</option>
                    <option value="medium">Medium - Animal is suffering but stable</option>
                    <option value="high">High - Animal is in immediate danger</option>
                    <option value="urgent">Urgent - Life-threatening situation, call authorities immediately</option>
                  </select>
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    +63
                  </span>
                  <Input
                    type="tel"
                    value={formData.contactInfo}
                    onChange={(e) => {
                      // Only allow digits, limit to 10 digits
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      const limitedDigits = digitsOnly.substring(0, 10);
                      
                      // Format as XXX XXX XXXX or XXX XXX XXX
                      let formatted = '';
                      if (limitedDigits.length > 0) {
                        formatted = limitedDigits.substring(0, 3);
                      }
                      if (limitedDigits.length > 3) {
                        formatted += ' ' + limitedDigits.substring(3, 6);
                      }
                      if (limitedDigits.length > 6) {
                        formatted += ' ' + limitedDigits.substring(6);
                      }
                      
                      handleInputChange('contactInfo', formatted);
                    }}
                    placeholder="912 345 6789 or 912 345 678"
                    pattern="^[0-9]{3}\s[0-9]{3}\s[0-9]{3,4}$"
                    maxLength={12}
                    className="pl-12"
                  />
                </div>
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <Textarea
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    placeholder="Any additional details about the perpetrator, witnesses, or other relevant information that could help authorities..."
                    rows={3}
                  />
                </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="space-y-3">
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || uploadingImages || !formData.animalType || !formData.location || !formData.condition || !formData.description}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                {uploadingImages ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading Images...
                  </>
                ) : loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Report Abuse
                  </>
                )}
              </Button>
            </div>
            
          </div>
        </form>
      </main>
      </div>
  );
}
