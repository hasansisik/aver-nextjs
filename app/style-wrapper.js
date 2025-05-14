// This file allows for consistent style application
"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Routes that should use shadcn UI
const shadcnRoutes = ['/dashboard', '/login'];

export default function StyleWrapper({ children }) {
  const pathname = usePathname();
  const [stylesLoaded, setStylesLoaded] = useState(false);
  
  useEffect(() => {
    const loadStyles = async () => {
      // Check if we're on a shadcn route
      const isShadcnRoute = shadcnRoutes.includes(pathname) || 
                          shadcnRoutes.some(route => pathname.startsWith(`${route}/`));
      
      if (isShadcnRoute) {
        // We already import globals.css in the specific pages
        setStylesLoaded(true);
      } else {
        // For all other routes, load the regular styles
        await import('@/styles/styles.scss');
        setStylesLoaded(true);
      }
    };
    
    loadStyles();
  }, [pathname]);
  
  if (!stylesLoaded) {
    // Optional loading indicator while styles load
    return null;
  }
  
  return children;
} 