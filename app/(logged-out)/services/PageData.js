'use client';

import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getServices } from "@/redux/actions/serviceActions";

// Custom CSS for the service card hover effect
const useCustomStyles = () => {
  useEffect(() => {
    // Add custom styles to the document
    const styleElement = document.createElement('style');
    styleElement.textContent = `
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
    <Link href={`/${service.slug}`} className="block">
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
                  service.features.map((feature, idx) => (
                    <li key={idx}>
                      <a 
                        href={`/${service.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Store selected feature in localStorage
                          localStorage.setItem('selectedFeature', feature.title);
                          // Navigate to the service page
                          window.location.href = `/${service.slug}`;
                        }}
                        className="text-red-500 hover:underline block py-3"
                      >
                        {feature.title}
                      </a>
                      {idx < (service.features.length - 1) && (
                        <div className="border-t border-gray-100"></div>
                      )}
                    </li>
                  )) : (
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
    </Link>
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

  const handleLoadMore = () => {
    const currentLength = displayedServices.length;
    const filteredServices = services.filter(service => service.isPublished);
    const nextResults = filteredServices.slice(currentLength, currentLength + servicesToShow);
    setDisplayedServices([...displayedServices, ...nextResults]);
    
    if (currentLength + servicesToShow >= filteredServices.length) {
      setCanLoadMore(false);
    }
  };

  return (
    <>
      <PageHeader title={title} subtitle={subtitle + ` (${totalServices})`} />

      <section className="py-28 bg-white text-dark rounded-b-2xl">
        <div className="container">
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