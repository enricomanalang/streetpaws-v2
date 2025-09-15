# StreetPaws: Firebase Configuration Setup Guide

This guide will help you obtain your Firebase project credentials and update your `.env.local` file correctly.

---

## Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Log in with your Google account.
3. Select your existing project or create a new one.

---

## Step 2: Get Firebase Config

1. In your Firebase project, click the gear icon next to "Project Overview" and select **Project settings**.
2. Scroll down to **Your apps** section.
3. If you haven't added a web app, click **Add app** and select **Web**.
4. Register your app and click **Register app**.
5. You will see your Firebase SDK config object with keys like `apiKey`, `authDomain`, etc.

---

## Step 3: Update `.env.local`

1. Open your project root directory.
2. Create or open `.env.local`.
3. Replace the placeholder values with your actual Firebase config values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## Step 4: Restart Development Server

After saving `.env.local`, restart your Next.js development server:

```bash
npm run dev
```

---

## Additional Notes

- Ensure no extra spaces or quotes are added around the values.
- Keep `.env.local` private and do not commit it to version control.
- If you encounter errors, double-check the values and restart the server.

---

If you need further assistance, feel free to ask.
