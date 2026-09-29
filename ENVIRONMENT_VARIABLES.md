# 🌍 Environment Variables for Vercel Deployment

## 🔧 **Current Local Environment Variables**

```env
PORT=4000
MONGO_URI=mongodb+srv://DBUSER:dbuserpassword123@cluster0.sp1lws4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
ACCESS_TOKEN_SECRET=FDZGHJYRT123456
CLOUDINARY_CLOUD_NAME=dzeznfc99
CLOUDINARY_API_KEY=499952982913397
CLOUDINARY_API_SECRET=1N02Ht_ygu2uLp9zGIy5FRNo9PM
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 🚀 **Vercel Production Environment Variables**

You need to set these in your Vercel dashboard:

### **Backend Environment Variables:**

```env
MONGO_URI=mongodb+srv://DBUSER:dbuserpassword123@cluster0.sp1lws4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
ACCESS_TOKEN_SECRET=FDZGHJYRT123456
CLOUDINARY_CLOUD_NAME=dzeznfc99
CLOUDINARY_API_KEY=499952982913397
CLOUDINARY_API_SECRET=1N02Ht_ygu2uLp9zGIy5FRNo9PM
FRONTEND_URL=https://your-app-name.vercel.app
NODE_ENV=production

# Optional but required for real forgot-password email delivery
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### **Frontend Environment Variables:**

```env
VITE_REACT_APP_API_URL=https://your-app-name.vercel.app/api
```

## 📋 **Important Notes**

### **Variables to Change for Production:**

- ❌ **Remove**: `PORT=4000` (Vercel sets this automatically)
- ❌ **Remove**: `FRONTEND_URL=http://localhost:5173` (use Vercel domain)
- ✅ **Change**: `NODE_ENV=development` → `NODE_ENV=production`

### **Variables to Keep the Same:**

- ✅ **Keep**: `MONGO_URI` (your MongoDB connection)
- ✅ **Keep**: `ACCESS_TOKEN_SECRET` (your JWT secret)
- ✅ **Keep**: All Cloudinary credentials
- ✅ **Keep**: `SMTP_*` values if you want the forgot-password email to send automatically

### **Forgot Password Email Notes**

- The forgot-password API now creates a secure reset token and sends a link through SMTP when `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are present.
- If SMTP is not configured, the backend still responds safely in development and returns the reset link in the API response for testing.
- In production, always set `FRONTEND_URL` to the public frontend base URL, otherwise the reset link may point to the wrong origin.

### **Provider Examples**

#### Gmail example

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_gmail_app_password
EMAIL_FROM=your_email@gmail.com
```

> For Gmail, use an App Password instead of your normal account password.

#### SendGrid example

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=you@yourdomain.com
```

## 🔧 **How to Set in Vercel**

1. **Go to Vercel Dashboard** → Your Project → Settings
2. **Click "Environment Variables"**
3. **Add each variable** with "Production" environment selected
4. **Redeploy** after adding variables

## 🚨 **Security Warning**

⚠️ **Never commit `.env` files to Git!**

- Keep your local `.env` file for development
- Set production variables in Vercel dashboard only
- Consider rotating your database password since it's been exposed

---

**After setting these variables, your deployment should work exactly like the working `cursor/say-hello-860a` branch!** 🎉
