import { GoogleGenerativeAI } from '@google/generative-ai'
import { MetaPostData } from '../types'

let genAI: GoogleGenerativeAI | null = null

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey)
}

export const parseMetaExport = async (text: string): Promise<MetaPostData[]> => {
  if (!genAI) throw new Error('Gemini API not initialized')
  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const prompt = `You are a data extraction engine. The user will paste raw export text from Meta Business Suite. This text contains one or more posts from Instagram and/or Facebook. For each post found, extract: platform (Instagram or Facebook), post type (Reel / Photo / Carousel / Story), post date, post time, the first 100 characters of the caption, and all numeric metrics in order of appearance. The metrics appear in this fixed order for each post: Reach, Likes, Comments, Shares, Impressions, Video Views (if Reel), Average Watch Time (if Reel), Hook Rate % (if Reel), Saves, Follows gained, Profile visits. Return ONLY a valid JSON array — no explanation, no markdown, no preamble. Each post is one object in the array with fields: platform, type, date, time, caption_preview, reach, likes, comments, shares, impressions, video_views, avg_watch_time, hook_rate, saves, follows, profile_visits. Use null for missing fields.

Raw export text:
${text}`

  const result = await model.generateContent(prompt)
  const responseText = result.response.text()
  
  try {
    return JSON.parse(responseText)
  } catch (e) {
    console.error('Failed to parse Gemini response:', responseText)
    throw new Error('Failed to parse Meta export data')
  }
}

export const generatePerformanceSummary = async (posts: MetaPostData[]): Promise<string> => {
  if (!genAI) throw new Error('Gemini API not initialized')
  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const postsJson = JSON.stringify(posts, null, 2)
  
  const prompt = `You are a marketing performance analyst for Premier Ballet Academy. Analyze these post metrics against the benchmarks from the marketing plan: hook rate benchmark is 40%+, reach benchmark is 500+ per post, saves benchmark is 10+ per post.

Post data:
${postsJson}

Provide a short AI-generated paragraph (3–5 sentences) that interprets the results against these benchmarks. Flag what is above/below benchmark and what action to take. Be concise and actionable.`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

export const improveCaption = async (caption: string): Promise<string> => {
  if (!genAI) throw new Error('Gemini API not initialized')
  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const prompt = `You are a brand copywriter for Premier Ballet Academy, a professional ballet academy in Cairo founded by Cairo Opera principal dancers. The brand voice is: authoritative, refined, progress-focused, never casual. Caption structure is always: Pain question (hook, one sharp sentence) → Agitation (2–3 punchy fragments, no full paragraphs) → PBA solution (one clean statement) → Proof/details (concise, factual, specific) → Location + CTA + Hashtags. Never use exclamation marks. Never use the word 'journey'. Never use 'free' as a primary CTA. Always use institutional language with short punchy sentences and factual proof points. Improve the following caption while preserving its core message and keeping it under 300 words. Return only the improved caption, no explanation.

Original caption:
${caption}`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

export const parseContentUpload = async (text: string): Promise<any[]> => {
  if (!genAI) throw new Error('Gemini API not initialized')
  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const prompt = `You are a content parser. The user will paste a structured text block with multiple posts in this format:

POST
Date: YYYY-MM-DD
Time: HH:MM
Platform: Instagram / Facebook / Both
Format: Reel / Photo / Carousel / Story
Pillar: Authority / Student Progress / Education / Community / Enrollment CTA
Campaign: [campaign name or None]
Caption: [full caption text]
Visual: [description of the visual/video brief]
Hashtags: [hashtags]
---

Parse this and return a valid JSON array where each post is an object with fields: date, time, platform, format, pillar, campaign, caption, visual, hashtags. Return ONLY the JSON array, no explanation or markdown.

Text to parse:
${text}`

  const result = await model.generateContent(prompt)
  const responseText = result.response.text()
  
  try {
    return JSON.parse(responseText)
  } catch (e) {
    console.error('Failed to parse content upload:', responseText)
    throw new Error('Failed to parse content upload')
  }
}
