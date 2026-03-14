# Premier Ballet Academy - Marketing Operations Platform

A comprehensive single-user marketing operations dashboard for Premier Ballet Academy (PBA), a professional ballet academy in Cairo, Egypt with 3 public-facing branches (New Cairo, Maadi, Sheikh Zayed).

## 🎯 Features

### Dashboard
- **11 KPI Cards** with real-time status indicators (Green/Amber/Red)
- **Today's Activity Panel** showing all scheduled posts
- **Active Campaign Tracker** with progress visualization
- **Weekly Posting Streak** (7-day bar chart with target tracking)
- **WhatsApp Pipeline Summary** (Inquiries → Auditions → Enrollments)
- **Enrollment Progress** by branch with 80-student target

### Data Input
- **Meta Performance Paste** - Parse Instagram/Facebook exports with Gemini AI
- **WhatsApp & Enrollment Tracker** - Weekly pipeline and branch enrollment data
- **Manual KPI Override** - Update any of 11 KPIs with target references

### Content Calendar
- **Weekly Grid View** (Sun-Sat) with color-coded content pillars
- **Post Management** - Mark as posted, hold, or delete
- **Held Posts Tray** - Reschedule held content
- **Week Navigation** - Browse past and future weeks

### Post Editor
- **Full Post Metadata** - Platform, format, pillar, status, date/time
- **Caption Editor** with real-time brand rules validation
- **Gemini AI Integration** - Improve captions while maintaining brand voice
- **Visual Brief & Hashtags** - Complete post details
- **Brand Rules Sidebar** - Live violation detection

### Content Upload
- **Bulk Import** - Upload multiple posts from structured text format
- **Gemini AI Parsing** - Automatically extract post metadata
- **Preview Before Import** - Review all posts before adding to calendar
- **Format Template** - Download pre-formatted template

### Marketing Plan
- **10-Stage Strategy** - Complete integrated marketing framework
- **5 Content Pillars** - Authority, Student Progress, Education, Community, Enrollment
- **90-Day Critical Fixes** - Priority action items checklist
- **KPI Targets Dashboard** - All 11 metrics with progress tracking
- **Brand Voice Rules** - Do's and Don'ts for institutional tone

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with PBA brand colors
- **Build Tool**: Vite
- **AI Integration**: Google Gemini API (gemini-1.5-flash)
- **Storage**: Browser localStorage (no backend required)
- **Icons**: Lucide React
- **Typography**: Cormorant Garamond (headings) + Jost (body)

## 🎨 Brand Colors

- **Deep Burgundy** (Primary): #802035
- **Ballet Pink** (Secondary): #F9E1E1
- **Neutral Gray**: #8E8E8E
- **White**: #FFFFFF

## 📊 KPIs Tracked

1. Monthly Organic Clicks
2. Video Hook Rate (%)
3. WhatsApp Booking Rate (%)
4. Cost Per Lead (EGP)
5. Monthly Paid Reach
6. Day-30 Retention (%)
7. Google Reviews (total)
8. Rank Math Score
9. New Enrollments/Month
10. Post Frequency (posts/week)
11. Instagram Followers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API key (from [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pba-marketing-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Configuration

1. Open the app in your browser
2. Click the **Settings** (gear icon) in the sidebar
3. Enter your **Gemini API Key**
4. Save

All data is stored locally in your browser's localStorage.

## 📱 Usage

### Dashboard
- View all KPIs and current pipeline status
- Monitor weekly posting streak and enrollment progress
- See today's scheduled posts at a glance

### Data Input
- **Meta Paste**: Copy Instagram/Facebook metrics and paste for AI parsing
- **WhatsApp Tracker**: Enter weekly inquiries, auditions, and enrollments
- **KPI Override**: Manually update any metric

### Content Calendar
- Navigate weeks with arrow buttons
- Click posts to mark as posted, hold, or delete
- View held posts in the expandable tray

### Post Editor
- Fill in post metadata (platform, format, pillar, date/time)
- Write caption following Pain → Agitation → Solution → Proof → CTA structure
- Use "Improve with Gemini" to refine caption while maintaining brand voice
- Save to calendar

### Content Upload
- Download the format template
- Fill in multiple posts in the structured format
- Paste into the upload section
- Preview and load into calendar

### Marketing Plan
- Review 10-stage strategy overview
- Check content pillar guidelines
- Track 90-day critical fixes
- Monitor KPI progress toward targets

## 🔐 Data Privacy

All data is stored **locally in your browser** using localStorage. No data is sent to any server except:
- Gemini API calls (for caption improvement and parsing) - sent to Google's servers
- Your API key is stored locally and never transmitted to third parties

## 📦 Deployment

The app is optimized for deployment to:
- **Vercel** (recommended)
- **Netlify**
- **Cloudflare Pages**
- **GitHub Pages**
- Any static hosting service

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 🤝 Support

For issues or feature requests, please contact the development team.

## 📄 License

Proprietary - Premier Ballet Academy

---

**Built for Premier Ballet Academy Marketing Operations**
