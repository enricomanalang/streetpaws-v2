# 🗺️ Geolocation Setup Guide

## Problem
The "Use My Location" feature doesn't work on localhost because browsers require HTTPS for geolocation API access.

## ✅ Solutions

### **Option 1: Enable HTTPS for Localhost (Recommended)**

1. **Generate SSL certificates:**
   ```bash
   npm run setup:https
   ```

2. **Run with HTTPS:**
   ```bash
   npm run dev:https
   ```

3. **Access your app:**
   - Go to `https://localhost:3000` (note the `https://`)
   - Accept the self-signed certificate warning
   - "Use My Location" should now work!

### **Option 2: Use Alternative Methods**

If you prefer not to use HTTPS, you can still use:
- ✅ **Address Search** - Type any address
- ✅ **Map Clicking** - Click anywhere on the map
- ❌ **Current Location** - Won't work without HTTPS

### **Option 3: Deploy to Production**

Once deployed with HTTPS (Vercel, Netlify, etc.), geolocation will work perfectly.

## 🔧 How It Works

The setup creates:
- Self-signed SSL certificates for localhost
- HTTPS development server
- Proper geolocation API access

## 🚨 Browser Warnings

You'll see a "Not Secure" warning for the self-signed certificate. This is normal for development - just click "Advanced" → "Proceed to localhost".

## 🎯 Result

After setup, the LocationPicker will show:
- ✅ Green indicator when HTTPS is enabled
- 🚀 Clear instructions for enabling HTTPS
- 💡 Helpful error messages with solutions

---

**Need help?** The LocationPicker component now provides real-time guidance based on your current setup!

