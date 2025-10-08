# 🔐 Social Authentication Setup Guide

## Google Authentication Setup

### 1. Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** > **Sign-in method**
4. Click on **Google** provider
5. Toggle **Enable**
6. Add your project support email
7. Click **Save**

### 2. Configure OAuth Consent Screen (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **OAuth consent screen**
4. Choose **External** user type
5. Fill in required information:
   - **App name**: StreetPaws
   - **User support email**: your-email@example.com
   - **Developer contact information**: your-email@example.com
6. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
7. Add test users (your email addresses)
8. Save and continue

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://your-domain.vercel.app` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://your-domain.vercel.app` (for production)
6. Copy the **Client ID** and **Client Secret**

## Facebook Authentication Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **Create App**
3. Choose **Consumer** app type
4. Fill in app details:
   - **App Name**: StreetPaws
   - **App Contact Email**: your-email@example.com
5. Click **Create App**

### 2. Configure Facebook Login

1. In your Facebook App dashboard:
2. Go to **Products** > **Facebook Login** > **Settings**
3. Add Valid OAuth Redirect URIs:
   - `https://your-project-id.firebaseapp.com/__/auth/handler`
4. Save changes

### 3. Get App ID and Secret

1. Go to **Settings** > **Basic**
2. Copy **App ID** and **App Secret**
3. Add your domain to **App Domains**

### 4. Enable Facebook Login in Firebase

1. Go to Firebase Console > **Authentication** > **Sign-in method**
2. Click on **Facebook** provider
3. Toggle **Enable**
4. Enter your **App ID** and **App Secret** from Facebook
5. Click **Save**

## Environment Variables

Add these to your `.env.local` file:

```env
# Firebase Configuration (already have these)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google OAuth (optional - Firebase handles this)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Facebook OAuth (optional - Firebase handles this)
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

## Testing Social Authentication

### 1. Test Google Login
```bash
npm run dev
```
- Go to `/login` or `/signup`
- Click "Continue with Google"
- Should open Google OAuth popup
- After successful login, user should be redirected to dashboard

### 2. Test Facebook Login
```bash
npm run dev
```
- Go to `/login` or `/signup`
- Click "Continue with Facebook"
- Should open Facebook OAuth popup
- After successful login, user should be redirected to dashboard

## Troubleshooting

### Common Issues:

1. **"Popup blocked" error**
   - Allow popups for your domain
   - Check browser popup settings

2. **"Invalid OAuth client" error**
   - Verify authorized origins in Google Cloud Console
   - Check that your domain is added correctly

3. **"App not verified" warning**
   - This is normal for development
   - Users can still proceed by clicking "Advanced" > "Go to app"

4. **Facebook login not working**
   - Check that Facebook Login is enabled in your app
   - Verify redirect URIs are correct
   - Make sure your app is not in development mode restrictions

## Production Deployment

### For Vercel Deployment:

1. Update authorized origins in Google Cloud Console:
   - Add your Vercel domain: `https://your-app.vercel.app`

2. Update Facebook App settings:
   - Add your domain to App Domains
   - Update OAuth redirect URIs

3. Update Firebase authorized domains:
   - Go to Firebase Console > Authentication > Settings
   - Add your production domain to authorized domains

## Security Notes

- Never expose your OAuth client secrets in frontend code
- Use environment variables for sensitive data
- Regularly rotate your OAuth credentials
- Monitor authentication logs for suspicious activity

Your social authentication is now ready! 🎉
