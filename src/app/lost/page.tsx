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
  Eye
} from 'lucide-react';
import { ref, get, push, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import ImageUploader from '@/components/ImageUploader';
import LocationPicker from '@/components/LocationPicker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LostPet {
  id: string;
  petName: string;
  animalType: string;
  breed: string;
  color: string;
  size: string;
  age: string;
  gender: string;
  description: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  contactInfo: string;
  images: string[];
  status: 'lost' | 'found';
  submittedBy: {
    uid: string;
    name: string;
    email: string;
  };
  createdAt: string;
  reportId: string;
}

export default function LostPetsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [lostPets, setLostPets] = useState<LostPet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedPet, setSelectedPet] = useState<LostPet | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sightingMessage, setSightingMessage] = useState('');
  const [sightingSubmitting, setSightingSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    petName: '',
    animalType: '',
    breed: '',
    color: '',
    size: '',
    age: '',
    gender: '',
    description: '',
    lastSeenLocation: '',
    latitude: '',
    longitude: '',
    lastSeenDate: '',
    contactInfo: ''
  });

  useEffect(() => {
    loadLostPets();
  }, []);

  const loadLostPets = async () => {
    try {
      const lostPetsRef = ref(database, 'lostPets');
      const snapshot = await get(lostPetsRef);
      
      if (snapshot.exists()) {
        const pets = snapshot.val();
        const petsList: LostPet[] = Object.keys(pets).map(key => ({
          id: key,
          ...pets[key]
        }));
        setLostPets(petsList.filter(pet => pet.status === 'lost'));
      }
    } catch (err) {
      console.error('Error loading lost pets:', err);
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
      lastSeenLocation: location.address,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    }));
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

      const lostPetData = {
        ...formData,
        images: imageUrls,
        contactInfo,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        status: 'lost',
        submittedBy: {
          uid: user.uid,
          name: profile.name || profile.email,
          email: profile.email
        },
        createdAt: new Date().toISOString(),
        reportId: `LOST-${Date.now()}`
      };

      const lostPetsRef = ref(database, 'lostPets');
      const newLostPetRef = push(lostPetsRef);
      await set(newLostPetRef, lostPetData);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
        setFormData({
          petName: '',
          animalType: '',
          breed: '',
          color: '',
          size: '',
          age: '',
          gender: '',
          description: '',
          lastSeenLocation: '',
          lastSeenDate: '',
          contactInfo: ''
        });
        setImageUrls([]);
        loadLostPets();
      }, 2000);

    } catch (err) {
      console.error('Error submitting lost pet report:', err);
      setError('Failed to submit lost pet report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = lostPets.filter(pet =>
    pet.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.animalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.lastSeenLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDetails = (pet: LostPet) => {
    setSelectedPet(pet);
    setDetailsOpen(true);
  };

  const submitSighting = async () => {
    if (!selectedPet) return;
    if (!sightingMessage.trim()) return;
    try {
      setSightingSubmitting(true);
      const sightingsRef = ref(database, `lostPetSightings/${selectedPet.id}`);
      const newRef = push(sightingsRef);
      await set(newRef, {
        petId: selectedPet.id,
        message: sightingMessage.trim(),
        reportedAt: new Date().toISOString(),
        reporter: user ? {
          uid: user.uid,
          name: profile?.name || profile?.email || 'User',
          email: profile?.email || null
        } : {
          uid: 'anonymous',
          name: 'Anonymous',
          email: null
        }
      });

      // Also create an owner notification entry
      if (selectedPet.submittedBy?.uid) {
        const ownerUid = selectedPet.submittedBy.uid;
        const notificationsRef = ref(database, `notifications/${ownerUid}`);
        const notifRef = push(notificationsRef);
        await set(notifRef, {
          type: 'sighting',
          petId: selectedPet.id,
          petName: selectedPet.petName,
          message: sightingMessage.trim(),
          createdAt: new Date().toISOString(),
          read: false
        });
      }
      setSightingMessage('');
      alert('Thanks! Your sighting was sent to the owner.');
    } catch (e) {
      console.error('Error submitting sighting:', e);
      alert('Failed to submit sighting. Please try again.');
    } finally {
      setSightingSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
              <p className="text-gray-600 mb-4">
                Your lost pet report has been submitted successfully.
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
                <h1 className="text-3xl font-bold text-gray-900">Lost Pets</h1>
                <p className="text-gray-600 mt-1">Help reunite lost pets with their families</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Report Lost Pet
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {showForm ? (
          // Report Lost Pet Form
          <Card>
            <CardHeader>
              <CardTitle>Report a Lost Pet</CardTitle>
              <CardDescription>Provide details about your lost pet to help others identify them</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Name *
                    </label>
                    <Input
                      value={formData.petName}
                      onChange={(e) => handleInputChange('petName', e.target.value)}
                      placeholder="Your pet's name"
                      required
                    />
                  </div>

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
                      Last Seen Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.lastSeenDate}
                      onChange={(e) => handleInputChange('lastSeenDate', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (max 5)
                  </label>
                  <ImageUploader
                    folder="lost"
                    max={5}
                    onChange={setImageUrls}
                    onUploadingChange={setUploadingImages}
                  />
                </div>

                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  placeholder="e.g., Barangay 1, Lipa City, Batangas"
                  label="Last Seen Location"
                  required={true}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your pet's appearance, behavior, and any distinctive features..."
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
                    disabled={loading || uploadingImages || !formData.petName || !formData.animalType || !formData.lastSeenLocation || !formData.lastSeenDate || !formData.contactInfo}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
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
          // Lost Pets List
          <div className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search lost pets by name, breed, color, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lost Pets Grid */}
            {filteredPets.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? 'No matching pets found' : 'No lost pets reported'}
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Try adjusting your search terms' : 'Be the first to report a lost pet'}
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
                          alt={pet.petName}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                          <Camera className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{pet.petName}</h3>
                          <Badge variant="destructive">Lost</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Type:</span> {pet.animalType}</p>
                          {pet.breed && <p><span className="font-medium">Breed:</span> {pet.breed}</p>}
                          {pet.color && <p><span className="font-medium">Color:</span> {pet.color}</p>}
                          {pet.size && <p><span className="font-medium">Size:</span> {pet.size}</p>}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {pet.lastSeenLocation}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            Last seen: {new Date(pet.lastSeenDate).toLocaleDateString()}
                          </div>
                        </div>
                        {pet.description && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {pet.description}
                          </p>
                        )}
                        <Button className="w-full mt-3" variant="outline" onClick={() => openDetails(pet)}>
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
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPet?.petName}</DialogTitle>
            <DialogDescription>
              Lost • {selectedPet?.animalType} {selectedPet?.breed ? `• ${selectedPet?.breed}` : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedPet && (
            <div className="space-y-3">
              {selectedPet.images && selectedPet.images.length > 0 && (
                <img src={selectedPet.images[0]} alt={selectedPet.petName} className="w-full h-56 object-cover rounded" />
              )}
              <div className="text-sm text-gray-700">
                <div className="flex items-center mb-1"><MapPin className="w-4 h-4 mr-1" />{selectedPet.lastSeenLocation}</div>
                <div className="flex items-center mb-2"><Calendar className="w-4 h-4 mr-1" />Last seen: {new Date(selectedPet.lastSeenDate).toLocaleString()}</div>
                {selectedPet.description && <p className="whitespace-pre-wrap">{selectedPet.description}</p>}
                <div className="mt-3 p-3 rounded border">
                  <p className="text-xs text-gray-500 mb-1">Owner contact</p>
                  <p className="font-medium">{selectedPet.submittedBy?.name || 'Owner'}</p>
                  <p className="text-sm">{selectedPet.contactInfo}</p>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Report a sighting</p>
                <Textarea
                  value={sightingMessage}
                  onChange={(e) => setSightingMessage(e.target.value)}
                  placeholder="Describe where and when you saw this pet..."
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={submitSighting} disabled={sightingSubmitting || !sightingMessage.trim()}>
                    {sightingSubmitting ? 'Sending...' : 'Send to Owner'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </HydrationBoundary>
  );
}
