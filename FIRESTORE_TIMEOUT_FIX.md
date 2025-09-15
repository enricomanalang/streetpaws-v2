# Fix Firestore Save Timeout Error

## The Problem
You're getting this error:
```
Firestore save timeout
Error details: {}
```

This happens when Firestore takes too long to save data (more than 10 seconds).

## ✅ What I've Fixed

### 1. **Improved Error Handling**
- **Increased timeout** from 10 to 15 seconds
- **Added fallback mechanism** to Firebase Realtime Database
- **Better error logging** with detailed information

### 2. **Fallback System**
- **Primary**: Try Firestore first
- **Fallback**: If Firestore fails, save to Realtime Database
- **Consistent**: Both methods save the same data

### 3. **Enhanced Testing**
- **Test button** now tests both Database and Firestore
- **Better diagnostics** to identify connection issues

## 🚀 How to Test the Fix

### 1. **Test Firebase Connection**
1. **Go to** `/report` page
2. **Click "🔧 Test Firebase Connection"**
3. **Check console** for success messages
4. **Should show**: "Both Database and Firestore are working"

### 2. **Submit a Report**
1. **Fill out the form** with required fields
2. **Click "Report Abuse"**
3. **Check console** for progress messages
4. **Should work** even if Firestore is slow

## 🔧 Troubleshooting

### **If Test Button Fails:**

#### **Check Environment Variables**
Make sure these are set in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### **Check Firebase Console**
1. **Go to** [Firebase Console](https://console.firebase.google.com)
2. **Select your project**
3. **Check Firestore Database** is enabled
4. **Check Realtime Database** is enabled

### **If Still Getting Timeouts:**

#### **Check Network Connection**
- **Slow internet** can cause timeouts
- **Firewall** might be blocking Firebase
- **VPN** might interfere with connection

#### **Check Firebase Rules**
Make sure Firestore rules allow writes:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎯 Expected Results

After the fix:
- ✅ **Reports save successfully** (either to Firestore or Database)
- ✅ **No more timeout errors**
- ✅ **Fallback system works** if Firestore is slow
- ✅ **Better error messages** in console

## 📝 Technical Details

### **How the Fix Works:**

1. **Try Firestore** with 15-second timeout
2. **If Firestore fails**, try Realtime Database
3. **Both methods** save the same data structure
4. **User gets success** regardless of which method works

### **Data Structure:**
Both Firestore and Database save:
```javascript
{
  animalType: "dog",
  breed: "Aspin",
  color: "Brown",
  size: "medium",
  condition: "neglect",
  location: "Barangay 1, Lipa City",
  description: "Animal is malnourished...",
  urgency: "high",
  contactInfo: "+63 912 345 6789",
  additionalNotes: "Additional info...",
  images: [],
  submittedBy: {
    uid: "user123",
    name: "John Doe",
    email: "john@example.com",
    role: "user"
  },
  status: "pending",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  reportId: "RPT-1705312200000"
}
```

## 🎉 Success!

Your app should now handle Firestore timeouts gracefully! The fallback system ensures reports are always saved, even if Firestore is having issues.

**Try submitting a report now - it should work!** 🚀
