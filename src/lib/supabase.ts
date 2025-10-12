import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug environment variables
console.log('=== SUPABASE DEBUG ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey
});

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

console.log('Supabase client created:', !!supabase);

// Storage bucket name for images
export const STORAGE_BUCKET = 'images';

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });
};

// Image upload function
export const uploadImage = async (file: File, folder: string = 'general'): Promise<string> => {
  try {
    console.log('=== UPLOAD IMAGE DEBUG ===');
    console.log('Supabase client available:', !!supabase);
    console.log('File:', file.name, file.type, file.size);
    
    // If Supabase is not available, compress and return optimized base64
    if (!supabase) {
      console.warn('Supabase not configured, using compressed base64');
      return await compressAndConvertToBase64(file);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      // Fallback to compressed base64 data URL so user is not blocked
      return await compressAndConvertToBase64(file);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Upload error, falling back to compressed base64:', error);
    // Ultimate fallback
    return await compressAndConvertToBase64(file);
  }
};

// Compress image and convert to base64
const compressAndConvertToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 800px width, maintain aspect ratio)
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
      
      console.log('Compressed image:', {
        original: file.size,
        compressed: compressedDataUrl.length,
        ratio: (compressedDataUrl.length / file.size * 100).toFixed(1) + '%'
      });
      
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
};

// Upload multiple images
export const uploadImages = async (files: File[], folder: string = 'general'): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

// Delete image
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // If Supabase is not available, just log and return
    if (!supabase) {
      console.warn('Supabase not configured, skipping image deletion');
      return;
    }

    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(STORAGE_BUCKET) + 1).join('/');

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

// Get image URL (for existing images)
export const getImageUrl = (filePath: string): string => {
  // If Supabase is not available, return the file path as is
  if (!supabase) {
    console.warn('Supabase not configured, returning file path as URL');
    return filePath;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);
  
  return publicUrl;
};
