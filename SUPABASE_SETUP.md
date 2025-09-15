# Supabase Storage Setup for Images

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Supabase Configuration (for image storage)
NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Project Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key from Settings > API

2. **Create Storage Bucket**
   - Go to Storage in your Supabase dashboard
   - Create a new bucket named `images`
   - Set it to public (so images can be accessed via URL)

3. **Set Storage Policies**
   - Go to Storage > Policies
   - Create policies for the `images` bucket:

   **Policy 1: Allow public read access**
   ```sql
   CREATE POLICY "Public read access" ON storage.objects
   FOR SELECT USING (bucket_id = 'images');
   ```

   **Policy 2: Allow authenticated users to upload**
   ```sql
   CREATE POLICY "Authenticated users can upload" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'images' AND 
     auth.role() = 'authenticated'
   );
   ```

   **Policy 3: Allow users to update their own files**
   ```sql
   CREATE POLICY "Users can update own files" ON storage.objects
   FOR UPDATE USING (
     bucket_id = 'images' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **Policy 4: Allow users to delete their own files**
   ```sql
   CREATE POLICY "Users can delete own files" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'images' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

## Usage

The Supabase storage is now integrated into the application. Images will be uploaded to:
- `images/reports/` - For abuse reports
- `images/lost/` - For lost pet reports  
- `images/found/` - For found pet reports
- `images/adopt/` - For adoption applications
- `images/general/` - For other images

## Benefits of Supabase Storage

- ✅ Easy setup and configuration
- ✅ Built-in CDN for fast image delivery
- ✅ Automatic image optimization
- ✅ Better pricing than Firebase Storage
- ✅ Simple API for upload/download
- ✅ Built-in access control policies
