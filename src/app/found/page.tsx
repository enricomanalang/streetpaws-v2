'use client';

import { useState, useEffect } from 'react';
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
  Search, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  MapPin,
  Calendar,
  Camera,
  Plus,
  Eye,
  X
} from 'lucide-react';
import { ref, get, push, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import ImageUploader from '@/components/ImageUploader';
import LocationPicker from '@/components/LocationPicker';

interface FoundPet {
  id: string;
  animalType: string;
  breed: string;
  color: string;
  size: string;
  age: string;
  gender: string;
  description: string;
  foundLocation: string;
  foundDate: string;
  contactInfo: string;
  images: string[];
  status: 'found' | 'reunited';
  submittedBy: {
    uid: string;
    name: string;
    email: string;
  };
  createdAt: string;
  reportId: string;
}

export default function FoundPetsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [foundPets, setFoundPets] = useState<FoundPet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedPet, setSelectedPet] = useState<FoundPet | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimData, setClaimData] = useState({
    ownerName: '',
    ownerContact: '',
    ownerEmail: '',
    proofOfOwnership: '',
    additionalInfo: ''
  });

  const [formData, setFormData] = useState({
    animalType: '',
    breed: '',
    color: '',
    size: '',
    age: '',
    gender: '',
    description: '',
    foundLocation: '',
    latitude: '',
    longitude: '',
    foundDate: '',
    contactInfo: ''
  });

  useEffect(() => {
    loadFoundPets();
  }, []);

  const loadFoundPets = async () => {
    try {
      const foundPetsRef = ref(database, 'foundPets');
      const snapshot = await get(foundPetsRef);
      
      if (snapshot.exists()) {
        const pets = snapshot.val();
        const petsList: FoundPet[] = Object.keys(pets).map(key => ({
          id: key,
          ...pets[key]
        }));
        setFoundPets(petsList.filter(pet => pet.status === 'approved'));
      }
    } catch (err) {
      console.error('Error loading found pets:', err);
    }
  };

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
      foundLocation: location.address,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    }));
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !selectedPet) return;

    setLoading(true);
    setError('');

    try {
      const claimSubmission = {
        ...claimData,
        petId: selectedPet.id,
        petDetails: {
          animalType: selectedPet.animalType,
          breed: selectedPet.breed,
          color: selectedPet.color,
          foundLocation: selectedPet.foundLocation
        },
        claimedBy: {
          uid: user.uid,
          name: profile.name || profile.email,
          email: profile.email
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        claimId: `CLAIM-${Date.now()}`
      };

      const claimsRef = ref(database, 'petClaims');
      const newClaimRef = push(claimsRef);
      await set(newClaimRef, claimSubmission);

      setSuccess(true);
      setShowClaimModal(false);
      setClaimData({
        ownerName: '',
        ownerContact: '',
        ownerEmail: '',
        proofOfOwnership: '',
        additionalInfo: ''
      });
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      console.error('Error submitting claim:', err);
      setError('Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setLoading(true);
    setError('');

    try {
      // Prepend +63 to phone numbers if it's not an email
      const contactInfo = formData.contactInfo.includes('@') 
        ? formData.contactInfo 
        : `+63 ${formData.contactInfo}`;

      const foundPetData = {
        ...formData,
        images: imageUrls,
        contactInfo,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        status: 'found',
        submittedBy: {
          uid: user.uid,
          name: profile.name || profile.email,
          email: profile.email
        },
        createdAt: new Date().toISOString(),
        reportId: `FOUND-${Date.now()}`
      };

      const foundPetsRef = ref(database, 'foundPets');
      const newFoundPetRef = push(foundPetsRef);
      await set(newFoundPetRef, foundPetData);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
        setFormData({
          animalType: '',
          breed: '',
          color: '',
          size: '',
          age: '',
          gender: '',
          description: '',
          foundLocation: '',
          foundDate: '',
          contactInfo: ''
        });
        setImageUrls([]);
        loadFoundPets();
      }, 2000);

    } catch (err) {
      console.error('Error submitting found pet report:', err);
      setError('Failed to submit found pet report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = foundPets.filter(pet =>
    pet.animalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.foundLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
              <p className="text-gray-600 mb-4">
                Your found pet report has been submitted successfully.
              </p>
              <Button onClick={() => setSuccess(false)} className="w-full">
                Continue
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
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Found Pets</h1>
                <p className="text-gray-600 mt-1">Help reunite found pets with their families</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Report Found Pet
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {showForm ? (
          // Report Found Pet Form
          <Card>
            <CardHeader>
              <CardTitle>Report a Found Pet</CardTitle>
              <CardDescription>Provide details about the pet you found to help reunite them with their family</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Animal Type *
                    </label>
                    <select 
                      value={formData.animalType} 
                      onChange={(e) => handleInputChange('animalType', e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <Input
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="e.g., 2 years old, Puppy, Adult"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select 
                      value={formData.gender} 
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Found Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.foundDate}
                      onChange={(e) => handleInputChange('foundDate', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (max 5)
                  </label>
                  <ImageUploader
                    folder="found"
                    max={5}
                    onChange={setImageUrls}
                    onUploadingChange={setUploadingImages}
                  />
                </div>

                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  placeholder="e.g., Barangay 1, Lipa City, Batangas"
                  label="Found Location"
                  required={true}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the pet's appearance, behavior, condition, and any distinctive features..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Information *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      +63
                    </span>
                    <Input
                      type="tel"
                      value={formData.contactInfo}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        
                        // If user is typing an email, allow it
                        if (inputValue.includes('@')) {
                          handleInputChange('contactInfo', inputValue);
                          return;
                        }
                        
                        // For phone numbers, only allow digits, limit to 10 digits
                        const digitsOnly = inputValue.replace(/\D/g, '');
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
                        
                        handleInputChange('contactInfo', formatted);
                      }}
                      placeholder="912 345 6789 or email"
                      pattern="^([0-9]{3}\s[0-9]{3}\s[0-9]{4}|[^\s@]+@[^\s@]+\.[^\s@]+)$"
                      maxLength={50}
                      className="pl-12"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || uploadingImages || !formData.animalType || !formData.foundLocation || !formData.foundDate || !formData.contactInfo}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          // Found Pets List
          <div className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search found pets by type, breed, color, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Found Pets Grid */}
            {filteredPets.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? 'No matching pets found' : 'No found pets reported'}
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Try adjusting your search terms' : 'Be the first to report a found pet'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPets.map((pet) => (
                  <Card key={pet.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      {pet.images && pet.images.length > 0 ? (
                        <img
                          src={pet.images[0]}
                          alt={pet.animalType}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                          <Camera className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 capitalize">{pet.animalType}</h3>
                          <Badge variant="default" className="bg-green-600">Found</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {pet.breed && <p><span className="font-medium">Breed:</span> {pet.breed}</p>}
                          {pet.color && <p><span className="font-medium">Color:</span> {pet.color}</p>}
                          {pet.size && <p><span className="font-medium">Size:</span> {pet.size}</p>}
                          {pet.age && <p><span className="font-medium">Age:</span> {pet.age}</p>}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {pet.foundLocation}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            Found: {new Date(pet.foundDate).toLocaleDateString()}
                          </div>
                        </div>
                        {pet.description && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {pet.description}
                          </p>
                        )}
                        <Button 
                          className="w-full mt-3" 
                          variant="outline"
                          onClick={() => setSelectedPet(pet)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      </div>

      {/* Pet Details Modal */}
      {selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Pet Details</h2>
                <button
                  onClick={() => setSelectedPet(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedPet.images && selectedPet.images.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPet.images.map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`Pet photo ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Animal Type</label>
                    <p className="text-gray-900 capitalize">{selectedPet.animalType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Breed</label>
                    <p className="text-gray-900">{selectedPet.breed}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Color</label>
                    <p className="text-gray-900">{selectedPet.color}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Size</label>
                    <p className="text-gray-900">{selectedPet.size}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Age</label>
                    <p className="text-gray-900">{selectedPet.age}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-gray-900">{selectedPet.gender}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Found Location</label>
                  <p className="text-gray-900">{selectedPet.foundLocation}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Found Date</label>
                  <p className="text-gray-900">{new Date(selectedPet.foundDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Contact Info</label>
                  <p className="text-gray-900">{selectedPet.contactInfo}</p>
                </div>

                {selectedPet.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{selectedPet.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Reported by</label>
                  <p className="text-gray-900">{selectedPet.submittedBy?.name}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setSelectedPet(null);
                    setShowClaimModal(true);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Claim This Pet
                </Button>
                <Button
                  onClick={() => setSelectedPet(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Claim This Pet</h2>
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <Input
                    value={claimData.ownerName}
                    onChange={(e) => setClaimData(prev => ({ ...prev, ownerName: e.target.value }))}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <Input
                    value={claimData.ownerContact}
                    onChange={(e) => setClaimData(prev => ({ ...prev, ownerContact: e.target.value }))}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={claimData.ownerEmail}
                    onChange={(e) => setClaimData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proof of Ownership *
                  </label>
                  <Textarea
                    value={claimData.proofOfOwnership}
                    onChange={(e) => setClaimData(prev => ({ ...prev, proofOfOwnership: e.target.value }))}
                    required
                    placeholder="Describe how you can prove this is your pet (e.g., photos, vet records, microchip info)"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information
                  </label>
                  <Textarea
                    value={claimData.additionalInfo}
                    onChange={(e) => setClaimData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    placeholder="Any additional information that might help verify ownership"
                    rows={2}
                  />
                </div>

                {error && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setShowClaimModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Claim'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </HydrationBoundary>
  );
}
