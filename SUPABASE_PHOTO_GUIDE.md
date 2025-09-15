# Supabase Photo Storage Guide 📸

## Current System vs Supabase

### **Current System (Base64):**
- **Storage**: Firebase Realtime Database
- **Format**: Base64 encoded images
- **Pros**: No external storage needed, always accessible
- **Cons**: Large database size, slower loading

### **Supabase System (Files):**
- **Storage**: Supabase Storage bucket
- **Format**: Actual image files
- **Pros**: Faster loading, smaller database, better performance
- **Cons**: Requires Supabase setup, external dependency

## 📍 **Where to Find Photos in Each System:**

### **Current System (Base64):**
1. **Go to**: `/admin` page
2. **Click**: "Abuse Reports" tab
3. **Find**: Your report
4. **Look for**: "Evidence Photos" section
5. **Click**: Any photo to view full size

### **Supabase System (Files):**
1. **Go to**: Supabase Dashboard
2. **Click**: "Storage" in sidebar
3. **Select**: "images" bucket
4. **Browse**: `reports/` folder
5. **View**: Individual image files

## 🔧 **How to Switch to Supabase:**

### **Step 1: Enable Supabase Upload**
Replace the base64 conversion with Supabase upload:

```javascript
// Instead of base64 conversion
const imagePromises = images.map(async (image) => {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(image);
  });
});

// Use Supabase upload
const imagePromises = images.map(async (image) => {
  return await uploadImage(image, 'reports');
});
```

### **Step 2: Update Admin Display**
Change from base64 to URL display:

```javascript
// Instead of base64 src
<img src={imageUrl} />

// Use Supabase URL
<img src={imageUrl} />
```

## 🎯 **Benefits of Supabase:**

- ✅ **Faster loading** (actual image files)
- ✅ **Smaller database** (URLs instead of base64)
- ✅ **Better performance** (CDN delivery)
- ✅ **Easier management** (file browser in Supabase)
- ✅ **Scalable** (unlimited storage)

## 📋 **Current Status:**

**Your photos are currently stored as base64 in Firebase Realtime Database.**

**To view them:**
1. Go to `/admin` page
2. Click "Abuse Reports" tab
3. Find your report
4. Look for "Evidence Photos" section

**Would you like me to switch the system to use Supabase Storage instead?**
