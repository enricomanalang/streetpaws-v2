# Emergency Fix for Supabase Storage RLS Error

## The Problem
You're still getting: `new row violates row-level security policy`

This means the Supabase Storage policies weren't created successfully or there's a configuration issue.

## Quick Fix: Disable RLS Temporarily

### Method 1: SQL Editor (Fastest)
1. **Go to SQL Editor** in your Supabase dashboard
2. **Run this single command:**
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```
3. **Click "Run"**

### Method 2: Check Bucket Settings
1. **Go to Storage → Buckets**
2. **Click on your `images` bucket**
3. **Make sure it's set to "Public"**
4. **If not public, make it public**

### Method 3: Create Simple Policy
If you want to keep RLS enabled, try this simpler approach:

1. **Go to SQL Editor**
2. **Run this:**
```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Simple policy: allow all operations on images bucket
CREATE POLICY "Allow all operations on images bucket" ON storage.objects
FOR ALL USING (bucket_id = 'images');
```

## Test After Fix

1. **Refresh your browser** (`Ctrl+F5`)
2. **Go to** `/report` page
3. **Try uploading an image**
4. **Check console** for success messages

## Alternative: Use Firebase Storage Temporarily

If Supabase continues to have issues, we can temporarily revert to Firebase Storage:

1. **Comment out Supabase upload** in the report page
2. **Uncomment Firebase upload** code
3. **Use Firebase Storage** until Supabase is fixed

## Troubleshooting

### If you still get errors:
1. **Check bucket name**: Make sure it's exactly `images`
2. **Check bucket is public**: Go to Storage → Buckets
3. **Check authentication**: Make sure you're logged in
4. **Try Method 1**: Disable RLS entirely

### Common Issues:
- **Bucket not public**: Images won't be accessible
- **Wrong bucket name**: Policy won't match
- **Authentication required**: User must be logged in
- **RLS still enabled**: Need to disable or create proper policies

## Quick Test

After applying any fix:
1. **Go to** `http://localhost:3000/report`
2. **Upload an image**
3. **Check console** for: `"=== ALL IMAGES UPLOADED SUCCESSFULLY TO SUPABASE ==="`

The image upload should work once RLS is properly configured!
