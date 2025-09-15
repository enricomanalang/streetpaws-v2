# Debug Firestore Timeout Issue

## The Problem
You're getting:
```
Firestore save timeout
at eval (src/app/report/page.tsx:366:35)
```

But the fallback system should catch this and save to Realtime Database instead.

## 🔍 What's Happening

The error is being thrown from the timeout, but it should be caught by the inner try-catch block and trigger the fallback to Realtime Database.

## 🚀 Quick Fix

The issue might be that the timeout error is being thrown from the outer try-catch block. Let me create a more robust solution:

### Option 1: Increase Timeout
Change the timeout from 15 seconds to 30 seconds:

```javascript
setTimeout(() => reject(new Error('Firestore save timeout')), 30000)
```

### Option 2: Skip Firestore Entirely
If Firestore is consistently timing out, we can skip it entirely and go straight to Realtime Database:

```javascript
// Skip Firestore, go straight to Realtime Database
updateProgress('Saving to Realtime Database...');
const reportRef = ref(database, `reports/${reportData.reportId}`);
await set(reportRef, {
  ...reportData,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  savedTo: 'realtime-database'
});
```

### Option 3: Better Error Handling
Add more specific error handling for timeout errors:

```javascript
} catch (firestoreError) {
  if (firestoreError.message === 'Firestore save timeout') {
    console.log('Firestore timeout detected, using fallback...');
  }
  // ... rest of fallback code
}
```

## 🎯 Recommended Solution

Since Firestore is consistently timing out, let's skip it entirely and use Realtime Database:

1. **Remove Firestore timeout logic**
2. **Go straight to Realtime Database**
3. **Keep the same data structure**
4. **User gets success message**

This will be faster and more reliable than trying to fix the Firestore timeout issue.

## 📝 Next Steps

1. **Test the current fallback system** - check if it's actually working
2. **If not working**, implement Option 2 (skip Firestore entirely)
3. **If working**, implement Option 1 (increase timeout)

The Realtime Database is faster and more reliable for this use case anyway!
