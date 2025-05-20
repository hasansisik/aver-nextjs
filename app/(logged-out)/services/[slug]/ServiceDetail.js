"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getServiceBySlug, getServices } from "@/redux/actions/serviceActions";
import ServiceClient from "./ServiceClient";
import { useParams } from "next/navigation";

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

export default function ServiceDetail() {
  const params = useParams();
  const dispatch = useDispatch();
  const { currentService, services, loading, error } = useSelector((state) => state.service);
  const [relatedServices, setRelatedServices] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedFeatureContent, setSelectedFeatureContent] = useState(null);
  const [otherFeatures, setOtherFeatures] = useState([]);
  
  // Fetch current service and all services
  useEffect(() => {
    if (params.slug) {
      dispatch(getServiceBySlug(params.slug));
    }
    dispatch(getServices());
  }, [dispatch, params.slug]);
  
  // Check for feature in URL and localStorage on initial load
  useEffect(() => {
    // Use a setTimeout to ensure this runs after the component is mounted
    // This avoids issues with SSR where localStorage is not available
    const timer = setTimeout(() => {
      try {
        // First check URL params for feature
        if (params.feature) {
          setSelectedFeature(decodeURIComponent(params.feature));
        } else {
          // Fallback to localStorage for backwards compatibility
          const storedFeature = localStorage.getItem('selectedFeature');
          if (storedFeature) {
            setSelectedFeature(storedFeature);
            // Clear it after reading to avoid persisting the selection between page loads
            localStorage.removeItem('selectedFeature');
          }
        }
      } catch (e) {
        console.error('Error accessing localStorage:', e);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [params.feature]);
  
  // Find selected feature content and other features when service or feature changes
  useEffect(() => {
    if (currentService && currentService.features) {
      if (selectedFeature) {
        const feature = currentService.features.find(f => {
          const featureTitle = typeof f === 'string' ? f : f.title;
          return featureTitle === selectedFeature;
        });
        
        if (feature) {
          setSelectedFeatureContent(typeof feature === 'string' ? null : feature.content);
        }
      } else {
        setSelectedFeatureContent(null);
      }
      
      // Get other features excluding the selected one
      const features = currentService.features
        .filter(f => {
          const featureTitle = typeof f === 'string' ? f : f.title;
          return featureTitle !== selectedFeature;
        })
        .map(f => ({
          title: typeof f === 'string' ? f : f.title,
          content: typeof f === 'string' ? null : f.content
        }));
      
      setOtherFeatures(features);
    }
  }, [currentService, selectedFeature]);

  useEffect(() => {
    if (currentService && services && services.length > 0) {
      // Filter out the current service and get up to 2 related services
      const filteredServices = services
        .filter(service => service.slug !== params.slug && service.isPublished)
        .slice(0, 2);
      
      setRelatedServices(filteredServices);
    }
  }, [currentService, services, params.slug]);
  
  // Function to handle feature selection with URL change
  const handleFeatureSelect = (featureTitle) => {
    setSelectedFeature(featureTitle);
    
    // Update URL to include only the feature 
    const newUrl = `/${slugify(featureTitle)}`;
    
    // Store service info for the feature page
    localStorage.setItem('featureServiceSlug', params.slug);
    localStorage.setItem('selectedFeature', featureTitle);
    localStorage.setItem('featureServiceTitle', currentService.title);
    localStorage.setItem('featureSlug', slugify(featureTitle));
    console.log('Set feature from ServiceDetail:', {
      feature: featureTitle,
      serviceSlug: params.slug,
      serviceTitle: currentService.title,
      featureSlug: slugify(featureTitle)
    });
    
    // Use router to navigate without full page refresh
    window.history.pushState({}, '', newUrl);
    
    // Scroll to top
    window.scrollTo(0, 0);
  };
  
  // Clear feature selection when navigating back
  useEffect(() => {
    const handlePopState = (event) => {
      // Reset feature selection on back button press
      setSelectedFeature(null);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (loading) {
    return <div className="container py-20 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl mb-4">Error Loading Service</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!currentService) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl mb-4">Service Not Found</h2>
        <p>The service youre looking for could not be found.</p>
        <Link href="/services" className="inline-block mt-6 px-6 py-2 bg-blue-500 text-white rounded-md">
          Back to Services
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
                  {selectedFeature ? selectedFeature : currentService.title}
                </h1>
                <p className="text-lg text-gray-500 max-w-3xl">
                  {selectedFeature ? `Feature of ${currentService.title}` : currentService.description}
                </p>
              </div>
            </div>
          </div>

          {!selectedFeature && currentService.image && (
            <div className="row mb-16">
              <div className="col-12">
                <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
                  <Image 
                    src={currentService.image} 
                    alt={currentService.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          )}

          <div className="row">
            <div className="col-12">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ServiceClient markdownContent={selectedFeatureContent || currentService.markdownContent || ""} />
              </div>
            </div>
          </div>
        </div>
      </section>  
    </>
  );
} 