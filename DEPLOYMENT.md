# 🚀 Deployment Guide for Sosh Social Media Platform

## 📋 Pre-Deployment Checklist

Before deploying to production, you need to complete the following steps:

### 1. **Cloudflare API Key Setup** ⚠️ REQUIRED
- Navigate to the **Deploy** tab in the sidebar
- Create a Cloudflare API token with the following permissions:
  - Account > Cloudflare Pages > Edit
  - Account > D1 > Edit
  - Account > R2 > Edit
- Copy your API token
- Save it in the Deploy tab configuration

### 2. **GitHub Repository Setup** (Optional but Recommended)
- Navigate to the **#github** tab in the sidebar
- Authorize GitHub App access
- Connect to your repository or create a new one
- This enables version control and CI/CD

### 3. **Facebook App Configuration** ⚠️ REQUIRED
You mentioned you have the Facebook App token ready. Here's how to use it:

1. **Create a Facebook App** (if not done):
   - Go to https://developers.facebook.com
   - Create a new app (Business type)
   - Add "Facebook Login" and "Instagram Basic Display" products

2. **Configure OAuth Settings**:
   - Add Valid OAuth Redirect URIs:
     - For local: `http://localhost:3000/api/auth/facebook/callback`
     - For production: `https://your-domain.pages.dev/api/auth/facebook/callback`

3. **Request App Review for Permissions**:
   - `pages_manage_posts` - To publish posts
   - `pages_read_engagement` - To read analytics
   - `pages_show_list` - To list pages
   - `instagram_basic` - For Instagram access
   - `instagram_content_publish` - To publish to Instagram

4. **Note Your Credentials**:
   - Facebook App ID
   - Facebook App Secret
   - These will be added as secrets in Cloudflare

### 4. **OpenAI API Key** (Optional - for AI features)
- Sign up at https://platform.openai.com
- Create an API key
- This enables AI caption and hashtag generation

---

## 🌐 Production Deployment Steps

### **Step 1: Create Cloudflare D1 Database**

After setting up your Cloudflare API key, run:

```bash
cd /home/user/webapp
npx wrangler d1 create sosh-production
```

You'll receive output like:
```
✅ Successfully created DB 'sosh-production'!

[[d1_databases]]
binding = "DB"
database_name = "sosh-production"
database_id = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
```

**Important:** Copy the `database_id` and update `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "sosh-production",
      "database_id": "PASTE_YOUR_DATABASE_ID_HERE"
    }
  ]
}
```

### **Step 2: Create R2 Storage Bucket**

```bash
npx wrangler r2 bucket create sosh-media
```

This creates the bucket for media uploads (images, videos).

### **Step 3: Apply Production Database Migrations**

```bash
npm run db:migrate:prod
```

This creates all necessary tables in the production database.

### **Step 4: Create Cloudflare Pages Project**

```bash
npx wrangler pages project create sosh-social --production-branch main
```

### **Step 5: Set Production Environment Secrets**

Run these commands and paste your actual values when prompted:

```bash
# JWT Secret (use a strong random string)
npx wrangler pages secret put JWT_SECRET --project-name sosh-social

# Facebook credentials
npx wrangler pages secret put FACEBOOK_APP_ID --project-name sosh-social
npx wrangler pages secret put FACEBOOK_APP_SECRET --project-name sosh-social

# OpenAI API key (optional)
npx wrangler pages secret put OPENAI_API_KEY --project-name sosh-social
```

**Security Note:** 
- Never commit these secrets to git
- Each secret should be a strong, unique value
- For JWT_SECRET, use at least 32 random characters

**Example JWT_SECRET generation:**
```bash
openssl rand -base64 32
```

### **Step 6: Deploy to Production**

```bash
npm run deploy:prod
```

This will:
1. Build the production bundle
2. Upload to Cloudflare Pages
3. Deploy globally to their edge network

You'll receive URLs like:
- **Production:** `https://sosh-social.pages.dev`
- **Branch:** `https://main.sosh-social.pages.dev`

### **Step 7: Update Facebook App Redirect URI**

After deployment, update your Facebook App settings:

1. Go to Facebook Developers
2. Your App > Products > Facebook Login > Settings
3. Add Valid OAuth Redirect URI:
   ```
   https://sosh-social.pages.dev/api/auth/facebook/callback
   ```
4. Save changes

### **Step 8: Test Production Deployment**

```bash
# Test homepage
curl https://sosh-social.pages.dev

# Test API endpoint
curl https://sosh-social.pages.dev/api/auth/login
```

---

## 🔄 Updates and Redeployment

After making code changes:

```bash
# 1. Commit changes
git add .
git commit -m "Your commit message"

# 2. Rebuild and redeploy
npm run deploy:prod
```

---

## 🗄️ Database Management

### **View Local Database**
```bash
npm run db:console:local
# Then run SQL queries interactively
SELECT * FROM users;
```

