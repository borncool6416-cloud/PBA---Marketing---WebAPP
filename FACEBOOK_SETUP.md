# 🔑 Environment Setup Guide - Facebook App Token Configuration

## You mentioned you have the Facebook App token ready!

Here's exactly how to configure it for production deployment:

---

## 📱 Facebook App Token Setup

### **What You Need:**
1. **Facebook App ID** - Your app's unique identifier
2. **Facebook App Secret** - Your app's secret key (keep this secure!)

### **Where to Find These:**
1. Go to https://developers.facebook.com
2. Select your app
3. Go to Settings > Basic
4. You'll see:
   - **App ID**: `123456789012345`
   - **App Secret**: Click "Show" to reveal

---

## 🚀 Quick Setup for Development (Local Testing)

### **Step 1: Update .dev.vars file**

Edit `/home/user/webapp/.dev.vars`:

```env
JWT_SECRET=your-strong-secret-key-here
FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID_HERE
FACEBOOK_APP_SECRET=YOUR_FACEBOOK_APP_SECRET_HERE
OPENAI_API_KEY=your-openai-key-if-you-have-one
```

**Example:**
```env
JWT_SECRET=mySuper$ecretKey123!@#
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

### **Step 2: Restart Development Server**

```bash
cd /home/user/webapp
pm2 restart sosh-social
```

### **Step 3: Test Facebook Login**

1. Open: https://3000-iqck1qeb4weomfthcfu9j-cc2fbc16.sandbox.novita.ai
2. Register a new account
3. Go to "Connected Accounts"
4. Click "Facebook" button
5. You should see Facebook OAuth popup

---

## 🌐 Production Setup (Cloudflare Pages)

### **Option A: Using Wrangler CLI (After Cloudflare API Key Setup)**

Once you've configured your Cloudflare API key in the Deploy tab, run:

```bash
cd /home/user/webapp

# Set JWT Secret
echo "YOUR_STRONG_SECRET_KEY" | npx wrangler pages secret put JWT_SECRET --project-name sosh-social

# Set Facebook App ID
echo "YOUR_FACEBOOK_APP_ID" | npx wrangler pages secret put FACEBOOK_APP_ID --project-name sosh-social

# Set Facebook App Secret
echo "YOUR_FACEBOOK_APP_SECRET" | npx wrangler pages secret put FACEBOOK_APP_SECRET --project-name sosh-social

# Optional: Set OpenAI Key
echo "YOUR_OPENAI_API_KEY" | npx wrangler pages secret put OPENAI_API_KEY --project-name sosh-social
```

### **Option B: Using Cloudflare Dashboard**

1. Go to https://dash.cloudflare.com
2. Navigate to Workers & Pages
3. Select your "sosh-social" project
4. Go to Settings > Environment Variables
5. Click "Add variable" for each:

   | Variable Name | Value | Type |
   |---------------|-------|------|
   | JWT_SECRET | your-secret-key | Secret |
   | FACEBOOK_APP_ID | 123456789012345 | Secret |
   | FACEBOOK_APP_SECRET | abcdef123... | Secret |
   | OPENAI_API_KEY | sk-proj-xxx... | Secret |

6. Click "Save"

---

## ✅ Verification Checklist

### **Local Development:**
```bash
# Check if .dev.vars exists
cat /home/user/webapp/.dev.vars

# Restart server
cd /home/user/webapp && pm2 restart sosh-social

# Test endpoint
curl http://localhost:3000/api/auth/facebook/callback
```

### **Production:**
```bash
# List secrets
npx wrangler pages secret list --project-name sosh-social

# Should show:
# - JWT_SECRET
# - FACEBOOK_APP_ID
# - FACEBOOK_APP_SECRET
# - OPENAI_API_KEY (if configured)
```

---

## 🔧 Facebook App Configuration

### **Important: Update OAuth Redirect URIs**

After you know your deployment URLs, update Facebook App:

1. Go to https://developers.facebook.com
2. Your App > Products > Facebook Login > Settings
3. Valid OAuth Redirect URIs, add:

```
# For local development
http://localhost:3000/api/auth/facebook/callback

# For sandbox testing
https://3000-iqck1qeb4weomfthcfu9j-cc2fbc16.sandbox.novita.ai/api/auth/facebook/callback

# For production (after deployment)
https://sosh-social.pages.dev/api/auth/facebook/callback

