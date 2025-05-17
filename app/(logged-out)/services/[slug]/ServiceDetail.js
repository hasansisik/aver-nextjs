"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getServiceBySlug, getServices } from "@/redux/actions/serviceActions";
import { notFound } from 'next/navigation';
import ServiceClient from "./ServiceClient";
import { useParams } from "next/navigation";

export default function ServiceDetail() {
  const params = useParams();
  const dispatch = useDispatch();
  const { currentService, services, loading, error } = useSelector((state) => state.service);
  const [relatedServices, setRelatedServices] = useState([]);
  
  // Fetch current service and all services
  useEffect(() => {
    if (params.slug) {
      console.log("Dispatching getServiceBySlug with slug:", params.slug);
      dispatch(getServiceBySlug(params.slug));
    }
    
    // Also fetch all services to use for related services
    dispatch(getServices());
  }, [dispatch, params.slug]);
  
  useEffect(() => {
    if (currentService && services && services.length > 0) {
      // Filter out the current service and get up to 2 related services
      const filteredServices = services
        .filter(service => service.slug !== params.slug && service.isPublished)
        .slice(0, 2);
      
      setRelatedServices(filteredServices);
    }
  }, [currentService, services, params.slug]);

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
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{currentService.title}</h1>
                <p className="text-lg text-gray-500 max-w-3xl">{currentService.description}</p>
              </div>
            </div>
          </div>

          {currentService.image && (
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
            <div className="col-12 ">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ServiceClient markdownContent={currentService.markdownContent || ""} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedServices.length > 0 && (
        <section className="py-28 bg-white text-dark rounded-b-2xl">
          <div className="container">
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center">
                Related Services
              </h2>
            </div>
            <div className="row gy-4 md:gx-8 justify-center">
              {relatedServices.map((service) => (
                <div key={service.slug} className="lg:col-6">
                  <Link href={`/services/${service.slug}`} className="group">
                    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                      {service.image && (
                        <div className="shrink-0 relative overflow-hidden rounded-lg h-40 w-full md:h-32 md:w-40">
                          <Image
                            src={service.image}
                            alt={service.title}
                            fill
                            className="object-cover transition-all duration-500 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                        <p className="text-gray-600">{service.description}</p>
                        <div className="mt-3">
                          <span className="text-primary text-sm font-medium">Learn more →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
} 