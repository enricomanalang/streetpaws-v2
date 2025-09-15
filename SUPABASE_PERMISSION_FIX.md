# Fix Supabase Storage Permission Error

## The Problem
You're getting: `ERROR: 42501: must be owner of table objects`

This means you don't have permission to modify the `storage.objects` table directly.

## Solution: Use Storage Policies UI Instead

### Method 1: Storage Policies UI (Recommended)

1. **Go to Storage → Policies** in your Supabase dashboard
2. **Select the `images` bucket**
3. **Click "New Policy"**
4. **Create this simple policy:**

**Policy Name**: `Allow all operations on images bucket`
**Target Roles**: `public`
**Operation**: Check `ALL` (SELECT, INSERT, UPDATE, DELETE)
**Policy Definition**: `bucket_id = 'images'`

### Method 2: Check Bucket Settings

1. **Go to Storage → Buckets**
2. **Click on your `images` bucket**
3. **Make sure it's set to "Public"**
4. **If not public, make it public**

### Method 3: Use Different Role

Try running the SQL command with a different role:

1. **In SQL Editor, change the role** from `postgres` to `supabase_admin`
2. **Run the command again:**
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### Method 4: Create Policy Instead of Disabling RLS

Try creating a policy instead of disabling RLS:

```sql
-- Create a simple policy that allows all operations
CREATE POLICY "Allow all operations on images bucket" ON storage.objects
FOR ALL USING (bucket_id = 'images');
```

## Test After Fix

1. **Refresh your browser** (`Ctrl+F5`)
2. **Go to** `/report` page
3. **Try uploading an image**
4. **Check console** for success messages

## Alternative: Use Firebase Storage

If Supabase continues to have issues, we can revert to Firebase Storage:

1. **The app is already working** without images
2. **We can re-enable Firebase Storage** for image uploads
3. **Firebase Storage** doesn't have these RLS issues

## Troubleshooting

### If you still get errors:
1. **Check bucket name**: Make sure it's exactly `images`
2. **Check bucket is public**: Go to Storage → Buckets
3. **Check authentication**: Make sure you're logged in
4. **Try Method 1**: Use Storage Policies UI

### Common Issues:
- **Bucket not public**: Images won't be accessible
- **Wrong bucket name**: Policy won't match
- **Authentication required**: User must be logged in
- **Permission issues**: Need to use UI instead of SQL

## Quick Test

After applying any fix:
1. **Go to** `http://localhost:3000/report`
2. **Upload an image**
3. **Check console** for: `"=== ALL IMAGES UPLOADED SUCCESSFULLY TO SUPABASE ==="`

The image upload should work once the policies are properly configured!
