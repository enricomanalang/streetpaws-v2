import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;



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
    // Always use compressed base64 for reliable image display
    return await compressAndConvertToBase64(file);
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Compress image and convert to base64
const compressAndConvertToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log('Starting image compression for:', file.name, file.size);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        console.log('Image loaded, original dimensions:', img.width, 'x', img.height);
        
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
        
        console.log('Compressed dimensions:', width, 'x', height);
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
          
          console.log('Compression complete:', {
            original: file.size,
            compressed: compressedDataUrl.length,
            ratio: (compressedDataUrl.length / file.size * 100).toFixed(1) + '%',
            startsWithData: compressedDataUrl.startsWith('data:')
          });
          
          resolve(compressedDataUrl);
        } else {
          reject(new Error('Canvas context not available'));
        }
      } catch (error) {
        console.error('Error compressing image:', error);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      console.error('Failed to load image for compression:', error);
      reject(new Error('Failed to load image for compression'));
    };
    
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
