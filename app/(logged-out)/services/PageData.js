'use client';

import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getServices } from "@/redux/actions/serviceActions";

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

// Custom CSS for the service card hover effect - updated to match HomeClient.js
const useCustomStyles = () => {
  useEffect(() => {
    // Add custom styles to the document
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .service-card-wrapper {
        margin: 0;
        padding: 0;
        position: relative;
        overflow: visible;
        height: 100%;
        box-sizing: border-box;
        width: 100%;
      }
      .service-card {
        background-color: #ffffff;
        position: relative;
        box-shadow: 0 0 0 rgba(0,0,0,0);
        height: auto;
        padding: 0;
        margin: 0;
        overflow: visible;
        border-radius: 5px;
        width: 100%;
        box-sizing: border-box;
      }
      .service-card:hover {
        z-index: 100 !important;
        background-color: #ffffff !important;
        box-shadow: 15px 0 35px rgba(0,0,0,0.05) !important, -15px 0 35px rgba(0,0,0,0.05) !important, 0 15px 35px rgba(0,0,0,0.05) !important, 0 -45px 50px rgba(0,0,0,0.04) !important;
        transform: none !important;
        position: absolute !important;
        width: calc(100% - 16px) !important;
        max-width: calc(100% - 16px) !important;
        border-radius: 5px !important;
        left: 8px !important;
        right: 8px !important;
      }
      .service-card-content {
        height: auto;
        overflow: visible;
        position: relative;
        z-index: 5;
        width: 100%;
        box-sizing: border-box;
      }
      .service-feature-list {
        transition: opacity 0.25s ease-in-out;
        opacity: 0;
        height: 0;
        overflow: hidden;
        visibility: hidden;
        padding: 0;
        width: 100%;
        box-sizing: border-box;
        position: relative;
        z-index: 5;
      }
      .service-card:hover .service-feature-list {
        opacity: 1;
        height: auto;
        visibility: visible;
        padding: 0;
        transition: opacity 0.3s ease-in-out, height 0.3s ease-in-out, visibility 0.3s ease-in-out;
        width: 100%;
        box-sizing: border-box;
      }
      .service-feature-list li {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.2s ease-out;
        transition-behavior: normal;
        transition-duration: 0.2s;
        transition-timing-function: ease-out;
        transition-delay: 0s;
        visibility: hidden;
        position: relative;
        z-index: 1;
      }
      .service-feature-list li a {
        position: relative;
        z-index: 2;
        display: block;
        pointer-events: auto;
      }
      .service-feature-list li::before {
        content: "";
        position: absolute;
        left: 0;
        width: 0;
        height: 100%;
        z-index: -1;
        transition: none;
        border-radius: 4px;
      }
      .service-card:hover .service-feature-list li {
        opacity: 1;
        transform: translateY(0);
        visibility: visible;
        transition: all 0.2s ease-out;
        transition-behavior: normal;
        transition-duration: 0.2s;
        transition-timing-function: ease-out;
        pointer-events: auto;
      }
      .service-card:hover .service-feature-list li:nth-child(1) {
        transition-delay: 0.2s;
      }
      .service-card:hover .service-feature-list li:nth-child(2) {
        transition-delay: 0.6s;
      }
      .service-card:hover .service-feature-list li:nth-child(3) {
        transition-delay: 1.0s;
      }
      .service-card:hover .service-feature-list li:nth-child(4) {
        transition-delay: 1.4s;
      }
      .service-card:hover .service-feature-list li:nth-child(5) {
        transition-delay: 1.8s;
      }
      .service-card:hover .service-feature-list li:nth-child(6) {
        transition-delay: 0.3s;
      }
      .service-card:hover .service-feature-list li::before {
        width: 100%;
        transition: width 0.5s ease-out;
        transition-delay: inherit;
      }
      
      /* Mobile service card styles */
      .service-card-mobile {
        transition: all 0.3s ease-in-out;
        background-color: #ffffff;
        position: relative;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        height: auto;
        cursor: pointer;
        z-index: 40;
      }
      .service-card-mobile.expanded {
        z-index: 50;
        box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        transform: translateY(-2px);
      }
      .service-card-mobile:hover {
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 45;
      }
      .service-feature-list-mobile {
        transition: all 0.35s ease-in-out;
        opacity: 0;
        height: 0;
        overflow: hidden;
        visibility: hidden;
        padding: 0;
        position: relative;
        z-index: 45;
        transform: translateY(-10px);
        max-height: 0;
      }
      .service-feature-list-mobile.active {
        opacity: 1;
        height: auto;
        visibility: visible;
        padding: 1rem 0 0;
        z-index: 50;
        transform: translateY(0);
        max-height: 500px;
      }
      
      @media (max-width: 768px) {
        .services-container {
          min-height: 800px !important;
          padding: 0 15px;
        }
        .mobile-service-wrapper {
          padding: 15px;
          margin: 0 -15px;
        }
        .service-card-mobile {
          margin-bottom: 20px;
          padding: 5px;
        }
        .service-card-mobile > div {
          padding: 20px !important;
        }
        .service-feature-list-mobile.active {
          padding-top: 1.5rem;
        }
        section.services-section {
          padding-top: 4rem !important;
          padding-bottom: 6rem !important;
        }
        .service-card {
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border-radius: 0.5rem;
          position: relative;
          background-color: #ffffff;
          z-index: 20;
        }
        .service-feature-list {
          transition: all 0.35s ease-in-out;
          opacity: 0;
          height: 0;
          overflow: hidden;
          visibility: hidden;
          padding: 0;
        }
        .service-card:hover .service-feature-list {
          opacity: 1;
          height: auto;
          visibility: visible;
          padding: 1rem 0 0;
        }
        .service-card:hover {
          z-index: 10;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          position: relative;
          transform: none;
          width: 100%;
          max-width: 100%;
          left: 0;
          right: 0;
        }
        .service-feature-list li {
          opacity: 1;
          transform: none;
          transition: none;
          visibility: visible;
          position: relative;
        }
        .service-feature-list li a {
          pointer-events: auto;
        }
        .service-card:hover .service-feature-list li {
          transition: none;
        }
        .service-card:hover .service-feature-list li::before {
          transition: none;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
}

// Mobile Service Card component with click behavior
const MobileServiceCard = ({ service, index, expandedCardId, setExpandedCardId }) => {
  const isExpanded = expandedCardId === (service._id || index);

  const handleCardClick = () => {
    // If already expanded, close it. Otherwise, expand it and close any other.
    if (isExpanded) {
      setExpandedCardId(null);
    } else {
      setExpandedCardId(service._id || index);
    }
  };

  return (
    <div 
      className={`relative service-card-mobile rounded-lg bg-white shadow-md h-auto transition-all duration-300 ${isExpanded ? 'shadow-lg expanded' : ''}`}
      onClick={handleCardClick}
      style={{ position: 'relative', zIndex: isExpanded ? 50 : 20 }}
    >
      {/* Card Content */}
      <div className="p-8 flex flex-col">
        <div className="flex mb-4">
          <Image 
            src={service.icon || "/images/icons/default-service.svg"} 
            alt={service.title || "Service"}
            width={60} 
            height={60}
          />
        </div>
        <h3 className="text-2xl font-medium mb-4 text-gray-800">
          {service.title || "Service"}
        </h3>
        <p className="text-gray-600 mb-4">
          {service.description || "Service description"}
        </p>
        
        {/* Features List - Visible based on expanded state */}
        <div className={`service-feature-list-mobile ${isExpanded ? 'active' : ''}`}>
          <div className="border-t border-gray-200 mt-2">
            <ul className="space-y-0 pt-4">
              {service.features && service.features.map ? 
                service.features.map((feature, idx) => {
                  const featureTitle = typeof feature === 'string' ? feature : feature.title;
                  const featureSlug = slugify(featureTitle);
                  
                  return (
                    <li key={idx}>
                      <Link 
                        href={`/${featureSlug}`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click event
                          localStorage.setItem('selectedFeature', featureTitle);
                          localStorage.setItem('featureServiceSlug', service.slug);
                          localStorage.setItem('featureServiceTitle', service.title);
                          localStorage.setItem('featureSlug', featureSlug);
                        }}
                        className="text-red-500 hover:underline block py-3"
                      >
                        {featureTitle}
                      </Link>
                      {idx < (service.features.length - 1) && (
                        <div className="border-t border-gray-100"></div>
                      )}
                    </li>
                  );
                }) : (
                <li>
                  <Link 
                    href="/services"
                    className="text-red-500 hover:underline block py-3"
                    onClick={(e) => e.stopPropagation()} // Prevent card click event
                  >
                    Learn more
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a ServiceCard component to match HomeClient.js
const ServiceCard = ({ service }) => {
  return (
    <div className="service-card-wrapper" style={{position: 'relative'}}>
      <div 
        className="service-card bg-white overflow-hidden" 
        style={{
          boxShadow: '0 0 0 rgba(0,0,0,0)',
          borderRadius: '5px',
          width: 'calc(100% - 16px)',
          position: 'relative',
          left: '8px',
          margin: '0'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = '15px 0 35px rgba(0,0,0,0.05), -15px 0 35px rgba(0,0,0,0.05), 0 15px 35px rgba(0,0,0,0.05), 0 -45px 50px rgba(0,0,0,0.04)';
          e.currentTarget.style.zIndex = '100';
          e.currentTarget.style.borderRadius = '5px';
          e.currentTarget.style.width = 'calc(100% - 16px)';
          e.currentTarget.style.maxWidth = 'calc(100% - 16px)';
          e.currentTarget.style.boxSizing = 'border-box';
          e.currentTarget.style.left = '8px';
          e.currentTarget.style.right = '8px';
          e.currentTarget.style.position = 'absolute';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
          e.currentTarget.style.zIndex = '10';
          e.currentTarget.style.position = 'relative';
        }}
      >
        {/* Card Content */}
        <div className="p-8 flex flex-col service-card-content" style={{width: "100%", boxSizing: "border-box", maxWidth: "100%"}}>
          <div className="flex mb-4">
            <Image 
              src={service.icon || "/images/icons/default-service.svg"} 
              alt={service.title || "Service"}
              width={50} 
              height={50}
            />
          </div>
          <h3 className="text-xl font-medium mb-4 text-gray-800 ">
            {service.title || "Service"}
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            {service.description || "Service description"}
          </p>
          
          {/* Features List - Only visible on hover */}
          <div className="service-feature-list">
            <div className="border-t border-gray-100 mt-1">
              <ul className="space-y-0">
                {service.features && service.features.map ? 
                  service.features.map((feature, idx) => {
                    const featureTitle = typeof feature === 'string' ? feature : feature.title;
                    const featureSlug = slugify(featureTitle);
                    
                    return (
                      <li key={idx} className="transform translate-y-8 opacity-0" style={{transition: 'all 0.2s ease-out', transitionDelay: `${idx * 0.05}s`}}>
                        <Link 
                          href={`/${featureSlug}`}
                          onClick={() => {
                            localStorage.setItem('selectedFeature', featureTitle);
                            localStorage.setItem('featureServiceSlug', service.slug);
                            localStorage.setItem('featureServiceTitle', service.title);
                            localStorage.setItem('featureSlug', featureSlug);
                          }}
                          className="text-red-500 text-sm hover:underline block py-2 transition-all duration-300 hover:pl-2"
                        >
                          {featureTitle}
                        </Link>
                        {idx < (service.features.length - 1) && (
                          <div className="border-t border-gray-100"></div>
                        )}
                      </li>
                    );
                  }) : (
                  <li className="transform translate-y-8 opacity-0" style={{transition: 'all 0.2s ease-out', transitionDelay: '0.05s'}}>
                    <Link 
                      href="/services"
                      className="text-red-500 hover:underline block py-2"
                    >
                      Learn more
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PageData = ({ title, subtitle }) => {
  useCustomStyles(); // Apply custom styles
  const dispatch = useDispatch();
  
  // Get services directly from Redux store
  const { services, pagination } = useSelector((state) => state.service);
  const totalServices = pagination?.totalServices || services?.length || 0;
  
  const servicesToShow = 6;
  const [displayedServices, setDisplayedServices] = useState([]);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    // Dispatch getServices action when component mounts
    dispatch(getServices());
  }, [dispatch]);

  useEffect(() => {
    if (services && services.length > 0) {
      // Consider a service published if isPublished is true OR isPublished is undefined but isActive is true
      const filteredServices = services.filter(service => 
        service.isPublished === true || (service.isPublished === undefined && service.isActive === true)
      );
      setDisplayedServices(filteredServices.slice(0, servicesToShow));
      setCanLoadMore(filteredServices.length > servicesToShow);
    }
  }, [services]);

  return (
    <>
      <PageHeader title={title} subtitle={subtitle + ` (${totalServices})`} />

      <section className="py-28 bg-gray-100 text-dark rounded-b-2xl relative services-section" style={{ zIndex: 30 }}>
        <div className="container services-container" style={{ position: 'relative', zIndex: 25, minHeight: "400px", overflow: "visible"}}>
          <div className="row mb-16 items-end">
            <div className="sm:col-8 order-2 sm:order-1">
              <h2 className="text-black text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center sm:text-left">
                {title}
              </h2>
            </div>
            <div className="sm:col-4 order-1 sm:order-2 block mb-4 sm:mb-0 text-center sm:text-right">
              <span className="font-secondary text-2xl leading-none text-black/75">
                {subtitle}
              </span>
            </div>
          </div>

          {/* Desktop View - Showing cards with absolute hover effect */}
          {!isMobile && (
            <div className="row md:gx-4 gy-5 overflow-visible">
              {displayedServices.map((service, index) => (
                <div
                  key={service._id || service.slug || index}
                  className="lg:col-4 sm:col-6 init-delay"
                  data-aos="fade-up-sm"
                  data-aos-duration="500"
                  style={{
                    "--lg-delay": `${(index % 3) * 75}ms`,
                    "--md-delay": `${(index % 2) * 75}ms`,
                    "--sm-delay": `${(index % 2) * 75}ms`,
                    overflow: 'visible'
                  }}
                >
                  <ServiceCard service={service} />
                </div>
              ))}

              {displayedServices.length === 0 && (
                <div className="col-12 text-center py-16">
                  <p className="text-lg text-gray-500">No services available at the moment.</p>
                </div>
              )}
            </div>
          )}

          {/* Mobile View - Vertical List with expandable cards */}
          {isMobile && (
            <div className="md:hidden relative mobile-service-wrapper" style={{ zIndex: 40, position: 'relative' }}>
              <div className="space-y-6 relative" style={{ zIndex: 45 }}>
                {displayedServices.length > 0 ? displayedServices.map((service, index) => (
                  <MobileServiceCard 
                    key={service._id || index} 
                    service={service} 
                    index={index}
                    expandedCardId={expandedCardId}
                    setExpandedCardId={setExpandedCardId}
                  />
                )) : (
                  <div className="text-center py-8">
                    <p className="text-lg text-gray-500">No services available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default PageData; 