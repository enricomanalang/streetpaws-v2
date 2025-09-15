# Fix Supabase Storage RLS Policy

## The Problem
You're getting: `new row violates row-level security policy`

## Solution: Disable RLS (Quickest Fix)

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase project dashboard
2. Go to **SQL Editor**

### Step 2: Run This Command
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### Step 3: Click "Run"

## Alternative: Create Simple Policy

If you want to keep RLS enabled, run this instead:

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

## Re-enable Image Upload

After fixing the RLS issue, you can re-enable image uploads by:

1. **Go to** `src/app/report/page.tsx`
2. **Find the line**: `// Temporarily skip image upload due to Supabase RLS issues`
3. **Replace it with the original Supabase upload code**

## Troubleshooting

### If you still get errors:
1. **Check bucket name**: Make sure it's exactly `images`
2. **Check bucket is public**: Go to Storage → Buckets
3. **Check authentication**: Make sure you're logged in

### Common Issues:
- **Bucket not public**: Images won't be accessible
- **Wrong bucket name**: Policy won't match
- **Authentication required**: User must be logged in

The image upload should work once RLS is properly configured!
