'use client';

import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, Heart, AlertCircle, Info, Megaphone, Image, X, Upload } from 'lucide-react';
import useModernModal from '@/components/ui/modern-modal';

interface NewsfeedPost {
  id?: string;
  title: string;
  content: string;
  type: 'event' | 'update' | 'announcement' | 'success_story';
  eventDate?: string;
  eventLocation?: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  isPinned?: boolean;
  imageUrls?: string[];
}

const NewsfeedPostForm: React.FC = () => {
  const { user, profile } = useAuth();
  const { success, error } = useModernModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'update' as const,
    eventDate: '',
    eventLocation: '',
    isPinned: false
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const postTypes = [
    { value: 'event', label: 'Event', icon: Calendar, color: 'text-blue-600' },
    { value: 'update', label: 'Update', icon: Info, color: 'text-green-600' },
    { value: 'announcement', label: 'Announcement', icon: Megaphone, color: 'text-orange-600' },
    { value: 'success_story', label: 'Success Story', icon: Heart, color: 'text-pink-600' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      await error('You must be logged in to post updates.', 'Authentication Required');
      return;
    }

    if (!firestore) {
      await error('Database connection error. Please refresh the page.', 'Connection Error');
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      await error('Please fill in both title and content.', 'Missing Information');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls = await uploadImages();

      const postData: Omit<NewsfeedPost, 'id'> = {
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        authorId: user.uid,
        authorName: profile.name || 'Admin',
        createdAt: serverTimestamp(),
        isPinned: form.isPinned,
        imageUrls: imageUrls
      };

      // Add event-specific fields if it's an event
      if (form.type === 'event') {
        if (!form.eventDate) {
          await error('Please provide an event date.', 'Missing Event Date');
          setIsSubmitting(false);
          return;
        }
        postData.eventDate = form.eventDate;
        postData.eventLocation = form.eventLocation?.trim() || '';
      }

      const postsRef = collection(firestore, 'newsfeed');
      await addDoc(postsRef, postData);

      await success('Post published successfully!', 'Success');
      
      // Reset form
      setForm({
        title: '',
        content: '',
        type: 'update',
        eventDate: '',
        eventLocation: '',
        isPinned: false
      });
      setSelectedImages([]);
      setImagePreviewUrls([]);

    } catch (err) {
      console.error('Error creating post:', err);
      await error('Failed to publish post. Please try again.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const newFiles = [...selectedImages, ...files].slice(0, 5);
    setSelectedImages(newFiles);

    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(newPreviewUrls);
  };

  const removeImage = (index: number) => {
    const newFiles = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    setSelectedImages(newFiles);
    setImagePreviewUrls(newPreviewUrls);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    setUploadingImages(true);
    const uploadPromises = selectedImages.map(async (file) => {
      const fileName = `newsfeed/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    });

    try {
      const urls = await Promise.all(uploadPromises);
      setUploadingImages(false);
      return urls;
    } catch (err) {
      setUploadingImages(false);
      throw err;
    }
  };

  const selectedType = postTypes.find(type => type.value === form.type);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-6 h-6" />
          Create Newsfeed Post
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Post Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {postTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('type', type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      form.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${type.color}`} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title *
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter post title..."
              className="w-full"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-gray-700">
              Content *
            </Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your post content..."
              rows={6}
              className="w-full resize-none"
              required
            />
          </div>

          {/* Event-specific fields */}
          {form.type === 'event' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Event Details</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate" className="text-sm font-medium text-gray-700">
                    Event Date *
                  </Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={form.eventDate}
                    onChange={(e) => handleInputChange('eventDate', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventLocation" className="text-sm font-medium text-gray-700">
                    Location
                  </Label>
                  <Input
                    id="eventLocation"
                    value={form.eventLocation}
                    onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                    placeholder="Event location..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              Add Photos (Optional)
            </Label>
            
            {/* Image Upload Button */}
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Choose Photos</span>
                </div>
              </label>
              <span className="text-xs text-gray-500">Max 5 photos</span>
            </div>

            {/* Image Previews */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pin Post Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={form.isPinned}
              onChange={(e) => handleInputChange('isPinned', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor="isPinned" className="text-sm text-gray-700">
              Pin this post to the top
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm({
                title: '',
                content: '',
                type: 'update',
                eventDate: '',
                eventLocation: '',
                isPinned: false
              })}
              disabled={isSubmitting}
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploadingImages}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {uploadingImages ? 'Uploading Images...' : isSubmitting ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsfeedPostForm;
