# Fix Supabase Storage RLS Policy Error

## The Problem
You're getting this error: `new row violates row-level security policy`

This happens because Supabase Storage has Row Level Security (RLS) enabled by default, but no policies are set up to allow file uploads.

## Solution: Create Storage Policies

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to **Storage** → **Policies**
3. Select the `images` bucket

### Step 2: Create These Policies

#### Policy 1: Allow Public Read Access
```sql
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
```

#### Policy 2: Allow Authenticated Users to Upload
```sql
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);
```

#### Policy 3: Allow Users to Update Their Own Files
```sql
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Allow Users to Delete Their Own Files
```sql
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 3: Alternative - Disable RLS (Not Recommended)
If you want to disable RLS entirely (less secure):

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

## Quick Fix: Use SQL Editor

### Method 1: SQL Editor
1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Paste this code:

```sql
-- Enable RLS (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

4. Click **Run** to execute the policies

### Method 2: Storage Policies UI
1. Go to **Storage** → **Policies**
2. Click **New Policy**
3. For each policy:
   - **Policy Name**: Give it a descriptive name
   - **Target Roles**: `authenticated` (for upload) or `public` (for read)
   - **Operation**: Select INSERT, SELECT, UPDATE, or DELETE
   - **Target**: `storage.objects`
   - **USING expression**: Add the condition (e.g., `bucket_id = 'images'`)

## Test the Fix

After creating the policies:

1. **Refresh your browser** (`Ctrl+F5`)
2. **Go to** `/report` page
3. **Try uploading an image**
4. **Check browser console** - the RLS error should be gone!

## Troubleshooting

### If you still get errors:
1. **Check bucket name**: Make sure it's exactly `images`
2. **Check authentication**: Make sure you're logged in
3. **Check policies**: Verify policies were created successfully
4. **Check console**: Look for specific error messages

### Common Issues:
- **Bucket name mismatch**: Policy uses `'images'` but bucket is named differently
- **Authentication required**: User must be logged in for upload policies
- **Policy syntax**: Make sure SQL syntax is correct

## Security Notes

- **Public read access**: Anyone can view images (good for public pet reports)
- **Authenticated upload**: Only logged-in users can upload (prevents spam)
- **User-specific operations**: Users can only modify their own files

This setup provides a good balance of security and functionality for your pet reporting system.
