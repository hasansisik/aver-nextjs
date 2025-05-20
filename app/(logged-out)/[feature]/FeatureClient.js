"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getServiceBySlug, getServices } from "@/redux/actions/serviceActions";
import { useParams } from "next/navigation";
import ServiceClient from "@/app/(logged-out)/services/[slug]/ServiceClient";

// Utility function for creating clean slugs
function slugify(text) {
  if (!text) return '';
  
  // Turkish character mapping
  const turkishMap = {
    'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
    'İ': 'i', 'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'Ö': 'o', 'Ç': 'c'
  };
  
  return text
    .toString()
    .trim()
    .replace(/[ıİğĞüÜşŞöÖçÇ]/g, match => turkishMap[match] || match) // Replace Turkish chars
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[&+.,()'"!:@#$%^*{}[\]<>~`;?/\\|=]/g, "") // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase();
}

export default function FeatureClient({ featureSlug, initialServiceData }) {
  const params = useParams();
  const dispatch = useDispatch();
  const { services, loading, error } = useSelector((state) => state.service);
  const [featureTitle, setFeatureTitle] = useState(initialServiceData?.featureName || "");
  const [featureContent, setFeatureContent] = useState("");
  const [serviceData, setServiceData] = useState(null);
  
  // Effect for using initial data from server
  useEffect(() => {
    if (initialServiceData) {
      // Fetch the full service data
      dispatch(getServiceBySlug(initialServiceData.slug));
      
      // If we also got a feature name, set it
      if (initialServiceData.featureName) {
        setFeatureTitle(initialServiceData.featureName);
      }
    }
  }, [initialServiceData, dispatch]);
  
  // Effect to handle initial load and find the service and feature
  useEffect(() => {
    // Only run this effect if we don't have initial data from the server
    if (initialServiceData) {
      return;
    }
    
    const findFeatureAndService = async () => {
      try {
        // 1. First try getting the service slug from localStorage
        const storedServiceSlug = localStorage.getItem('featureServiceSlug');
        const storedFeature = localStorage.getItem('selectedFeature');
        
        // Verify if the stored feature slug matches the current URL
        const storedFeatureSlug = localStorage.getItem('featureSlug');
        const isStoredFeatureMatchingUrl = storedFeatureSlug && 
          (storedFeatureSlug === featureSlug || storedFeatureSlug.toLowerCase() === featureSlug.toLowerCase());
        
        // If we have a stored service slug and the feature matches the URL
        if (storedServiceSlug && (isStoredFeatureMatchingUrl || !storedFeatureSlug)) {
          await dispatch(getServiceBySlug(storedServiceSlug));
          
          // If we also have a stored feature, use that
          if (storedFeature) {
            setFeatureTitle(storedFeature);
          } else {
            // Otherwise derive it from the slug
            const derivedFeature = decodeURIComponent(featureSlug)
              .replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase()); // Convert to title case
            setFeatureTitle(derivedFeature);
          }
          
          // Don't clear localStorage here - let the component fully render first
          return;
        }
        
        // 2. If no service slug in localStorage or the feature doesn't match, fetch all services and search
        await dispatch(getServices());
      } catch (error) {
        // Silently handle errors
      }
    };
    
    findFeatureAndService();
  }, [dispatch, featureSlug, initialServiceData]);
  
  // Effect to find the feature in services once they are loaded
  useEffect(() => {
    if (!services || services.length === 0 || serviceData) return;
    
    const findServiceWithFeature = () => {
      // If we don't have a feature title yet, derive it from the slug
      const searchFeatureTitle = featureTitle || decodeURIComponent(featureSlug)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      // Search through all services for the feature
      for (const service of services) {
        if (!service.features) continue;
        
        // Find the feature in this service
        const feature = service.features.find(f => {
          const title = typeof f === 'string' ? f : f.title;
          
          // Create simple slugs for comparison
          const titleSlug = slugify(title);
          const featureSlugified = slugify(featureSlug);
          const searchSlug = searchFeatureTitle ? slugify(searchFeatureTitle) : '';
          
          return titleSlug === featureSlugified || 
                 (searchSlug && titleSlug === searchSlug);
        });
        
        if (feature) {
          // Found the service containing this feature
          setServiceData(service);
          
          // Set feature title if not already set
          if (!featureTitle) {
            setFeatureTitle(typeof feature === 'string' ? feature : feature.title);
          }
          
          // Set feature content if available
          setFeatureContent(typeof feature === 'string' ? null : feature.content);
          
          // Fetch the complete service data
          dispatch(getServiceBySlug(service.slug));
          
          break;
        }
      }
    };
    
    findServiceWithFeature();
  }, [services, featureSlug, featureTitle, dispatch, serviceData]);
  
  // Effect to clean up localStorage after successful render
  useEffect(() => {
    if (serviceData && featureTitle) {
      // Only clear localStorage if we've successfully found and rendered the feature
      localStorage.removeItem('featureServiceSlug');
      localStorage.removeItem('selectedFeature');
      localStorage.removeItem('featureServiceTitle');
      localStorage.removeItem('featureSlug');
    }
  }, [serviceData, featureTitle]);
  
  if (loading) {
    return <div className="container py-20 text-center">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl mb-4">Error Loading Feature</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  if (!serviceData) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl mb-4">Feature Not Found</h2>
        <p>The feature you&apos;re looking for could not be found.</p>
        <Link href="/services" className="inline-block mt-6 px-6 py-2 bg-white text-black rounded-md">
          Browse Services
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <section className="pt-20 pb-20">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="service-header mb-10 md:mb-16">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  {featureTitle}
                </h1>
                <p className="text-lg text-gray-500 max-w-3xl">
                  Feature of {serviceData.title}
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ServiceClient markdownContent={featureContent || ""} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 