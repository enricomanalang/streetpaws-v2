# 🔥 Firebase Social Authentication Setup

## Step 1: Enable Google Authentication

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Select your StreetPaws project

### 2. Enable Google Sign-In
- Go to **Authentication** > **Sign-in method**
- Click on **Google** provider
- Toggle **Enable** to ON
- Add your project support email
- Click **Save**

## Step 2: Enable Facebook Authentication

### 1. Create Facebook App
- Go to: https://developers.facebook.com/
- Click **Create App**
- Choose **Consumer** app type
- App Name: **StreetPaws**
- App Contact Email: your email
- Click **Create App**

### 2. Configure Facebook Login
- In your Facebook App dashboard:
- Go to **Products** > **Facebook Login** > **Settings**
- Add Valid OAuth Redirect URIs:
  ```
  https://your-project-id.firebaseapp.com/__/auth/handler
  ```
- Save changes

### 3. Get Facebook Credentials
- Go to **Settings** > **Basic**
- Copy **App ID** and **App Secret**

### 4. Enable Facebook in Firebase
- Go back to Firebase Console
- **Authentication** > **Sign-in method**
- Click on **Facebook** provider
- Toggle **Enable** to ON
- Enter your **App ID** and **App Secret**
- Click **Save**

## Step 3: Configure Authorized Domains

### 1. Add Your Domains
- In Firebase Console: **Authentication** > **Settings**
- Under **Authorized domains**, add:
  - `localhost` (for development)
  - `your-domain.vercel.app` (for production)

## Step 4: Test the Setup

### 1. Start Your App
```bash
npm run dev
```

### 2. Test Social Login
- Go to `/login` or `/signup`
- Click "Continue with Google" or "Continue with Facebook"
- Should open OAuth popup
- After successful login, user should be redirected to dashboard

## Troubleshooting

### If Google Login Fails:
- Check that Google provider is enabled in Firebase
- Verify authorized domains include your domain
- Make sure OAuth consent screen is configured

### If Facebook Login Fails:
- Check that Facebook provider is enabled in Firebase
- Verify App ID and App Secret are correct
- Make sure redirect URIs are properly configured

## Quick Setup Checklist

- [ ] Google provider enabled in Firebase
- [ ] Facebook provider enabled in Firebase
- [ ] Facebook App created with correct redirect URI
- [ ] Authorized domains configured
- [ ] Test both Google and Facebook login

Your social authentication should work after these steps! 🎉
