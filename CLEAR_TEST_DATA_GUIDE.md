# 🗑️ Clear All Test Data - Complete Guide

## 🎯 **3 Ways to Clear Your Test Data**

### **Method 1: Using Script (Recommended)**
```bash
# Run this command in your project root
node scripts/clear-test-data.js
```

### **Method 2: Firebase Console (Manual)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Realtime Database**
4. Delete these collections one by one:
   - `reports`
   - `approvedReports`
   - `rejectedReports`
   - `lostPets`
   - `foundPets`
   - `adoptionRequests`
   - `adoptions`

### **Method 3: Admin Panel Button (Coming Soon)**
I'll add a "Clear All Data" button in your admin panel.

## 📋 **Collections That Will Be Cleared:**

- ✅ **reports** - All pending abuse reports
- ✅ **approvedReports** - All approved reports  
- ✅ **rejectedReports** - All rejected reports
- ✅ **lostPets** - All lost pet reports
- ✅ **foundPets** - All found pet reports
- ✅ **adoptionRequests** - All adoption requests
- ✅ **adoptions** - All completed adoptions

## ⚠️ **Important Notes:**

- **This will delete ALL data** in these collections
- **Cannot be undone** - make sure you want to clear everything
- **User accounts will remain** - only report data is cleared
- **Admin accounts will remain** - only test reports are deleted

## 🚀 **After Clearing:**

1. **Dashboard will show 0** for all status cards
2. **Charts will be empty** 
3. **All reports will be gone**
4. **Ready for fresh testing**

## 🔧 **If Script Fails:**

Make sure your `.env.local` file has the correct Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
