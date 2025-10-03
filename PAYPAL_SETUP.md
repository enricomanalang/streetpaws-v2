# PayPal Donation Setup Guide

## 🇵🇭 **Perfect for Philippines!**

PayPal is the best payment option for Philippines because:
- ✅ **Supports Philippines** perfectly
- ✅ **Familiar to users** 
- ✅ **Easy setup** (30 minutes)
- ✅ **Supports PHP currency**
- ✅ **No country restrictions**

## 🚀 **Step-by-Step Setup**

### **Step 1: Create PayPal Business Account**
1. **Go to** [paypal.com/ph](https://paypal.com/ph)
2. **Click "Sign Up"** → **"Business Account"**
3. **Fill out** business information:
   - Business name: "StreetPaws"
   - Business type: "Non-profit organization"
   - Country: Philippines
4. **Verify** your business (may need documents)

### **Step 2: Get PayPal Client ID**
1. **Go to** [developer.paypal.com](https://developer.paypal.com)
2. **Login** with your PayPal account
3. **Click "Create App"**
4. **Select**: "Default Application"
5. **Copy the Client ID** (starts with `Ae...`)

### **Step 3: Add to Vercel Environment Variables**
1. **Go to** Vercel Dashboard → Your Project → Settings → Environment Variables
2. **Add this variable**:
   ```
   NEXT_PUBLIC_PAYPAL_CLIENT_ID = Ae_your_client_id_here
   ```

### **Step 4: Test the Donation**
1. **Visit** `/donate` page
2. **Fill out** donation form
3. **Click "Proceed to Payment"**
4. **Use PayPal test account** or real PayPal account
5. **Complete payment**

## 💰 **PayPal Fees for Philippines**

- **Domestic payments**: 3.4% + ₱15
- **International payments**: 3.9% + ₱15
- **No monthly fees**
- **No setup fees**

## 📊 **Example Fees**

| Donation Amount | PayPal Fee | Net Amount |
|----------------|------------|------------|
| ₱100 | ₱18.40 | ₱81.60 |
| ₱500 | ₱32.00 | ₱468.00 |
| ₱1,000 | ₱49.00 | ₱951.00 |
| ₱5,000 | ₱185.00 | ₱4,815.00 |

## 🔧 **How It Works**

### **User Experience:**
1. **Fill donation form** (amount, purpose, donor info)
2. **Click "Proceed to Payment"**
3. **PayPal popup** appears
4. **Login to PayPal** or use guest checkout
5. **Complete payment**
6. **Success page** with confirmation

### **Technical Flow:**
1. **Form validation** (amount, required fields)
2. **PayPal button** creates order
3. **User pays** through PayPal
4. **Webhook** receives payment confirmation
5. **Save to database** (Firebase)
6. **Send receipt** to donor

## 🎯 **Advantages over Stripe**

- ✅ **Works in Philippines** (Stripe doesn't)
- ✅ **Familiar to users** (most Filipinos have PayPal)
- ✅ **No country restrictions**
- ✅ **Easy integration** (fewer API calls)
- ✅ **Built-in fraud protection**
- ✅ **Mobile-friendly**

## 🚨 **Important Notes**

1. **Test Mode**: Use sandbox client ID for testing
2. **Live Mode**: Switch to live client ID for production
3. **Webhooks**: Optional but recommended for automatic processing
4. **Receipts**: PayPal sends automatic receipts
5. **Refunds**: Can be processed through PayPal dashboard

## 🔄 **Migration from Stripe**

The donation system has been updated to use PayPal instead of Stripe:
- ✅ **PayPal integration** ready
- ✅ **Same user interface** 
- ✅ **Same admin dashboard**
- ✅ **Same database structure**
- ❌ **Stripe code removed** (but can be restored if needed)

## 🎉 **Ready to Use!**

Once you add the PayPal Client ID to Vercel environment variables, the donation system will work immediately!

**Total setup time: ~30 minutes**
**No coding required** - just copy/paste the Client ID!

---

**Need help?** The PayPal integration is much simpler than Stripe and works perfectly in Philippines! 🚀

