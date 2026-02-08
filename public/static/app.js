// API Configuration
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
const TOKEN_KEY = 'sosh_auth_token';
const USER_KEY = 'sosh_user';

// Axios configuration
axios.defaults.baseURL = API_BASE;
axios.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global state
let currentUser = null;
let connectedAccounts = [];
let posts = [];
let currentView = 'login';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

// Check authentication
function checkAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);
  
  if (token && user) {
    currentUser = JSON.parse(user);
    loadDashboard();
  } else {
    showLogin();
  }
}

// ==================== AUTH VIEWS ====================

function showLogin() {
  currentView = 'login';
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <div class="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-rocket text-white text-2xl"></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-800">Welcome to Sosh</h1>
          <p class="text-gray-600 mt-2">Manage all your social media in one place</p>
        </div>
        
        <div class="mb-6">
          <div class="flex border-b">
            <button onclick="showLoginTab()" id="loginTab" class="flex-1 py-3 text-center font-semibold text-purple-600 border-b-2 border-purple-600">
              Login
            </button>
            <button onclick="showRegisterTab()" id="registerTab" class="flex-1 py-3 text-center font-semibold text-gray-400">
              Register
            </button>
          </div>
        </div>
        
        <div id="loginForm">
          <form onsubmit="handleLogin(event)" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" name="email" required 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="you@example.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input type="password" name="password" required 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••">
            </div>
            <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition">
              <i class="fas fa-sign-in-alt mr-2"></i>Login
            </button>
          </form>
        </div>
        
        <div id="registerForm" style="display: none;">
          <form onsubmit="handleRegister(event)" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input type="text" name="fullName" required 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="John Doe">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" name="email" required 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="you@example.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input type="password" name="password" required 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••">
            </div>
            <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition">
              <i class="fas fa-user-plus mr-2"></i>Create Account
            </button>
          </form>
        </div>
        
        <div id="authMessage" class="mt-4 text-center text-sm"></div>
      </div>
    </div>
  `;
}

window.showLoginTab = function() {
  document.getElementById('loginTab').className = 'flex-1 py-3 text-center font-semibold text-purple-600 border-b-2 border-purple-600';
  document.getElementById('registerTab').className = 'flex-1 py-3 text-center font-semibold text-gray-400';
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
}

window.showRegisterTab = function() {
  document.getElementById('loginTab').className = 'flex-1 py-3 text-center font-semibold text-gray-400';
  document.getElementById('registerTab').className = 'flex-1 py-3 text-center font-semibold text-purple-600 border-b-2 border-purple-600';
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

window.handleLogin = async function(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    const response = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    currentUser = response.data.user;
    loadDashboard();
  } catch (error) {
    showMessage('Login failed. Please check your credentials.', 'error');
  }
}

window.handleRegister = async function(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const fullName = formData.get('fullName');
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    const response = await axios.post('/api/auth/register', { email, password, fullName });
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    currentUser = response.data.user;
    loadDashboard();
  } catch (error) {
    showMessage('Registration failed. Email may already exist.', 'error');
  }
}

function showMessage(message, type = 'info') {
  const messageEl = document.getElementById('authMessage');
  messageEl.textContent = message;
  messageEl.className = `mt-4 text-center text-sm ${type === 'error' ? 'text-red-600' : 'text-green-600'}`;
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
  currentView = 'dashboard';
  await loadConnectedAccounts();
  await loadPosts();
  
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <div class="w-64 bg-white shadow-lg">
        <div class="p-6 bg-gradient-to-r from-purple-600 to-pink-600">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <i class="fas fa-rocket text-purple-600 text-xl"></i>
            </div>
            <div>
              <h2 class="text-white font-bold text-lg">Sosh</h2>
              <p class="text-purple-200 text-sm">${currentUser.fullName}</p>
            </div>
          </div>
        </div>
        
        <nav class="p-4">
          <a href="#" onclick="showDashboardView()" class="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 text-purple-600 mb-2">
            <i class="fas fa-home w-5"></i>
            <span class="font-medium">Dashboard</span>
          </a>
          <a href="#" onclick="showAccountsView()" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 mb-2">
            <i class="fas fa-link w-5"></i>
            <span class="font-medium">Connected Accounts</span>
          </a>
          <a href="#" onclick="showPostsView()" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 mb-2">
            <i class="fas fa-calendar w-5"></i>
            <span class="font-medium">Posts</span>
          </a>
          <a href="#" onclick="showCreatePostView()" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 mb-2">
            <i class="fas fa-plus-circle w-5"></i>
            <span class="font-medium">Create Post</span>
          </a>
          <a href="#" onclick="showAnalyticsView()" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 mb-2">
            <i class="fas fa-chart-bar w-5"></i>
            <span class="font-medium">Analytics</span>
          </a>
          <a href="#" onclick="showMediaView()" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 mb-2">
            <i class="fas fa-images w-5"></i>
            <span class="font-medium">Media Library</span>
          </a>
          <a href="#" onclick="showInboxView()" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 mb-2">
            <i class="fas fa-inbox w-5"></i>
            <span class="font-medium">Inbox</span>
          </a>
          <a href="#" onclick="showAIToolsView()" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 mb-2">
            <i class="fas fa-magic w-5"></i>
            <span class="font-medium">AI Tools</span>
          </a>
          <a href="#" onclick="handleLogout()" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 mt-6">
            <i class="fas fa-sign-out-alt w-5"></i>
            <span class="font-medium">Logout</span>
          </a>
        </nav>
      </div>
      
      <!-- Main Content -->
      <div class="flex-1 overflow-auto">
        <div id="mainContent" class="p-8"></div>
      </div>
    </div>
  `;
  
  showDashboardView();
}

