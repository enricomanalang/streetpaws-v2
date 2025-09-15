# Fix Supabase Storage Permission Error

## The Problem
You're getting: `ERROR: 42501: must be owner of table objects`

This means you don't have permission to create policies on the `storage.objects` table.

## Solution: Use Storage Policies UI Instead

### Method 1: Storage Policies UI (Recommended)

1. **Go to Storage → Policies** in your Supabase dashboard
2. **Select the `images` bucket**
3. **Click "New Policy"**
4. **Create these policies one by one:**

#### Policy 1: Public Read Access
- **Policy Name**: `Public read access`
- **Target Roles**: `public`
- **Operation**: `SELECT`
- **Target**: `storage.objects`
- **USING expression**: `bucket_id = 'images'`

#### Policy 2: Authenticated Upload
- **Policy Name**: `Authenticated users can upload`
- **Target Roles**: `authenticated`
- **Operation**: `INSERT`
- **Target**: `storage.objects`
- **WITH CHECK expression**: `bucket_id = 'images'`

#### Policy 3: User Update
- **Policy Name**: `Users can update own files`
- **Target Roles**: `authenticated`
- **Operation**: `UPDATE`
- **Target**: `storage.objects`
- **USING expression**: `bucket_id = 'images'`

#### Policy 4: User Delete
- **Policy Name**: `Users can delete own files`
- **Target Roles**: `authenticated`
- **Operation**: `DELETE`
- **Target**: `storage.objects`
- **USING expression**: `bucket_id = 'images'`

### Method 2: Disable RLS (Quick Fix)

If the above doesn't work, you can disable RLS entirely:

1. **Go to SQL Editor**
2. **Run this single command:**
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Note**: This is less secure but will allow uploads to work immediately.

### Method 3: Check Bucket Settings

1. **Go to Storage → Buckets**
2. **Click on your `images` bucket**
3. **Make sure it's set to "Public"**
4. **Check if there are any existing policies**

## Test After Fix

1. **Refresh your browser** (`Ctrl+F5`)
2. **Go to** `/report` page
3. **Try uploading an image**
4. **Check browser console** for success messages

## Troubleshooting

### If you still get errors:
1. **Check bucket name**: Make sure it's exactly `images`
2. **Check bucket is public**: Go to Storage → Buckets
3. **Check authentication**: Make sure you're logged in
4. **Try Method 2**: Disable RLS temporarily

### Common Issues:
- **Bucket not public**: Images won't be accessible
- **Wrong bucket name**: Policy won't match
- **Authentication required**: User must be logged in

## Quick Test

After applying any fix:
1. **Go to** `http://localhost:3000/report`
2. **Upload an image**
3. **Check console** for: `"=== ALL IMAGES UPLOADED SUCCESSFULLY TO SUPABASE ==="`

The image upload should work once the RLS policies are properly configured!
