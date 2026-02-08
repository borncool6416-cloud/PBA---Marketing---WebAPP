import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { sign, verify } from 'hono/jwt'

type Bindings = {
  DB: D1Database
  MEDIA_BUCKET: R2Bucket
  JWT_SECRET: string
  FACEBOOK_APP_ID: string
  FACEBOOK_APP_SECRET: string
  OPENAI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// JWT Authentication Middleware
const authMiddleware = async (c: any, next: any) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const payload = await verify(token, c.env.JWT_SECRET || 'your-secret-key')
    c.set('userId', payload.userId)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, fullName } = await c.req.json()
    
    // Simple password hashing (in production, use bcrypt)
    const passwordHash = btoa(password)
    
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, password_hash, full_name)
      VALUES (?, ?, ?)
    `).bind(email, passwordHash, fullName).run()
    
    const token = await sign({ userId: result.meta.last_row_id }, c.env.JWT_SECRET || 'your-secret-key')
    
    return c.json({ 
      success: true, 
      token,
      user: { id: result.meta.last_row_id, email, fullName }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Login
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(email).first()
    
    if (!user || user.password_hash !== btoa(password)) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    const token = await sign({ userId: user.id }, c.env.JWT_SECRET || 'your-secret-key')
    
    // Update last login
    await c.env.DB.prepare(`
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(user.id).run()
    
    return c.json({ 
      success: true, 
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        subscriptionTier: user.subscription_tier
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Get current user
app.get('/api/auth/me', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  const user = await c.env.DB.prepare(`
    SELECT id, email, full_name, avatar_url, subscription_tier, created_at
    FROM users WHERE id = ?
  `).bind(userId).first()
  
  return c.json({ user })
})

// ==================== SOCIAL ACCOUNTS ROUTES ====================

// Connect social account (OAuth)
app.post('/api/social-accounts/connect', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const { platform, accountName, accountId, accessToken, refreshToken, tokenExpiresAt, profilePictureUrl, followerCount } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO social_accounts 
      (user_id, platform, account_name, account_id, access_token, refresh_token, token_expires_at, profile_picture_url, follower_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId, 
      platform, 
      accountName, 
      accountId, 
      accessToken, 
      refreshToken || null, 
      tokenExpiresAt || null,
      profilePictureUrl || null,
      followerCount || 0
    ).run()
    
    return c.json({ 
      success: true, 
      accountId: result.meta.last_row_id 
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Get connected accounts
app.get('/api/social-accounts', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  const accounts = await c.env.DB.prepare(`
    SELECT id, platform, account_name, profile_picture_url, follower_count, is_active, connected_at, last_synced
    FROM social_accounts 
    WHERE user_id = ? AND is_active = 1
    ORDER BY connected_at DESC
  `).bind(userId).all()
  
  return c.json({ accounts: accounts.results })
})

// Disconnect account
app.delete('/api/social-accounts/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const accountId = c.req.param('id')
  
  await c.env.DB.prepare(`
    UPDATE social_accounts SET is_active = 0 WHERE id = ? AND user_id = ?
  `).bind(accountId, userId).run()
  
  return c.json({ success: true })
})

// Facebook OAuth callback
app.get('/api/auth/facebook/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state') // Contains userId
  
  if (!code || !state) {
    return c.json({ error: 'Missing code or state' }, 400)
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?` + 
      `client_id=${c.env.FACEBOOK_APP_ID}&` +
      `client_secret=${c.env.FACEBOOK_APP_SECRET}&` +
      `code=${code}&` +
      `redirect_uri=${encodeURIComponent('https://your-domain.pages.dev/api/auth/facebook/callback')}`)
    
    const tokenData: any = await tokenResponse.json()
    
    if (tokenData.error) {
      return c.json({ error: tokenData.error.message }, 400)
    }
    
    // Get user profile
    const profileResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,picture&access_token=${tokenData.access_token}`
    )
    const profile: any = await profileResponse.json()
    
    // Get page accounts
    const pagesResponse = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${tokenData.access_token}`
    )
    const pagesData: any = await pagesResponse.json()
    
    // Store in database
    const userId = parseInt(state)
    
    if (pagesData.data && pagesData.data.length > 0) {
      // Store first page account
      const page = pagesData.data[0]
      await c.env.DB.prepare(`
        INSERT INTO social_accounts 
        (user_id, platform, account_name, account_id, access_token, profile_picture_url, follower_count)
        VALUES (?, 'facebook', ?, ?, ?, ?, 0)
      `).bind(
        userId,
        page.name,
        page.id,
        page.access_token,
        profile.picture?.data?.url || null
      ).run()
    }
    
    return c.html(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'facebook-auth-success' }, '*');
            window.close();
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
    `)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ==================== POSTS ROUTES ====================

// Create post
app.post('/api/posts', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const { content, mediaUrls, platforms, scheduledTime } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO posts (user_id, content, media_urls, platforms, status, scheduled_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      content,
      JSON.stringify(mediaUrls || []),
      JSON.stringify(platforms),
      scheduledTime ? 'scheduled' : 'draft',
      scheduledTime || null
    ).run()
    
    return c.json({ 
      success: true, 
      postId: result.meta.last_row_id 
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Get posts
app.get('/api/posts', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const status = c.req.query('status')
  
  let query = `
    SELECT * FROM posts 
    WHERE user_id = ?
  `
  const params: any[] = [userId]
  
  if (status) {
    query += ` AND status = ?`
    params.push(status)
  }
  
  query += ` ORDER BY created_at DESC LIMIT 50`
  
  const posts = await c.env.DB.prepare(query).bind(...params).all()
  
  // Parse JSON fields
  const postsWithParsedData = posts.results.map((post: any) => ({
    ...post,
    mediaUrls: JSON.parse(post.media_urls || '[]'),
    platforms: JSON.parse(post.platforms || '[]')
  }))
  
  return c.json({ posts: postsWithParsedData })
})

// Update post
app.put('/api/posts/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const postId = c.req.param('id')
    const { content, mediaUrls, platforms, scheduledTime, status } = await c.req.json()
    
    await c.env.DB.prepare(`
      UPDATE posts 
      SET content = ?, media_urls = ?, platforms = ?, scheduled_time = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(
      content,
      JSON.stringify(mediaUrls || []),
      JSON.stringify(platforms),
      scheduledTime || null,
      status,
      postId,
      userId
    ).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Delete post
app.delete('/api/posts/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const postId = c.req.param('id')
  
  await c.env.DB.prepare(`
    DELETE FROM posts WHERE id = ? AND user_id = ?
  `).bind(postId, userId).run()
  
  return c.json({ success: true })
})

// Publish post now
app.post('/api/posts/:id/publish', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const postId = c.req.param('id')
    
    // Get post details
    const post: any = await c.env.DB.prepare(`
      SELECT * FROM posts WHERE id = ? AND user_id = ?
    `).bind(postId, userId).first()
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }
    
    const platforms = JSON.parse(post.platforms)
    const publishResults = []
    
    // Get social accounts
    const accounts = await c.env.DB.prepare(`
      SELECT * FROM social_accounts WHERE user_id = ? AND id IN (${platforms.join(',')})
    `).bind(userId).all()
    
    // Publish to each platform
    for (const account of accounts.results as any[]) {
      if (account.platform === 'facebook') {
        try {
          const response = await fetch(
            `https://graph.facebook.com/${account.account_id}/feed`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: post.content,
                access_token: account.access_token
              })
            }
          )
          
          const data: any = await response.json()
          
          if (data.id) {
            publishResults.push({ platform: 'facebook', success: true, postId: data.id })
            
            // Store analytics record
            await c.env.DB.prepare(`
              INSERT INTO post_analytics (post_id, social_account_id, platform_post_id)
              VALUES (?, ?, ?)
            `).bind(postId, account.id, data.id).run()
          } else {
            publishResults.push({ platform: 'facebook', success: false, error: data.error?.message })
          }
        } catch (error: any) {
          publishResults.push({ platform: 'facebook', success: false, error: error.message })
        }
      }
      // Add other platforms (Instagram, Twitter, etc.) here
    }
    
    // Update post status
    await c.env.DB.prepare(`
      UPDATE posts 
      SET status = 'published', published_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(postId).run()
    
    return c.json({ success: true, results: publishResults })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ==================== ANALYTICS ROUTES ====================

// Get dashboard analytics
app.get('/api/analytics/dashboard', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  // Total posts
  const totalPosts = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM posts WHERE user_id = ?
  `).bind(userId).first()
  
  // Published posts
  const publishedPosts = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = 'published'
  `).bind(userId).first()
  
  // Total engagement
  const totalEngagement = await c.env.DB.prepare(`
    SELECT SUM(likes + comments + shares) as total
    FROM post_analytics pa
    JOIN posts p ON pa.post_id = p.id
    WHERE p.user_id = ?
  `).bind(userId).first()
  
  // Connected accounts
  const connectedAccounts = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM social_accounts WHERE user_id = ? AND is_active = 1
  `).bind(userId).first()
  
  // Recent posts performance
  const recentPosts = await c.env.DB.prepare(`
    SELECT p.*, 
           SUM(pa.likes) as total_likes,
           SUM(pa.comments) as total_comments,
           SUM(pa.shares) as total_shares,
           SUM(pa.impressions) as total_impressions
    FROM posts p
    LEFT JOIN post_analytics pa ON p.id = pa.post_id
    WHERE p.user_id = ? AND p.status = 'published'
    GROUP BY p.id
    ORDER BY p.published_time DESC
    LIMIT 10
  `).bind(userId).all()
  
  return c.json({
    totalPosts: (totalPosts as any)?.count || 0,
    publishedPosts: (publishedPosts as any)?.count || 0,
    totalEngagement: (totalEngagement as any)?.total || 0,
    connectedAccounts: (connectedAccounts as any)?.count || 0,
    recentPosts: recentPosts.results
  })
})

