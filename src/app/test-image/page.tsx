'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/supabase';

export default function TestImagePage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const imageUrl = await uploadImage(file, 'test');
      setResult(imageUrl);
      console.log('Upload result:', imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setResult('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Image Upload</h1>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="mb-4"
        disabled={loading}
      />
      
      {loading && <p>Uploading...</p>}
      
      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="text-sm break-all">{result}</p>
          </div>
          
          {result.startsWith('data:') || result.startsWith('http') ? (
            <div>
              <h3 className="text-md font-semibold mb-2">Image Preview:</h3>
              <img
                src={result}
                alt="Uploaded image"
                className="max-w-md max-h-64 object-contain border rounded"
                onLoad={() => console.log('Image loaded successfully')}
                onError={() => console.log('Image failed to load')}
              />
            </div>
          ) : (
            <p className="text-red-500">Invalid image URL</p>
          )}
        </div>
      )}
    </div>
  );
}
