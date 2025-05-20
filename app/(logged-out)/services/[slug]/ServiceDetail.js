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
        // Check for hash in URL (e.g. #feature-name)
        if (window.location.hash) {
          const featureSlug = window.location.hash.substring(1); // Remove the # character
          
          // Find the feature that matches this slug
          if (currentService && currentService.features) {
            const matchingFeature = currentService.features.find(f => {
              const featureTitle = typeof f === 'string' ? f : f.title;
              return slugify(featureTitle) === featureSlug;
            });
            
            if (matchingFeature) {
              const featureTitle = typeof matchingFeature === 'string' ? matchingFeature : matchingFeature.title;
              setSelectedFeature(featureTitle);
            }
          }
        }
        // Fallback to previous approach
        else if (params.feature) {
          setSelectedFeature(decodeURIComponent(params.feature));
        } 
      } catch (e) {
        console.error('Error processing URL parameters:', e);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [params.feature, currentService]);
  
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
    
    // Update URL with hash for the feature
    const featureSlug = slugify(featureTitle);
    window.history.pushState({}, '', `#${featureSlug}`);
    
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
          
          {/* Feature List */}
          {currentService.features && currentService.features.length > 0 && (
            <div className="row mt-16">
              <div className="col-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">
                  {selectedFeature ? 'Other Features' : 'Features'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentService.features.map((feature, idx) => {
                    const featureTitle = typeof feature === 'string' ? feature : feature.title;
                    // Skip the currently selected feature
                    if (selectedFeature === featureTitle) return null;
                    
                    return (
                      <div key={idx} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
                        <h3 className="text-xl font-semibold mb-3">{featureTitle}</h3>
                        <button 
                          onClick={() => handleFeatureSelect(featureTitle)}
                          className="text-red-500 hover:underline flex items-center mt-2"
                        >
                          Learn more
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>  
    </>
  );
} 