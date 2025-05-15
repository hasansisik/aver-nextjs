import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { promises as fsPromises } from 'fs'

const seoDataPath = path.join(process.cwd(), 'data/seo-settings.json')

// Ensure the data directory exists
const ensureDataDir = async () => {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fsPromises.access(dataDir)
  } catch {
    await fsPromises.mkdir(dataDir, { recursive: true })
  }
}

// Initialize the SEO settings file if it doesn't exist
const initSeoFile = async () => {
  try {
    await fsPromises.access(seoDataPath)
  } catch {
    const defaultPages = [
      { id: "home", name: "Home", path: "/", title: "", description: "", keywords: "" },
      { id: "about", name: "About", path: "/about", title: "", description: "", keywords: "" },
      { id: "blog", name: "Blog", path: "/blog", title: "", description: "", keywords: "" },
      { id: "contact", name: "Contact", path: "/contact", title: "", description: "", keywords: "" },
      { id: "privacy", name: "Privacy", path: "/privacy", title: "", description: "", keywords: "" },
      { id: "project", name: "Project", path: "/project", title: "", description: "", keywords: "" }
    ]
    
    await fsPromises.writeFile(seoDataPath, JSON.stringify(defaultPages, null, 2))
  }
}

// GET handler to retrieve SEO settings
export async function GET() {
  try {
    await ensureDataDir()
    await initSeoFile()
    
    const data = await fsPromises.readFile(seoDataPath, 'utf8')
    const seoSettings = JSON.parse(data)
    
    return NextResponse.json(seoSettings)
  } catch (error) {
    console.error('Error reading SEO settings:', error)
    return NextResponse.json(
      { error: 'Failed to load SEO settings' },
      { status: 500 }
    )
  }
}

// POST handler to update SEO settings
export async function POST(request) {
  try {
    await ensureDataDir()
    
    const seoSettings = await request.json()
    
    // Validate the data structure
    if (!Array.isArray(seoSettings)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      )
    }
    
    await fsPromises.writeFile(seoDataPath, JSON.stringify(seoSettings, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving SEO settings:', error)
    return NextResponse.json(
      { error: 'Failed to save SEO settings' },
      { status: 500 }
    )
  }
} 