window.handleLogout = function() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  currentUser = null;
  showLogin();
}

// ==================== DASHBOARD VIEW ====================

window.showDashboardView = async function() {
  try {
    const response = await axios.get('/api/analytics/dashboard');
    const data = response.data;
    
    const content = document.getElementById('mainContent');
    content.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p class="text-gray-600">Welcome back, ${currentUser.fullName}!</p>
      </div>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">Total Posts</p>
              <p class="text-3xl font-bold text-gray-800">${data.totalPosts}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-file-alt text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">Published</p>
              <p class="text-3xl font-bold text-gray-800">${data.publishedPosts}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">Total Engagement</p>
              <p class="text-3xl font-bold text-gray-800">${data.totalEngagement}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-heart text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-pink-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">Accounts Connected</p>
              <p class="text-3xl font-bold text-gray-800">${data.connectedAccounts}</p>
            </div>
            <div class="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-link text-pink-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button onclick="showCreatePostView()" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition text-left">
          <i class="fas fa-plus-circle text-3xl mb-3"></i>
          <h3 class="text-xl font-bold mb-2">Create New Post</h3>
          <p class="text-purple-100">Schedule content across all platforms</p>
        </button>
        
        <button onclick="showAccountsView()" class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left border-2 border-gray-200">
          <i class="fas fa-link text-3xl mb-3 text-purple-600"></i>
          <h3 class="text-xl font-bold mb-2 text-gray-800">Connect Account</h3>
          <p class="text-gray-600">Add new social media accounts</p>
        </button>
        
        <button onclick="showAIToolsView()" class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left border-2 border-gray-200">
          <i class="fas fa-magic text-3xl mb-3 text-purple-600"></i>
          <h3 class="text-xl font-bold mb-2 text-gray-800">AI Tools</h3>
          <p class="text-gray-600">Generate captions & hashtags</p>
        </button>
      </div>
      
      <!-- Recent Posts -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Recent Posts Performance</h2>
        <div class="space-y-4">
          ${data.recentPosts.map(post => `
            <div class="border-l-4 border-purple-500 pl-4 py-3 hover:bg-gray-50 rounded">
              <p class="font-medium text-gray-800 mb-2">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</p>
              <div class="flex items-center space-x-6 text-sm text-gray-600">
                <span><i class="fas fa-heart text-red-500 mr-1"></i>${post.total_likes || 0}</span>
                <span><i class="fas fa-comment text-blue-500 mr-1"></i>${post.total_comments || 0}</span>
                <span><i class="fas fa-share text-green-500 mr-1"></i>${post.total_shares || 0}</span>
                <span><i class="fas fa-eye text-purple-500 mr-1"></i>${post.total_impressions || 0}</span>
              </div>
            </div>
          `).join('') || '<p class="text-gray-500 text-center py-8">No published posts yet</p>'}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}

// ==================== ACCOUNTS VIEW ====================

window.showAccountsView = async function() {
  await loadConnectedAccounts();
  
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Connected Accounts</h1>
      <p class="text-gray-600">Manage your social media connections</p>
    </div>
    
    <!-- Connect New Account -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Connect New Account</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        ${generatePlatformButtons()}
      </div>
    </div>
    
    <!-- Connected Accounts -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Your Accounts</h2>
      ${connectedAccounts.length > 0 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${connectedAccounts.map(account => `
            <div class="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-500 transition">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-r ${getPlatformGradient(account.platform)} flex items-center justify-center">
                    <i class="fab fa-${account.platform} text-white text-xl"></i>
                  </div>
                  <div>
                    <p class="font-bold text-gray-800">${account.account_name}</p>
                    <p class="text-sm text-gray-500">${account.platform}</p>
                  </div>
                </div>
                <button onclick="disconnectAccount(${account.id})" class="text-red-500 hover:text-red-700">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600"><i class="fas fa-users mr-1"></i>${account.follower_count || 0}</span>
                <span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Active</span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="text-center py-12">
          <i class="fas fa-link text-gray-300 text-6xl mb-4"></i>
          <p class="text-gray-500 text-lg">No accounts connected yet</p>
          <p class="text-gray-400">Connect your first social media account above</p>
        </div>
      `}
    </div>
  `;
}

function generatePlatformButtons() {
  const platforms = [
    { name: 'facebook', label: 'Facebook', icon: 'fab fa-facebook', gradient: 'from-blue-600 to-blue-700' },
    { name: 'instagram', label: 'Instagram', icon: 'fab fa-instagram', gradient: 'from-pink-500 to-purple-600' },
    { name: 'twitter', label: 'Twitter', icon: 'fab fa-twitter', gradient: 'from-blue-400 to-blue-500' },
    { name: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin', gradient: 'from-blue-700 to-blue-800' },
    { name: 'tiktok', label: 'TikTok', icon: 'fab fa-tiktok', gradient: 'from-gray-800 to-black' },
    { name: 'youtube', label: 'YouTube', icon: 'fab fa-youtube', gradient: 'from-red-600 to-red-700' }
  ];
  
  return platforms.map(platform => `
    <button onclick="connectPlatform('${platform.name}')" class="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition text-center">
      <div class="w-12 h-12 mx-auto mb-2 bg-gradient-to-r ${platform.gradient} rounded-full flex items-center justify-center">
        <i class="${platform.icon} text-white text-xl"></i>
      </div>
      <p class="text-sm font-medium text-gray-700">${platform.label}</p>
    </button>
  `).join('');
}

function getPlatformGradient(platform) {
  const gradients = {
    facebook: 'from-blue-600 to-blue-700',
    instagram: 'from-pink-500 to-purple-600',
    twitter: 'from-blue-400 to-blue-500',
    linkedin: 'from-blue-700 to-blue-800',
    tiktok: 'from-gray-800 to-black',
    youtube: 'from-red-600 to-red-700'
  };
  return gradients[platform] || 'from-purple-600 to-pink-600';
}

window.connectPlatform = function(platform) {
  if (platform === 'facebook') {
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/facebook/callback`);
    const state = currentUser.id;
    window.open(
      `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=${redirectUri}&state=${state}&scope=pages_manage_posts,pages_read_engagement,pages_show_list`,
      'facebook-auth',
      'width=600,height=700'
    );
    
    window.addEventListener('message', async (event) => {
      if (event.data.type === 'facebook-auth-success') {
        await loadConnectedAccounts();
        showAccountsView();
      }
    });
  } else {
    alert(`${platform} integration coming soon!`);
  }
}

window.disconnectAccount = async function(accountId) {
  if (!confirm('Are you sure you want to disconnect this account?')) return;
  
  try {
    await axios.delete(`/api/social-accounts/${accountId}`);
    await loadConnectedAccounts();
    showAccountsView();
  } catch (error) {
    alert('Failed to disconnect account');
  }
}

async function loadConnectedAccounts() {
  try {
    const response = await axios.get('/api/social-accounts');
    connectedAccounts = response.data.accounts;
  } catch (error) {
    console.error('Failed to load accounts:', error);
  }
}

// ==================== POSTS VIEW ====================

window.showPostsView = async function() {
  await loadPosts();
  
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Posts</h1>
        <p class="text-gray-600">Manage your content calendar</p>
      </div>
      <button onclick="showCreatePostView()" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
        <i class="fas fa-plus mr-2"></i>Create Post
      </button>
    </div>
    
    <!-- Filter Tabs -->
    <div class="bg-white rounded-xl shadow-sm p-2 mb-6 flex space-x-2">
      <button onclick="filterPosts('all')" class="flex-1 py-2 px-4 rounded-lg bg-purple-50 text-purple-600 font-medium">All Posts</button>
      <button onclick="filterPosts('draft')" class="flex-1 py-2 px-4 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">Drafts</button>
      <button onclick="filterPosts('scheduled')" class="flex-1 py-2 px-4 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">Scheduled</button>
      <button onclick="filterPosts('published')" class="flex-1 py-2 px-4 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">Published</button>
    </div>
    
    <!-- Posts Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${posts.length > 0 ? posts.map(post => `
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <div class="flex items-center justify-between mb-4">
            <span class="px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(post.status)}">${post.status}</span>
            <div class="flex space-x-2">
              <button onclick="editPost(${post.id})" class="text-gray-600 hover:text-purple-600">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deletePost(${post.id})" class="text-gray-600 hover:text-red-600">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <p class="text-gray-800 mb-4 line-clamp-3">${post.content}</p>
          <div class="flex items-center space-x-2 mb-4">
            ${post.platforms.map(platformId => {
              const account = connectedAccounts.find(a => a.id === parseInt(platformId));
              return account ? `<span class="w-8 h-8 rounded-full bg-gradient-to-r ${getPlatformGradient(account.platform)} flex items-center justify-center">
                <i class="fab fa-${account.platform} text-white text-sm"></i>
              </span>` : '';
            }).join('')}
          </div>
          ${post.scheduled_time ? `
            <div class="text-sm text-gray-600">
              <i class="fas fa-clock mr-2"></i>${dayjs(post.scheduled_time).format('MMM D, YYYY h:mm A')}
            </div>
          ` : ''}
          ${post.status === 'scheduled' || post.status === 'draft' ? `
            <button onclick="publishPost(${post.id})" class="mt-4 w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition">
              <i class="fas fa-paper-plane mr-2"></i>Publish Now
            </button>
          ` : ''}
        </div>
      `).join('') : `
        <div class="col-span-full text-center py-12">
          <i class="fas fa-calendar-alt text-gray-300 text-6xl mb-4"></i>
          <p class="text-gray-500 text-lg mb-4">No posts yet</p>
          <button onclick="showCreatePostView()" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
            <i class="fas fa-plus mr-2"></i>Create Your First Post
          </button>
        </div>
      `}
    </div>
  `;
}

function getStatusBadge(status) {
  const badges = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    published: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700'
  };
  return badges[status] || badges.draft;
}

window.filterPosts = async function(status) {
  if (status === 'all') {
    await loadPosts();
  } else {
    try {
      const response = await axios.get(`/api/posts?status=${status}`);
      posts = response.data.posts;
    } catch (error) {
      console.error('Failed to filter posts:', error);
    }
  }
  showPostsView();
}

window.deletePost = async function(postId) {
  if (!confirm('Are you sure you want to delete this post?')) return;
  
  try {
    await axios.delete(`/api/posts/${postId}`);
    await loadPosts();
    showPostsView();
  } catch (error) {
    alert('Failed to delete post');
  }
}

window.publishPost = async function(postId) {
  if (!confirm('Publish this post now?')) return;
  
  try {
    const response = await axios.post(`/api/posts/${postId}/publish`);
    alert('Post published successfully!');
    await loadPosts();
    showPostsView();
  } catch (error) {
    alert('Failed to publish post');
  }
}

async function loadPosts() {
  try {
    const response = await axios.get('/api/posts');
    posts = response.data.posts;
  } catch (error) {
    console.error('Failed to load posts:', error);
  }
}

// ==================== CREATE POST VIEW ====================

window.showCreatePostView = function() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Create Post</h1>
      <p class="text-gray-600">Schedule content across your platforms</p>
    </div>
    
    <div class="max-w-4xl">
      <form onsubmit="handleCreatePost(event)" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Post Content</label>
          <textarea id="postContent" rows="6" required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="What's on your mind?"></textarea>
          <div class="mt-2 flex justify-between items-center">
            <span class="text-sm text-gray-500"><span id="charCount">0</span> characters</span>
            <button type="button" onclick="showAIAssist()" class="text-purple-600 hover:text-purple-700 text-sm font-medium">
              <i class="fas fa-magic mr-1"></i>AI Assist
            </button>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">Select Platforms</label>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            ${connectedAccounts.map(account => `
              <label class="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 transition">
                <input type="checkbox" name="platforms" value="${account.id}" class="w-5 h-5 text-purple-600">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r ${getPlatformGradient(account.platform)} flex items-center justify-center">
                    <i class="fab fa-${account.platform} text-white text-sm"></i>
                  </div>
                  <span class="text-sm font-medium text-gray-700">${account.account_name}</span>
                </div>
              </label>
            `).join('')}
          </div>
          ${connectedAccounts.length === 0 ? `
            <div class="text-center py-8">
              <p class="text-gray-500 mb-4">No accounts connected</p>
              <button type="button" onclick="showAccountsView()" class="text-purple-600 hover:text-purple-700 font-medium">
                <i class="fas fa-plus mr-1"></i>Connect Account
              </button>
            </div>
          ` : ''}
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Schedule Time (Optional)</label>
          <input type="datetime-local" id="scheduledTime"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
          <p class="text-sm text-gray-500 mt-2">Leave empty to save as draft</p>
        </div>
        
        <div class="flex space-x-4">
          <button type="submit" class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition">
            <i class="fas fa-save mr-2"></i>Save Post
          </button>
          <button type="button" onclick="showPostsView()" class="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
  
  // Character counter
  document.getElementById('postContent').addEventListener('input', (e) => {
    document.getElementById('charCount').textContent = e.target.value.length;
  });
}

window.handleCreatePost = async function(e) {
  e.preventDefault();
  
  const content = document.getElementById('postContent').value;
  const scheduledTime = document.getElementById('scheduledTime').value;
  const platformCheckboxes = document.querySelectorAll('input[name="platforms"]:checked');
  const platforms = Array.from(platformCheckboxes).map(cb => cb.value);
  
  if (platforms.length === 0) {
    alert('Please select at least one platform');
    return;
  }
  
  try {
    await axios.post('/api/posts', {
      content,
      platforms,
      scheduledTime: scheduledTime || null,
      mediaUrls: []
    });
    
    alert('Post created successfully!');
    await loadPosts();
    showPostsView();
  } catch (error) {
    alert('Failed to create post');
  }
}

// ==================== AI TOOLS VIEW ====================

window.showAIToolsView = function() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">AI Tools</h1>
      <p class="text-gray-600">Generate captions, hashtags, and more</p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Caption Generator -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-magic text-purple-600 mr-2"></i>Caption Generator
        </h2>
        <form onsubmit="generateCaption(event)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input type="text" id="captionTopic" required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., New product launch">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tone</label>
            <select id="captionTone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="funny">Funny</option>
              <option value="inspirational">Inspirational</option>
              <option value="educational">Educational</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Platform</label>
            <select id="captionPlatform" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>
          <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">
            <i class="fas fa-wand-magic mr-2"></i>Generate Caption
          </button>
        </form>
        <div id="captionResult" class="mt-4 p-4 bg-purple-50 rounded-lg hidden">
          <p class="text-sm font-medium text-gray-700 mb-2">Generated Caption:</p>
          <p id="captionText" class="text-gray-800"></p>
          <button onclick="copyCaption()" class="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium">
            <i class="fas fa-copy mr-1"></i>Copy
          </button>
        </div>
      </div>
      
      <!-- Hashtag Generator -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-hashtag text-purple-600 mr-2"></i>Hashtag Generator
        </h2>
        <form onsubmit="generateHashtags(event)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input type="text" id="hashtagTopic" required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., fitness, travel, food">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Number of Hashtags</label>
            <input type="number" id="hashtagCount" value="10" min="5" max="30"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
          </div>
          <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">
            <i class="fas fa-wand-magic mr-2"></i>Generate Hashtags
          </button>
        </form>
        <div id="hashtagResult" class="mt-4 p-4 bg-purple-50 rounded-lg hidden">
          <p class="text-sm font-medium text-gray-700 mb-2">Generated Hashtags:</p>
          <p id="hashtagText" class="text-gray-800"></p>
          <button onclick="copyHashtags()" class="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium">
            <i class="fas fa-copy mr-1"></i>Copy
          </button>
        </div>
      </div>
    </div>
  `;
}

window.generateCaption = async function(e) {
  e.preventDefault();
  
  const topic = document.getElementById('captionTopic').value;
  const tone = document.getElementById('captionTone').value;
  const platform = document.getElementById('captionPlatform').value;
  
  try {
    const response = await axios.post('/api/ai/caption', { topic, tone, platform });
    document.getElementById('captionText').textContent = response.data.caption;
    document.getElementById('captionResult').classList.remove('hidden');
  } catch (error) {
    alert('Failed to generate caption. Make sure OpenAI API key is configured.');
  }
}

window.generateHashtags = async function(e) {
  e.preventDefault();
  
  const topic = document.getElementById('hashtagTopic').value;
  const count = document.getElementById('hashtagCount').value;
  
  try {
    const response = await axios.post('/api/ai/hashtags', { topic, count: parseInt(count) });
    document.getElementById('hashtagText').textContent = response.data.hashtags.join(' ');
    document.getElementById('hashtagResult').classList.remove('hidden');
  } catch (error) {
    alert('Failed to generate hashtags. Make sure OpenAI API key is configured.');
  }
}

window.copyCaption = function() {
  const text = document.getElementById('captionText').textContent;
  navigator.clipboard.writeText(text);
  alert('Caption copied to clipboard!');
}

window.copyHashtags = function() {
  const text = document.getElementById('hashtagText').textContent;
  navigator.clipboard.writeText(text);
  alert('Hashtags copied to clipboard!');
}

// ==================== ANALYTICS VIEW ====================

window.showAnalyticsView = async function() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Analytics</h1>
      <p class="text-gray-600">Track your performance across platforms</p>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800">Performance Metrics</h2>
        <button onclick="syncAnalytics()" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
          <i class="fas fa-sync mr-2"></i>Sync Data
        </button>
      </div>
      <div class="h-64 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <i class="fas fa-chart-line text-6xl mb-4"></i>
          <p>Analytics charts will appear here</p>
          <p class="text-sm mt-2">Publish some posts to see your performance</p>
        </div>
      </div>
    </div>
  `;
}

window.syncAnalytics = async function() {
  try {
    await axios.post('/api/analytics/sync');
    alert('Analytics synced successfully!');
    showAnalyticsView();
  } catch (error) {
    alert('Failed to sync analytics');
  }
}

// ==================== MEDIA VIEW ====================

window.showMediaView = function() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Media Library</h1>
        <p class="text-gray-600">Manage your content assets</p>
      </div>
      <button onclick="showUploadForm()" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
        <i class="fas fa-upload mr-2"></i>Upload Media
      </button>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="text-center py-12">
        <i class="fas fa-images text-gray-300 text-6xl mb-4"></i>
        <p class="text-gray-500 text-lg">Media library coming soon</p>
        <p class="text-gray-400">Upload and organize your images and videos</p>
      </div>
    </div>
  `;
}

// ==================== INBOX VIEW ====================

window.showInboxView = async function() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Unified Inbox</h1>
      <p class="text-gray-600">Manage all your messages in one place</p>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="text-center py-12">
        <i class="fas fa-inbox text-gray-300 text-6xl mb-4"></i>
        <p class="text-gray-500 text-lg">No messages yet</p>
        <p class="text-gray-400">Your social media messages will appear here</p>
      </div>
    </div>
  `;
}
