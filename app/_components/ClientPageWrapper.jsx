"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * This component is a wrapper for client components that need to update
 * the document title and meta tags at runtime.
 * 
 * It should only be used when necessary since server components with
 * generateMetadata are preferred.
 */
const ClientPageWrapper = ({
  title,
  description,
  keywords,
  children
}) => {
  const router = useRouter()
  
  useEffect(() => {
    // Update document title if provided
    if (title) {
      document.title = title
    }
    
    // Update meta description if provided
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', description)
      } else {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        metaDescription.setAttribute('content', description)
        document.head.appendChild(metaDescription)
      }
    }
    
    // Update meta keywords if provided
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords)
      } else {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        metaKeywords.setAttribute('content', keywords)
        document.head.appendChild(metaKeywords)
      }
    }
    
    // Cleanup function
    return () => {
      // No cleanup needed as we don't want to remove meta tags
      // when this component unmounts
    }
  }, [title, description, keywords, router])
  
  return <>{children}</>
}

export default ClientPageWrapper 