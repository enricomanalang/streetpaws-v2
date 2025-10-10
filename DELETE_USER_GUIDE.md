# 🗑️ How to Properly Delete a User Account

## 🚨 **The Problem**
When you delete a user from your database, you're only removing their profile data from Firebase Realtime Database. However, **Firebase Authentication still has the user record**, which is why you get the error "An account with this email already exists" when trying to register again.

## ✅ **The Solution**
You need to delete the user from **both**:
1. Firebase Authentication (the actual user account)
2. Firebase Realtime Database (the user profile data)

---

## 🎯 **Method 1: Using Script (Recommended)**

### Step 1: Get Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Click **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Rename it to `serviceAccountKey.json`
8. Place it in your project root directory

### Step 2: Run the Delete Script
```bash
# Delete the specific user
node scripts/delete-user.js enricomanala@gmail.com
```

This script will:
- ✅ Find the user in Firebase Authentication
- ✅ Delete their profile from the database
- ✅ Delete them from Firebase Authentication
- ✅ Allow them to register again

---

## 🎯 **Method 2: Firebase Console (Manual)**

### Step 1: Delete from Firebase Authentication
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** > **Users**
4. Find the user by email: `enricomanala@gmail.com`
5. Click the **three dots** next to the user
6. Click **Delete user**
7. Confirm the deletion

### Step 2: Delete from Database (if needed)
1. Go to **Realtime Database**
2. Navigate to `users/{user-uid}`
3. Delete the user profile data

---

## 🎯 **Method 3: Quick Fix - Clear Browser Cache**

Sometimes the issue is just browser caching:

1. **Clear browser cache and cookies**
2. **Try in incognito/private mode**
3. **Try a different browser**

---

## 🔧 **Troubleshooting**

### If the script fails:
```bash
# Make sure you have the service account key
ls serviceAccountKey.json

# Check your environment variables
echo $NEXT_PUBLIC_FIREBASE_PROJECT_ID
```

### If you still get the error:
1. **Wait 5-10 minutes** - Firebase sometimes has propagation delays
2. **Try a different email** to test if the system works
3. **Check Firebase Console** to confirm the user is actually deleted

---

## 📋 **What Gets Deleted**

When you properly delete a user:
- ✅ **Firebase Authentication record** - User can't log in
- ✅ **User profile in database** - Personal data removed
- ✅ **Email becomes available** - Can register again
- ❌ **Reports and other data** - These remain (by design)

---

## 🚀 **After Deletion**

The user will be able to:
- ✅ Register again with the same email
- ✅ Create a new account
- ✅ Go through the verification process again

---

## ⚠️ **Important Notes**

- **This action cannot be undone**
- **The user will lose access to their account**
- **Their reports and data will remain in the system**
- **They'll need to verify their email again if they re-register**

---

## 🆘 **Need Help?**

If you're still having issues:
1. Check the Firebase Console to see if the user actually exists
2. Try the script with a different email to test
3. Make sure your Firebase configuration is correct
4. Check the browser console for any error messages
