'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Camera } from 'lucide-react';

// Force reload to clear any cached versions
console.log('ImageUploader loaded - version 2.0 - base64 only');

interface ImageUploaderProps {
  folder: string;
  max?: number;
  accept?: string;
  onChange: (urls: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  initialUrls?: string[];
}

export default function ImageUploader({
  folder,
  max = 5,
  accept = 'image/*',
  onChange,
  onUploadingChange,
  initialUrls = []
}: ImageUploaderProps) {
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploading = (value: boolean) => {
    setUploading(value);
    onUploadingChange?.(value);
  };

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError('');

    if (files.length === 0) return;

    if (files.length + urls.length > max) {
      setError(`Maximum ${max} images allowed`);
      return;
    }

    // Basic validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalid = files.find((f) => !validTypes.includes(f.type));
    if (invalid) {
      setError('Only JPG, PNG, WEBP, or GIF images are allowed');
      return;
    }

    try {
      handleUploading(true);
      
      console.log('=== IMAGE UPLOADER DEBUG ===');
      console.log('Processing', files.length, 'files');
      
      // Convert images to base64 - FORCE base64 conversion
      const newUrls = await Promise.all(
        files.map(async (file, index) => {
          console.log(`Processing file ${index + 1}:`, file.name, file.type, file.size);
          
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              console.log(`File ${index + 1} converted to base64:`, result.substring(0, 50) + '...');
              console.log(`Is base64:`, result.startsWith('data:image'));
              resolve(result);
            };
            reader.onerror = () => {
              console.error(`Failed to read file ${index + 1}`);
              reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
          });
        })
      );
      
      console.log('All files converted. New URLs:', newUrls.map(url => url.substring(0, 50) + '...'));
      
      const merged = [...urls, ...newUrls].slice(0, max);
      setUrls(merged);
      onChange(merged);
      
      console.log('Final merged URLs:', merged.map(url => url.substring(0, 50) + '...'));
    } catch (err: any) {
      console.error('Image processing error:', err);
      setError(err?.message || 'Failed to process images');
    } finally {
      handleUploading(false);
      // reset input value to allow re-selecting same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeUrl = useCallback(
    (index: number) => {
      const next = urls.filter((_, i) => i !== index);
      setUrls(next);
      onChange(next);
    },
    [urls, onChange]
  );

  const canAddMore = useMemo(() => urls.length < max, [urls.length, max]);

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          {uploading ? 'Uploading images...' : `Click to upload photos (${urls.length}/${max})`}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleSelect}
          className="hidden"
          disabled={uploading || !canAddMore}
        />
        <Button 
          type="button" 
          variant="outline" 
          className="cursor-pointer hover:bg-gray-50"
          disabled={uploading || !canAddMore}
          onClick={() => fileInputRef.current?.click()}
        >
          Choose Images
        </Button>
        {!canAddMore && (
          <p className="text-xs text-gray-500 mt-2">Maximum images reached</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {urls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {urls.map((url, index) => (
            <div key={index} className="relative">
              {url ? (
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeUrl(index)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