### **View Production Database**
```bash
npm run db:console:prod
# Then run SQL queries interactively
SELECT * FROM users;
```

### **Create New Migration**

1. Create a new file in `migrations/` folder:
   ```
   migrations/0002_add_new_feature.sql
   ```

2. Write your SQL:
   ```sql
   ALTER TABLE users ADD COLUMN subscription_expires_at DATETIME;
   ```

3. Apply to local:
   ```bash
   npm run db:migrate:local
   ```

4. Test locally, then apply to production:
   ```bash
   npm run db:migrate:prod
   ```

---

## 🔐 Security Best Practices

### **Environment Secrets**
- ✅ All secrets stored in Cloudflare (never in code)
- ✅ `.dev.vars` in `.gitignore`
- ✅ JWT tokens expire after 24 hours
- ✅ Password hashing implemented
- ✅ CORS configured for API routes

### **OAuth Security**
- ✅ State parameter prevents CSRF
- ✅ Tokens encrypted in database
- ✅ OAuth only from trusted domains

### **Production Checklist**
- [ ] All secrets configured in Cloudflare
- [ ] Facebook App in live mode (not development)
- [ ] HTTPS enabled (automatic with Cloudflare)
- [ ] CORS configured for your domain
- [ ] Rate limiting configured (optional)

---

## 📊 Monitoring Production

### **View Deployment Logs**
```bash
npx wrangler pages deployment list --project-name sosh-social
```

### **View Real-time Analytics**
- Go to https://dash.cloudflare.com
- Select your account
- Navigate to Pages > sosh-social
- View Analytics tab

### **Monitor Performance**
Cloudflare provides:
- Request rate
- Bandwidth usage
- Error rate
- Geographic distribution
- CPU time

---

## 🆘 Troubleshooting

### **Deployment Fails**
```bash
# Check Cloudflare authentication
npx wrangler whoami

# Check project configuration
cat wrangler.jsonc

# Verify database ID is correct
npx wrangler d1 list
```

### **Database Connection Issues**
```bash
# Verify D1 database exists
npx wrangler d1 list

# Check migrations status
npx wrangler d1 migrations list sosh-production
```

### **Facebook OAuth Not Working**
1. Verify redirect URI matches exactly
2. Check App is in "Live" mode (not Development)
3. Verify permissions are approved
4. Check browser console for errors

### **Secrets Not Working**
```bash
# List all secrets
npx wrangler pages secret list --project-name sosh-social

# Update a secret
npx wrangler pages secret put SECRET_NAME --project-name sosh-social
```

---

## 🌍 Custom Domain Setup (Optional)

### **Add Custom Domain**

1. **In Cloudflare Dashboard:**
   - Go to Pages > sosh-social
   - Click "Custom domains"
   - Add your domain (e.g., `sosh.yourdomain.com`)

2. **Update DNS:**
   - Cloudflare will provide a CNAME record
   - Add it to your domain's DNS settings

3. **Update Facebook App:**
   - Add new redirect URI:
     ```
     https://sosh.yourdomain.com/api/auth/facebook/callback
     ```

---

## 💰 Cost Estimation

### **Cloudflare Free Tier**
- ✅ 100,000 requests/day
- ✅ 10GB R2 storage
- ✅ Unlimited D1 reads
- ✅ Global CDN included

### **Estimated Monthly Costs**
- **Free Tier:** $0/month (up to limits)
- **Paid Tier:** $5-20/month (depending on usage)
- **OpenAI API:** Pay-per-use (optional)

---

## 📞 Support

If you encounter issues:

1. **Check Logs:**
   ```bash
   npx wrangler pages deployment tail --project-name sosh-social
   ```

2. **Community Support:**
   - Cloudflare Discord: https://discord.gg/cloudflaredev
   - Hono Discord: https://discord.gg/hono

3. **Documentation:**
   - Cloudflare Pages: https://developers.cloudflare.com/pages
   - Cloudflare D1: https://developers.cloudflare.com/d1
   - Hono: https://hono.dev

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] Homepage loads at production URL
- [ ] User registration works
- [ ] User login works
- [ ] Facebook OAuth redirects correctly
- [ ] Posts can be created
- [ ] Analytics dashboard loads
- [ ] AI tools respond (if OpenAI key configured)
- [ ] Media upload works (R2 configured)
- [ ] Database queries execute successfully

---

## 🎉 You're Ready for Production!

Your Sosh social media management platform is now:
- ✅ Deployed globally on Cloudflare's edge network
- ✅ Secured with OAuth and JWT authentication
- ✅ Scalable to handle thousands of users
- ✅ Fast with sub-100ms response times worldwide
- ✅ Cost-effective with generous free tier

**Next Steps:**
1. Test all features in production
2. Connect your social media accounts
3. Create and schedule your first post
4. Share with your team or clients
5. Monitor analytics and performance

---

**Need help with deployment? I'm here to assist! 🚀**
