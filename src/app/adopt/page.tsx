'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HydrationBoundary } from '@/lib/hydration-fix';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Home,
  Users,
  FileText,
  Camera
} from 'lucide-react';
import { ref, get, push, set } from 'firebase/database';
import { database } from '@/lib/firebase';

interface AvailableAnimal {
  id: string;
  animalType: string;
  breed: string;
  color: string;
  size: string;
  age: string;
  gender: string;
  description: string;
  images: string[];
  location: string;
  condition: string;
  availableForAdoption: boolean;
  reportId: string;
}

export default function AdoptPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [availableAnimals, setAvailableAnimals] = useState<AvailableAnimal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<AvailableAnimal | null>(null);
  const ImageCarousel = ({ images, height = 192 }: { images: string[]; height?: number }) => {
    const [active, setActive] = useState(0);
    const scrollerRef = useRef<HTMLDivElement | null>(null);

    const onScroll = () => {
      const el = scrollerRef.current;
      if (!el) return;
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActive(Math.max(0, Math.min(idx, images.length - 1)));
    };

    const goTo = (idx: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
      setActive(idx);
    };

    if (!images || images.length === 0) return null;

    return (
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="w-full rounded-t-lg overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory"
          style={{ height: `${height}px`, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex w-full h-full">
            {images.map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`photo-${idx + 1}`}
                className="w-full h-full object-cover flex-shrink-0 snap-center"
                draggable={false}
              />
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 w-2 rounded-full ${i === active ? 'bg-white' : 'bg-white/60'} shadow`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };


  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    age: '',
    occupation: '',
    experience: '',
    livingSituation: '',
    otherPets: '',
    reasonForAdoption: '',
    howDidYouHear: '',
    additionalInfo: ''
  });

  useEffect(() => {
    if (!user || !profile) {
      router.push('/login');
      return;
    }

    // Load available animals from reports that are available for adoption
    loadAvailableAnimals();
  }, [user, profile, router]);

  const loadAvailableAnimals = async () => {
    try {
      console.log('Loading available animals...');
      // Load from approvedReports collection where animals are marked for adoption
      const approvedReportsRef = ref(database, 'approvedReports');
      const snapshot = await get(approvedReportsRef);
      
      if (snapshot.exists()) {
        const reports = snapshot.val();
        const animals: AvailableAnimal[] = [];
        
        Object.keys(reports).forEach(key => {
          const report = reports[key];
          console.log(`Checking report ${key}:`, {
            availableForAdoption: report.availableForAdoption,
            status: report.status,
            animalType: report.animalType,
            age: report.age
          });
          
          if (report.availableForAdoption && report.status === 'completed') {
            // Ensure all required fields have default values
            const animalData = {
              id: key,
              animalType: report.animalType || 'Unknown',
              breed: report.breed || 'Mixed Breed',
              color: report.color || 'Unknown',
              size: report.size || 'Unknown',
              age: report.age || 'Unknown',
              gender: report.gender || 'Unknown',
              description: report.description || 'No description available',
              images: report.images || [],
              location: report.location || 'Unknown location',
              condition: report.condition || 'Unknown',
              availableForAdoption: report.availableForAdoption,
              reportId: report.reportId || key
            };
            
            animals.push(animalData);
            console.log('Added animal:', animalData);
          }
        });
        
        console.log(`Found ${animals.length} available animals:`, animals);
        setAvailableAnimals(animals);
      } else {
        console.log('No approved reports found');
        setAvailableAnimals([]);
      }
    } catch (err) {
      console.error('Error loading animals:', err);
      setAvailableAnimals([]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      const testRef = ref(database, 'test');
      await set(testRef, { test: 'connection', timestamp: new Date().toISOString() });
      console.log('Database connection test successful');
      await set(testRef, null); // Clean up test data
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  };

  const cleanUndefinedValues = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => cleanUndefinedValues(item));
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = cleanUndefinedValues(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !selectedAnimal) return;

    setLoading(true);
    setError('');

    try {
      console.log('=== ADOPTION REQUEST DEBUG ===');
      console.log('User:', user?.uid);
      console.log('Profile:', profile);
      console.log('Selected Animal:', selectedAnimal);
      console.log('Form Data:', formData);
      console.log('Database object:', database);

      // Check if database is initialized
      if (!database) {
        throw new Error('Database not initialized. Please refresh the page.');
      }

      // Test database connection first
      const connectionTest = await testDatabaseConnection();
      if (!connectionTest) {
        throw new Error('Database connection failed. Please check your internet connection.');
      }

      // Validate required fields
      const requiredFields = ['fullName', 'email', 'phone', 'age', 'address', 'experience', 'livingSituation', 'reasonForAdoption'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Prepend +63 to phone number
      const phone = `+63 ${formData.phone}`;

      // Create adoption request data with null safety
      const adoptionData = {
        ...formData,
        phone,
        animalId: selectedAnimal.id,
        animalInfo: {
          animalType: selectedAnimal.animalType || 'Unknown',
          breed: selectedAnimal.breed || 'Mixed Breed',
          color: selectedAnimal.color || 'Unknown',
          size: selectedAnimal.size || 'Unknown',
          age: selectedAnimal.age || 'Unknown',
          gender: selectedAnimal.gender || 'Unknown',
          description: selectedAnimal.description || 'No description available',
          images: selectedAnimal.images || [],
          location: selectedAnimal.location || 'Unknown location'
        },
        applicant: {
          uid: user.uid,
          name: profile.name || profile.email,
          email: profile.email,
          role: profile.role
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requestId: `ADOPT-${Date.now()}`
      };

      console.log('Adoption data prepared:', adoptionData);

      // Clean undefined values before saving to Firebase
      const cleanedData = cleanUndefinedValues(adoptionData);
      console.log('Cleaned adoption data:', cleanedData);

      // Save to Firebase
      const adoptionsRef = ref(database, 'adoptionRequests');
      console.log('Adoption ref created:', adoptionsRef);
      
      const newAdoptionRef = push(adoptionsRef);
      console.log('New adoption ref:', newAdoptionRef);
      
      await set(newAdoptionRef, cleanedData);
      console.log('Adoption request saved successfully');

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Error submitting adoption request:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : undefined
      });
      
      // More specific error messages
      if (err instanceof Error) {
        if (err.message.includes('permission')) {
          setError('Permission denied. Please make sure you are logged in and try again.');
        } else if (err.message.includes('network')) {
          setError('Network error. Please check your internet connection and try again.');
        } else if (err.message.includes('Database not initialized')) {
          setError('Database connection error. Please refresh the page and try again.');
        } else if (err.message.includes('Database connection failed')) {
          setError('Database connection failed. Please check your internet connection and try again.');
        } else if (err.message.includes('Please fill in all required fields')) {
          setError(err.message);
        } else {
          setError(`Failed to submit adoption request: ${err.message}`);
        }
      } else {
        setError('Failed to submit adoption request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Adoption Request Submitted!</h2>
              <p className="text-gray-600 mb-4">
                Your adoption request has been submitted and is pending admin review.
              </p>
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <HydrationBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Adopt a Pet</h1>
              <p className="text-gray-600 mt-1">Give a loving home to rescued animals in Lipa City</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {!selectedAnimal ? (
          // Animal Selection
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Animals for Adoption</h2>
              <p className="text-gray-600">Select an animal you'd like to adopt</p>
            </div>

            {availableAnimals.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Animals Available</h3>
                    <p className="text-gray-500">There are currently no animals available for adoption.</p>
                    <p className="text-gray-500">Check back later or submit a report if you find a stray animal.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableAnimals.map((animal) => (
                  <Card key={animal.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedAnimal(animal)}>
                    <CardContent className="p-0">
                      {animal.images && animal.images.length > 0 ? (
                        <ImageCarousel images={animal.images} height={192} />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                          <Camera className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="capitalize">
                            {animal.animalType}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {animal.size}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {animal.breed || 'Mixed Breed'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {animal.color} • {animal.age || 'Age unknown'} • {animal.gender || 'Unknown gender'}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {animal.description}
                        </p>
                        <Button className="w-full mt-3" variant="outline">
                          Select for Adoption
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Adoption Form
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Selected Animal Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Heart className="w-5 h-5 mr-2" />
                  Selected Animal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  {selectedAnimal.images && selectedAnimal.images.length > 0 ? (
                    <ImageCarousel images={selectedAnimal.images} height={80} />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedAnimal.breed || 'Mixed Breed'} {selectedAnimal.animalType}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedAnimal.color} • {selectedAnimal.size} • {selectedAnimal.age || 'Age unknown'}
                    </p>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedAnimal(null)}
                      className="mt-1"
                    >
                      Change Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        +63
                      </span>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          // Only allow digits, limit to 10 digits
                          const digitsOnly = e.target.value.replace(/\D/g, '');
                          const limitedDigits = digitsOnly.substring(0, 10);
                          
                          // Format as XXX XXX XXXX
                          let formatted = '';
                          if (limitedDigits.length > 0) {
                            formatted = limitedDigits.substring(0, 3);
                          }
                          if (limitedDigits.length > 3) {
                            formatted += ' ' + limitedDigits.substring(3, 6);
                          }
                          if (limitedDigits.length > 6) {
                            formatted += ' ' + limitedDigits.substring(6, 10);
                          }
                          
                          handleInputChange('phone', formatted);
                        }}
                        placeholder="912 345 6789"
                        pattern="^[0-9]{3}\s[0-9]{3}\s[0-9]{4}$"
                        maxLength={12}
                        className="pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="25"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complete Address *
                  </label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Your complete address including barangay, city, province"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupation
                  </label>
                  <Input
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    placeholder="Your job or profession"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pet Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Pet Experience & Living Situation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet Ownership Experience *
                  </label>
                  <select 
                    value={formData.experience} 
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select your experience level</option>
                    <option value="none">No experience</option>
                    <option value="some">Some experience</option>
                    <option value="experienced">Experienced</option>
                    <option value="very-experienced">Very experienced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Living Situation *
                  </label>
                  <select 
                    value={formData.livingSituation} 
                    onChange={(e) => handleInputChange('livingSituation', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select your living situation</option>
                    <option value="house-with-yard">House with yard</option>
                    <option value="house-no-yard">House without yard</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condominium</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Pets
                  </label>
                  <Textarea
                    value={formData.otherPets}
                    onChange={(e) => handleInputChange('otherPets', e.target.value)}
                    placeholder="List any other pets you currently have (type, age, gender)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Adoption Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="w-5 h-5 mr-2" />
                  Adoption Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Adoption *
                  </label>
                  <Textarea
                    value={formData.reasonForAdoption}
                    onChange={(e) => handleInputChange('reasonForAdoption', e.target.value)}
                    placeholder="Why do you want to adopt this animal? How will you care for them?"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How did you hear about us?
                  </label>
                  <select 
                    value={formData.howDidYouHear} 
                    onChange={(e) => handleInputChange('howDidYouHear', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select an option</option>
                    <option value="website">Website</option>
                    <option value="social-media">Social Media</option>
                    <option value="friend">Friend/Family</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <Textarea
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    placeholder="Any additional information you'd like to share..."
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

            {/* Debug Section - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-yellow-800">Debug Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <p><strong>User:</strong> {user?.uid || 'Not logged in'}</p>
                    <p><strong>Profile:</strong> {profile?.email || 'No profile'}</p>
                    <p><strong>Database:</strong> {database ? 'Connected' : 'Not connected'}</p>
                    <p><strong>Selected Animal:</strong> {selectedAnimal?.id || 'None selected'}</p>
                  </div>
                  <Button 
                    onClick={async () => {
                      console.log('=== MANUAL DEBUG TEST ===');
                      const testResult = await testDatabaseConnection();
                      alert(testResult ? 'Database connection successful!' : 'Database connection failed!');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Test Database Connection
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => setSelectedAnimal(null)}>
                Back to Selection
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.fullName || !formData.email || !formData.phone || !formData.age || !formData.address || !formData.experience || !formData.livingSituation || !formData.reasonForAdoption}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Submit Adoption Request
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </main>
      </div>
    </HydrationBoundary>
  );
}