// Get post analytics by ID
app.get('/api/analytics/posts/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const postId = c.req.param('id')
  
  const analytics = await c.env.DB.prepare(`
    SELECT pa.*, sa.platform, sa.account_name
    FROM post_analytics pa
    JOIN social_accounts sa ON pa.social_account_id = sa.id
    JOIN posts p ON pa.post_id = p.id
    WHERE p.id = ? AND p.user_id = ?
  `).bind(postId, userId).all()
  
  return c.json({ analytics: analytics.results })
})

// Sync analytics from platforms
app.post('/api/analytics/sync', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    
    // Get all published posts
    const posts = await c.env.DB.prepare(`
      SELECT p.*, pa.platform_post_id, pa.social_account_id, sa.access_token, sa.platform
      FROM posts p
      JOIN post_analytics pa ON p.id = pa.post_id
      JOIN social_accounts sa ON pa.social_account_id = sa.id
      WHERE p.user_id = ? AND p.status = 'published'
    `).bind(userId).all()
    
    const syncResults = []
    
    for (const post of posts.results as any[]) {
      if (post.platform === 'facebook' && post.platform_post_id) {
        try {
          // Fetch Facebook insights
          const response = await fetch(
            `https://graph.facebook.com/${post.platform_post_id}?fields=likes.summary(true),comments.summary(true),shares&access_token=${post.access_token}`
          )
          const data: any = await response.json()
          
          // Update analytics
          await c.env.DB.prepare(`
            UPDATE post_analytics 
            SET likes = ?, comments = ?, shares = ?, synced_at = CURRENT_TIMESTAMP
            WHERE post_id = ? AND social_account_id = ?
          `).bind(
            data.likes?.summary?.total_count || 0,
            data.comments?.summary?.total_count || 0,
            data.shares?.count || 0,
            post.id,
            post.social_account_id
          ).run()
          
          syncResults.push({ postId: post.id, success: true })
        } catch (error: any) {
          syncResults.push({ postId: post.id, success: false, error: error.message })
        }
      }
    }
    
    return c.json({ success: true, results: syncResults })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ==================== MEDIA LIBRARY ROUTES ====================

// Upload media
app.post('/api/media/upload', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    const fileName = `${userId}/${Date.now()}-${file.name}`
    const buffer = await file.arrayBuffer()
    
    // Upload to R2
    await c.env.MEDIA_BUCKET.put(fileName, buffer, {
      httpMetadata: {
        contentType: file.type
      }
    })
    
    const fileUrl = `https://media.yourdomain.com/${fileName}`
    
    // Save to database
    const result = await c.env.DB.prepare(`
      INSERT INTO media_library (user_id, file_name, file_type, file_url, file_size)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      userId,
      file.name,
      file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
      fileUrl,
      file.size
    ).run()
    
    return c.json({ 
      success: true, 
      mediaId: result.meta.last_row_id,
      url: fileUrl
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Get media library
app.get('/api/media', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  const media = await c.env.DB.prepare(`
    SELECT * FROM media_library 
    WHERE user_id = ?
    ORDER BY uploaded_at DESC
  `).bind(userId).all()
  
  return c.json({ media: media.results })
})

// Delete media
app.delete('/api/media/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const mediaId = c.req.param('id')
  
  await c.env.DB.prepare(`
    DELETE FROM media_library WHERE id = ? AND user_id = ?
  `).bind(mediaId, userId).run()
  
  return c.json({ success: true })
})

// ==================== AI TOOLS ROUTES ====================

// Generate caption
app.post('/api/ai/caption', authMiddleware, async (c) => {
  try {
    const { topic, tone, platform } = await c.req.json()
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a social media expert. Generate engaging captions for ${platform} posts.`
          },
          {
            role: 'user',
            content: `Generate a ${tone} caption about: ${topic}`
          }
        ],
        max_tokens: 150
      })
    })
    
    const data: any = await response.json()
    const caption = data.choices[0].message.content
    
    // Cache the result
    const userId = c.get('userId')
    await c.env.DB.prepare(`
      INSERT INTO ai_content_cache (user_id, prompt, content_type, generated_content)
      VALUES (?, ?, 'caption', ?)
    `).bind(userId, topic, caption).run()
    
    return c.json({ caption })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Generate hashtags
