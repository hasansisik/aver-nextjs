import fs from 'fs'
import path from 'path'

/**
 * Get SEO settings for all pages or a specific page
 * @param {string} pageId - Optional page ID to get settings for a specific page
 * @returns {Object|Array} - SEO settings for the specified page or all pages
 */
export function getSeoSettings(pageId = null) {
  try {
    const seoDataPath = path.join(process.cwd(), 'data/seo-settings.json')
    
    // Check if the file exists
    if (!fs.existsSync(seoDataPath)) {
      return pageId ? {} : []
    }
    
    // Read the SEO settings file
    const data = fs.readFileSync(seoDataPath, 'utf8')
    const seoSettings = JSON.parse(data)
    
    // If pageId is provided, return settings for that specific page
    if (pageId) {
      const pageSettings = seoSettings.find(page => page.id === pageId)
      return pageSettings || {}
    }
    
    // Otherwise return all settings
    return seoSettings
  } catch (error) {
    console.error('Error reading SEO settings:', error)
    return pageId ? {} : []
  }
}

/**
 * Get SEO settings for a specific path
 * @param {string} pagePath - The page path to get settings for
 * @returns {Object} - SEO settings for the specified path
 */
export function getSeoSettingsByPath(pagePath) {
  try {
    // Normalize the path
    let normalizedPath = pagePath
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = `/${normalizedPath}`
    }
    
    // Remove trailing slash if it exists (unless it's the root path)
    if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1)
    }
    
    const seoSettings = getSeoSettings()
    const pageSettings = seoSettings.find(page => page.path === normalizedPath)
    
    return pageSettings || {}
  } catch (error) {
    console.error('Error getting SEO settings by path:', error)
    return {}
  }
} 