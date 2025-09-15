# Quick Supabase Storage Setup

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be ready (usually 2-3 minutes)

## 2. Get Your Credentials

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## 3. Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it: `images`
4. Make it **Public** (so images can be accessed via URL)
5. Click **Create bucket**

## 4. Add Environment Variables

Create or update your `.env.local` file:

```env
# Supabase Configuration (for image storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the values with your actual Supabase project URL and anon key.

## 5. Set Storage Policies (Optional but Recommended)

Go to **Storage** > **Policies** and create these policies for the `images` bucket:

### Allow Public Read Access
```sql
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
```

### Allow Authenticated Upload
```sql
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);
```

## 6. Test the Setup

1. Restart your development server: `npm run dev`
2. Go to the Report page (`/report`)
3. Try uploading an image
4. Check the browser console for upload success messages

## Benefits of Supabase Storage

- ✅ **Easy Setup**: No complex configuration needed
- ✅ **Better Performance**: Built-in CDN for fast image delivery
- ✅ **Cost Effective**: More affordable than Firebase Storage
- ✅ **Simple API**: Easy to use JavaScript SDK
- ✅ **Automatic Optimization**: Images are automatically optimized
- ✅ **No CORS Issues**: Unlike Firebase Storage

## Troubleshooting

If images don't upload:

1. **Check Environment Variables**: Make sure `.env.local` has the correct values
2. **Check Console**: Look for error messages in browser console
3. **Check Supabase Dashboard**: Verify the bucket exists and is public
4. **Restart Server**: After adding environment variables, restart `npm run dev`

## Image Storage Structure

Images will be stored in these folders:
- `images/reports/` - Abuse reports
- `images/lost/` - Lost pet reports
- `images/found/` - Found pet reports
- `images/adopt/` - Adoption applications
- `images/general/` - Other images
