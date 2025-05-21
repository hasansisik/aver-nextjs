'use client';

import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { useState, useEffect } from "react";
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

// Custom CSS for the service card hover effect
const useCustomStyles = () => {
  useEffect(() => {
    // Add custom styles to the document
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .service-card {
        transition: all 0.3s ease-out;
        background-color: #ffffff;
        position: relative;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        height: auto;
        border-radius: 5px;
        overflow: visible;
        width: 100%;
        box-sizing: border-box;
      }
      .service-card:hover {
        z-index: 100;
        box-shadow: 15px 0 35px rgba(0,0,0,0.05), -15px 0 35px rgba(0,0,0,0.05), 0 15px 35px rgba(0,0,0,0.05), 0 -45px 50px rgba(0,0,0,0.04);
        transform: translateY(-2px);
      }
      .service-feature-list {
        transition: all 0.35s ease-in-out;
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
        padding: 1rem 0 0;
        transition: opacity 0.3s ease-in-out, height 0.3s ease-in-out, visibility 0.3s ease-in-out;
      }
      .service-feature-list li {
        opacity: 0;
        transform: translateY(15px);
        transition: all 0.3s ease-out;
        transition-property: opacity, transform, visibility;
        transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        visibility: hidden;
        position: relative;
        will-change: opacity, transform, visibility;
      }
      .service-feature-list li a {
        transition: all 0.2s ease-out;
        display: block;
      }
      .service-card:hover .service-feature-list li {
        opacity: 1;
        transform: translateY(0);
        visibility: visible;
        animation: slideUp 0.3s ease-out forwards;
      }
      
      @keyframes slideUp {
        0% {
          opacity: 0;
          transform: translateY(15px);
          visibility: hidden;
        }
        100% {
          opacity: 1;
          transform: translateY(0);
          visibility: visible;
        }
      }
      
      .service-card:hover .service-feature-list li:nth-child(1) {
        transition-delay: 0.05s;
        animation-delay: 0.05s;
      }
      .service-card:hover .service-feature-list li:nth-child(2) {
        transition-delay: 0.1s;
        animation-delay: 0.1s;
      }
      .service-card:hover .service-feature-list li:nth-child(3) {
        transition-delay: 0.15s;
        animation-delay: 0.15s;
      }
      .service-card:hover .service-feature-list li:nth-child(4) {
        transition-delay: 0.2s;
        animation-delay: 0.2s;
      }
      .service-card:hover .service-feature-list li:nth-child(5) {
        transition-delay: 0.25s;
        animation-delay: 0.25s;
      }
      .service-card:hover .service-feature-list li:nth-child(6) {
        transition-delay: 0.3s;
        animation-delay: 0.3s;
      }
      
      /* Mobile styles - keeping original */
      @media (max-width: 768px) {
        .service-card {
          transition: all 0.3s ease;
          background-color: #ffffff;
          position: relative;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          height: auto;
        }
        .service-card:hover {
          z-index: 10;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          transform: none;
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
        .service-feature-list li {
          opacity: 1;
          transform: none;
          transition: none;
          visibility: visible;
          animation: none;
        }
        .service-card:hover .service-feature-list li {
          transition: none;
          animation: none;
        }
        .service-card:hover .service-feature-list li:nth-child(n) {
          transition-delay: 0s;
          animation-delay: 0s;
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

// Create a ServiceCard component similar to BlogCard
const ServiceCard = ({ service }) => {
  return (
    <div className="relative service-card rounded-lg bg-white shadow-md h-auto">
      {/* Card Content */}
      <div className="p-8 flex flex-col">
        <div className="flex mb-4">
          {service.icon ? (
            <Image 
              src={service.icon} 
              alt={service.title}
              width={60} 
              height={60}
            />
          ) : (
            <div className="w-[60px] h-[60px] bg-red-500 rounded-full flex items-center justify-center text-white">
              <span className="text-xl">{service.title.charAt(0)}</span>
            </div>
          )}
        </div>
        <h3 className="text-2xl font-medium mb-4 text-gray-800">
          {service.title}
        </h3>
        <p className="text-gray-600 mb-4">
          {service.description}
        </p>
        
        {/* Features List - Only visible on hover */}
        <div className="service-feature-list">
          <div className="border-t border-gray-200">
            <ul className="space-y-0 pt-4">
              {service.features && service.features.length > 0 ? 
                service.features.map((feature, idx) => {
                  const featureTitle = typeof feature === 'string' ? feature : feature.title;
                  const featureSlug = slugify(featureTitle);
                  
                  return (
                    <li key={idx} style={{ transitionDelay: `${idx * 0.05 + 0.05}s` }}>
                      <Link 
                        href={`/${featureSlug}`}
                        onClick={(e) => {
                          // Store both the feature and service info
                          localStorage.setItem('selectedFeature', featureTitle);
                          localStorage.setItem('featureServiceSlug', service.slug);
                          localStorage.setItem('featureServiceTitle', service.title);
                          localStorage.setItem('featureSlug', featureSlug);
                        }}
                        className="text-red-500 hover:underline block py-3 transition-all duration-300 hover:pl-2"
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
                  <span className="text-red-500 block py-3">
                    Learn more
                  </span>
                </li>
              )}
            </ul>
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

      <section className="py-28 bg-white text-dark rounded-b-2xl relative" style={{ zIndex: 30 }}>
        <div className="container" style={{ position: 'relative', zIndex: 25 ,minHeight: "600px",}}>
          <div className="row md:gx-4 gy-5">
            {displayedServices.map((service, index) => (
              <div
                key={service._id || service.slug || index}
                className="lg:col-4 sm:col-6 init-delay"
                data-aos="fade-up-sm"
                data-aos-duration="500"
                style={{
                  "--lg-delay": `${(index % 3) * 75}ms`,
                  "--md-delay": `${(index % 2) * 75}ms`,
                  "--sm-delay": `${(index % 2) * 75}ms`
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
        </div>
      </section>
    </>
  );
};

export default PageData; 