app.post('/api/ai/hashtags', authMiddleware, async (c) => {
  try {
    const { topic, count } = await c.req.json()
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a social media hashtag expert. Generate relevant hashtags.'
          },
          {
            role: 'user',
            content: `Generate ${count || 10} relevant hashtags for: ${topic}. Return only hashtags separated by spaces.`
          }
        ],
        max_tokens: 100
      })
    })
    
    const data: any = await response.json()
    const hashtags = data.choices[0].message.content.split(' ').filter((h: string) => h.startsWith('#'))
    
    return c.json({ hashtags })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ==================== HASHTAG POOLS ROUTES ====================

// Create hashtag pool
app.post('/api/hashtag-pools', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const { poolName, hashtags, category } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO hashtag_pools (user_id, pool_name, hashtags, category)
      VALUES (?, ?, ?, ?)
    `).bind(
      userId,
      poolName,
      JSON.stringify(hashtags),
      category || null
    ).run()
    
    return c.json({ 
      success: true, 
      poolId: result.meta.last_row_id 
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Get hashtag pools
app.get('/api/hashtag-pools', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  const pools = await c.env.DB.prepare(`
    SELECT * FROM hashtag_pools WHERE user_id = ? ORDER BY created_at DESC
  `).bind(userId).all()
  
  const poolsWithParsedHashtags = pools.results.map((pool: any) => ({
    ...pool,
    hashtags: JSON.parse(pool.hashtags)
  }))
  
  return c.json({ pools: poolsWithParsedHashtags })
})

// ==================== INBOX ROUTES ====================

// Get inbox messages
app.get('/api/inbox', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const replied = c.req.query('replied')
  
  let query = `
    SELECT im.*, sa.platform, sa.account_name
    FROM inbox_messages im
    JOIN social_accounts sa ON im.social_account_id = sa.id
    WHERE im.user_id = ?
  `
  const params: any[] = [userId]
  
  if (replied !== undefined) {
    query += ` AND im.replied = ?`
    params.push(replied === 'true' ? 1 : 0)
  }
  
  query += ` ORDER BY im.received_at DESC LIMIT 100`
  
  const messages = await c.env.DB.prepare(query).bind(...params).all()
  
  return c.json({ messages: messages.results })
})

// Reply to message
app.post('/api/inbox/:id/reply', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const messageId = c.req.param('id')
    const { replyText } = await c.req.json()
    
    // Get message details
    const message: any = await c.env.DB.prepare(`
      SELECT im.*, sa.access_token, sa.platform, sa.account_id
      FROM inbox_messages im
      JOIN social_accounts sa ON im.social_account_id = sa.id
      WHERE im.id = ? AND im.user_id = ?
    `).bind(messageId, userId).first()
    
    if (!message) {
      return c.json({ error: 'Message not found' }, 404)
    }
    
    // Send reply based on platform
    if (message.platform === 'facebook') {
      const response = await fetch(
        `https://graph.facebook.com/${message.platform_message_id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: replyText,
            access_token: message.access_token
          })
        }
      )
      
      const data: any = await response.json()
      
      if (data.id) {
        // Update message as replied
        await c.env.DB.prepare(`
          UPDATE inbox_messages 
          SET replied = 1, reply_text = ?
          WHERE id = ?
        `).bind(replyText, messageId).run()
        
        return c.json({ success: true })
      } else {
        return c.json({ error: data.error?.message }, 400)
      }
    }
    
    return c.json({ error: 'Platform not supported' }, 400)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ==================== FRONTEND ROUTES ====================

// Main app
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sosh - Social Media Management Platform</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div id="app"></div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
