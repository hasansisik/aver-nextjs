"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hook to fetch SEO settings for the current page path
 * 
 * @param {string} defaultTitle - Default title to use if no SEO setting is found
 * @param {string} defaultDescription - Default description to use if no SEO setting is found
 * @param {string} defaultKeywords - Default keywords to use if no SEO setting is found
 * @returns {object} - SEO settings object with title, description, and keywords
 */
export default function useSeoSettings(
  defaultTitle = '',
  defaultDescription = '',
  defaultKeywords = ''
) {
  const pathname = usePathname()
  const [seoData, setSeoData] = useState({
    title: defaultTitle,
    description: defaultDescription,
    keywords: defaultKeywords,
    isLoading: true
  })
  
  useEffect(() => {
    const fetchSeoSettings = async () => {
      try {
        // Reset loading state
        setSeoData(prev => ({ ...prev, isLoading: true }))
        
        // Fetch all SEO settings
        const response = await fetch('/api/seo')
        if (!response.ok) {
          throw new Error('Failed to fetch SEO settings')
        }
        
        const allSettings = await response.json()
        
        // Normalize the current path for comparison
        let normalizedPath = pathname
        if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
          normalizedPath = normalizedPath.slice(0, -1)
        }
        
        // Find settings for the current path
        const pageSettings = allSettings.find(page => page.path === normalizedPath)
        
        if (pageSettings) {
          setSeoData({
            title: pageSettings.title || defaultTitle,
            description: pageSettings.description || defaultDescription,
            keywords: pageSettings.keywords || defaultKeywords,
            isLoading: false
          })
        } else {
          // Use defaults if no custom settings found
          setSeoData({
            title: defaultTitle,
            description: defaultDescription,
            keywords: defaultKeywords,
            isLoading: false
          })
        }
      } catch (error) {
        console.error('Error fetching SEO settings:', error)
        setSeoData({
          title: defaultTitle,
          description: defaultDescription,
          keywords: defaultKeywords,
          isLoading: false
        })
      }
    }
    
    fetchSeoSettings()
  }, [pathname, defaultTitle, defaultDescription, defaultKeywords])
  
  return seoData
} 