# If using custom domain
https://sosh.yourdomain.com/api/auth/facebook/callback
```

4. Save changes

---

## 🎯 App Permissions Required

Make sure your Facebook App has these permissions:

### **Standard Access:**
- ✅ `email` - User's email
- ✅ `public_profile` - Basic profile info

### **Advanced Access (Requires App Review):**
- ✅ `pages_show_list` - List user's pages
- ✅ `pages_manage_posts` - Post to pages
- ✅ `pages_read_engagement` - Read post metrics

### **For Instagram:**
- ✅ `instagram_basic` - Basic Instagram access
- ✅ `instagram_content_publish` - Publish to Instagram

---

## 🚨 Common Issues & Solutions

### **Issue 1: "App Not Setup" Error**
**Solution:** Your app is in Development Mode
1. Go to App Settings > Basic
2. Toggle "App Mode" to "Live"
3. Complete App Review if needed

### **Issue 2: "Redirect URI Mismatch"**
**Solution:** OAuth redirect URL doesn't match
1. Check the URL in browser address bar during OAuth
2. Add exact URL to Facebook App settings
3. Include protocol (http/https) and trailing path

### **Issue 3: "Invalid App ID or Secret"**
**Solution:** Credentials are incorrect
1. Double-check App ID and Secret in Facebook dashboard
2. Verify no extra spaces in .dev.vars
3. Restart server after changing .dev.vars

### **Issue 4: "App Not Reviewed for Permission"**
**Solution:** Some permissions require approval
1. Go to App Review > Permissions and Features
2. Request permission (e.g., `pages_manage_posts`)
3. Provide use case and demo video
4. Wait for approval (usually 3-5 business days)

---

## 🔐 Security Best Practices

### **DO:**
- ✅ Keep App Secret secure (never commit to git)
- ✅ Use `.dev.vars` for local development
- ✅ Use Cloudflare secrets for production
- ✅ Rotate secrets periodically
- ✅ Use HTTPS in production
- ✅ Enable 2FA on Facebook account

### **DON'T:**
- ❌ Commit secrets to git
- ❌ Share secrets in screenshots or logs
- ❌ Use same secret for dev and prod
- ❌ Use weak JWT secrets
- ❌ Store secrets in frontend code

---

## 📝 Quick Reference

### **File Locations:**
- Development secrets: `/home/user/webapp/.dev.vars`
- Production secrets: Cloudflare Dashboard
- OAuth callback: `/api/auth/facebook/callback`

### **Commands:**
```bash
# Edit local secrets
nano /home/user/webapp/.dev.vars

# Set production secret
npx wrangler pages secret put SECRET_NAME --project-name sosh-social

# List production secrets
npx wrangler pages secret list --project-name sosh-social

# Delete production secret
npx wrangler pages secret delete SECRET_NAME --project-name sosh-social
```

---

## ✨ Next Steps After Configuration

1. **Test Local Facebook Login:**
   - Register account
   - Try connecting Facebook
   - Verify OAuth flow completes

2. **Deploy to Production:**
   - Follow DEPLOYMENT.md
   - Set production secrets
   - Update Facebook redirect URIs
   - Test production OAuth

3. **Request Facebook Permissions:**
   - Submit app for review
   - Provide demo and use case
   - Wait for approval

4. **Start Using the Platform:**
   - Connect Facebook account
   - Create first post
   - Schedule content
   - View analytics

---

## 💡 Pro Tips

1. **Test Mode:** Use Facebook's test accounts during development
2. **Webhooks:** Set up Facebook webhooks for real-time updates
3. **Page Tokens:** Store page-specific tokens for better performance
4. **Rate Limits:** Facebook has rate limits - cache responses
5. **Error Handling:** Log OAuth errors for debugging

---

## 🆘 Need Help?

If you're stuck:

1. **Check Facebook Debug Tool:**
   - https://developers.facebook.com/tools/debug/
   - Paste your OAuth URL
   - See detailed error messages

2. **Check App Dashboard:**
   - https://developers.facebook.com/apps
   - Look for alerts or warnings

3. **Review Logs:**
   ```bash
   pm2 logs sosh-social
   ```

4. **Test API Directly:**
   ```bash
   curl "https://graph.facebook.com/me?access_token=YOUR_TOKEN"
   ```

---

**You're all set! 🎉**

Once you've added your Facebook App credentials, the OAuth integration will work seamlessly!
