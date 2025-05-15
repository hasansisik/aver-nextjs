import { getSeoSettingsByPath } from './getSeoSettings'
import config from '@/config/site.config.json'

/**
 * Generate metadata for a page, combining default values with custom SEO settings
 * 
 * @param {string} path - The page path (e.g., '/', '/about', etc.)
 * @param {object} defaultValues - Default metadata values
 * @returns {object} - The combined metadata object
 */
export function generateMetadata(path, defaultValues = {}) {
  // Get SEO settings for this page
  const seoSettings = getSeoSettingsByPath(path)
  
  // Base metadata from site config
  const baseMetadata = {
    title: config.metaData.title,
    description: config.metaData.description,
    siteName: config.metaData.title,
    url: config.baseURL,
    type: "website",
    icons: {
      icon: config.favicon,
    },
    metadataBase: new URL(config.baseURL),
    alternates: {
      canonical: path,
    },
    openGraph: {
      images: config.metaData.ogImage,
    },
  }
  
  // Combine with default values provided by the page
  const combinedMetadata = {
    ...baseMetadata,
    ...defaultValues,
  }
  
  // Apply SEO settings if they exist and are not empty
  if (seoSettings) {
    const finalMetadata = { ...combinedMetadata }
    
    if (seoSettings.title && seoSettings.title.trim() !== '') {
      finalMetadata.title = seoSettings.title
    }
    
    if (seoSettings.description && seoSettings.description.trim() !== '') {
      finalMetadata.description = seoSettings.description
    }
    
    if (seoSettings.keywords && seoSettings.keywords.trim() !== '') {
      finalMetadata.keywords = seoSettings.keywords
    }
    
    return finalMetadata
  }
  
  return combinedMetadata
} 