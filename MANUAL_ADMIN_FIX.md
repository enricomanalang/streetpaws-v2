# 👑 Manual Admin Account Fix for enricomartinez58@gmail.com

## 🎯 **Your Admin Account**
Email: `enricomartinez58@gmail.com`

## 🚀 **Manual Fix Steps**

### **Step 1: Firebase Console - Authentication**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Users**
4. Find `enricomartinez58@gmail.com`
5. Note down the **UID** (User ID) - you'll need this

### **Step 2: Firebase Console - Database**
1. Go to **Realtime Database**
2. Navigate to `users/{your-uid}` (replace {your-uid} with the actual UID)
3. If the user profile exists, update it to:
   ```json
   {
     "uid": "your-actual-uid",
     "email": "enricomartinez58@gmail.com",
     "role": "admin",
     "name": "Enrico Martinez"
   }
   ```
4. If the user profile doesn't exist, create it with the above data

### **Step 3: Test Admin Access**
1. **Logout** from your current account
2. **Clear browser cache and cookies**
3. **Login again** with `enricomartinez58@gmail.com`
4. **Try accessing**: `https://streetpaws-v2.vercel.app/admin/simple`

---

## 🔧 **Alternative: Use the Test Page**

If you're still having issues, try the test page first:
1. Go to: `https://streetpaws-v2.vercel.app/admin/test`
2. This will show you exactly what's wrong with your account
3. Look for the debug information displayed

---

## 📋 **What to Look For**

### **In the Test Page, you should see:**
- ✅ **User: Logged in**
- ✅ **Profile: Loaded**
- ✅ **Role: admin**
- ✅ **Name: Your Name**
- ✅ **Email: enricomartinez58@gmail.com**

### **If you see:**
- ❌ **Role: user** - Your account isn't set as admin
- ❌ **Profile: Not loaded** - Profile doesn't exist in database
- ❌ **User: Not logged in** - Authentication issue

---

## 🆘 **If Still Having Issues**

### **Option 1: Create New Admin Account**
If the manual fix doesn't work, create a new admin account:
1. Go to signup page
2. Register with a different email
3. Use the make-admin script (once you have service account key)

### **Option 2: Use Social Login**
1. **Logout** from current account
2. **Use Google or Facebook login** with `enricomartinez58@gmail.com`
3. **Then manually set the role to admin** in Firebase Console

### **Option 3: Get Service Account Key**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Save as `serviceAccountKey.json` in your project root
4. Then use the scripts:
   ```bash
   node scripts/make-user-admin.js enricomartinez58@gmail.com
   ```

---

## 🎯 **Quick Test**

After making the changes:
1. **Try the simple admin page**: `/admin/simple`
2. **If that works**, the main admin page should work too
3. **If that doesn't work**, check the test page for debug info

---

## 💡 **Pro Tips**

- **Always check the test page first** to see what's wrong
- **Clear browser cache** when testing fixes
- **Use incognito mode** for clean testing
- **The simple admin page** is the easiest to test

Your admin account should work after these steps! 🚀
