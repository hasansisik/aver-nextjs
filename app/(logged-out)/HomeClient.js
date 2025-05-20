'use client';

import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects } from "@/redux/actions/projectActions";
import { getBlogs } from "@/redux/actions/blogActions";
import { getServices } from "@/redux/actions/serviceActions";
import Banner from "@/app/_blocks/Banner";
import BlogCard from "@/app/_blocks/BlogCard";
import ProjectCard from "@/app/_blocks/ProjectCard";
import WorkProcess from "@/app/_blocks/WorkProcess";
import Image from "next/image";
import Link from "next/link";

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

// Custom CSS for 3D transform effects
const customStyles = {
  '.perspective-1000': {
    perspective: '1000px'
  },
  '.transform-style-3d': {
    transformStyle: 'preserve-3d'
  },
  '.backface-hidden': {
    backfaceVisibility: 'hidden'
  },
  '.service-card': {
    transition: 'all 0.3s ease',
    backgroundColor: '#f1f1f1',
    position: 'relative',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    height: 'auto'
  },
  '.service-card-wrapper': {
    margin: '0',
    padding: '0',
    position: 'relative'
  },
  '.service-card:hover': {
    zIndex: '30',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    transform: 'translateY(-5px)'
  },
  '.service-feature-list': {
    transition: 'all 0.35s ease-in-out',
    opacity: '0',
    height: '0',
    overflow: 'hidden',
    visibility: 'hidden',
    padding: '0'
  },
  '.service-card:hover .service-feature-list': {
    opacity: '1',
    height: 'auto',
    visibility: 'visible',
    padding: '1rem 0 0'
  },
  '.service-card-content': {
    height: 'auto',
    overflow: 'visible'
  },
  '.services-slider': {
    transition: 'transform 0.5s ease-in-out'
  },
  '.services-section': {
    position: 'relative',
    overflow: 'hidden',
    height: 'auto',
    minHeight: '600px'
  },
  '.services-container': {
    position: 'relative',
    zIndex: '1'
  },
  '@media (max-width: 768px)': {
    '.service-card': {
      marginBottom: '1.5rem'
    },
    '.service-feature-list': {
      opacity: '1',
      height: 'auto',
      overflow: 'visible',
      visibility: 'visible',
      padding: '1rem 0 0'
    }
  }
};

const HomeClient = ({ home, projectPage, blogPage, banner, featuredBy, workProcess }) => {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.project);
  const { blogs } = useSelector((state) => state.blog);
  const { services } = useSelector((state) => state.service);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const serviceSliderRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Calculate total number of slides
  const totalSlides = Math.ceil(services.length / 3);

  // Apply custom styles to document
  useEffect(() => {
    // Add custom styles to the document
    const styleElement = document.createElement('style');
    styleElement.textContent = Object.entries(customStyles)
      .map(([selector, styles]) => {
        const cssRules = Object.entries(styles)
          .map(([property, value]) => `${property}: ${value};`)
          .join(' ');
        return `${selector} { ${cssRules} }`;
      })
      .join('\n');
    document.head.appendChild(styleElement);

    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(styleElement);
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getBlogs());
    dispatch(getServices());
  }, [dispatch]);

  // Visible services (3 at a time)
  const visibleServices = () => {
    return [
      services[activeServiceIndex % services.length] || {},
      services[(activeServiceIndex + 1) % services.length] || {},
      services[(activeServiceIndex + 2) % services.length] || {}
    ];
  };

  const scrollServices = (direction) => {
    if (services.length === 0) return;
    if (direction === 'next') {
      setActiveServiceIndex((prev) => (prev + 3) % services.length);
    } else {
      setActiveServiceIndex((prev) => (prev - 3 + services.length) % services.length);
    }
  };

  // Get limited number of projects and blogs
  const limitedProjects = projects.slice(0, 5);
  const limitedBlogs = blogs.slice(0, 3);

  return (
    <>
      <Banner banner={banner} />

      {featuredBy.enable && (
        <section className="pt-28 lg:pb-10 overflow-hidden">
          <div className="container">
            <div className="row">
              <div className="col-12 mb-10">
                <h2
                  className="text-3xl font-secondary font-medium text-center"
                  data-aos="fade"
                >
                  {featuredBy.title}
                </h2>
              </div>
              <div className="col-12">
                <div className="flex justify-center items-center flex-wrap">
                  {featuredBy.brands_white.map((item, index) => (
                    <div
                      key={index}
                      className="mx-4 sm:mx-8 my-4"
                      data-aos="fade-left"
                      data-aos-delay={index * 50}
                    >
                      <Image
                        src={item}
                        alt="Brand"
                        width={120}
                        height={80}
                        className="w-auto h-auto sm:max-h-20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-28">
        <div className="container">
          <div className="row mb-16 items-end">
            <div className="sm:col-8 order-2 sm:order-1">
              <h2 className="text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center sm:text-left">
                {projectPage.frontMatter.title}
              </h2>
            </div>
            <div className="sm:col-4 order-1 sm:order-2 block mb-4 sm:mb-0 text-center sm:text-right">
              <span className="font-secondary text-2xl leading-none text-white/75">
                {projectPage.frontMatter.subtitle}
              </span>
            </div>
          </div>

          <div className="row md:gx-4 gy-4">
            {limitedProjects.map((project, i) => (
              <div
                key={project._id || i}
                className={`${i % 5 >= 3 ? "sm:col-6" : "lg:col-4 sm:col-6"} ${i === 4 ? "hidden lg:block" : ""}`}
              >
                <ProjectCard
                  index={i}
                  slug={project.slug}
                  frontMatter={{
                    title: project.title,
                    description: project.description,
                    image: project.image,
                    date: project.date || project.createdAt,
                    category: project.category,
                    color: project.color
                  }}
                  twoColumns={i % 5 >= 3}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link className="button" href="/project">
              <span>All Works</span>
            </Link>
          </div>
        </div>
      </section>

      <WorkProcess workProcess={workProcess} />

      {/* Services Section */}
      <section className="py-28 pb-20 bg-gray-100 text-dark services-section">
        <div className="container services-container" style={{minHeight: "700px"}}>
          <div className="row mb-16 items-end">
            <div className="sm:col-8 order-2 sm:order-1">
              <h2 className="text-black text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center sm:text-left">
                Services
              </h2>
            </div>
            <div className="sm:col-4 order-1 sm:order-2 block mb-4 sm:mb-0 text-center sm:text-right">
              <span className="font-secondary text-2xl leading-none text-black/75">
                What we offer
              </span>
            </div>
          </div>

          {/* Desktop View - Slider */}
          {!isMobile && (
            <div className="relative hidden md:block">
            <div className="flex justify-center items-center">
                {/* Left arrow for 3+ services */}
              {services.length > 3 && (
                <button 
                  onClick={() => scrollServices('prev')} 
                  className="absolute left-0 z-10 p-3 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  aria-label="Previous service"
                  disabled={services.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}
              
              <div className="row md:gx-4 mx-12 overflow-hidden" ref={serviceSliderRef}>
                <div 
                  className="services-slider flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${(activeServiceIndex / 3) * 100}%)` }}
                >
                  {services.length > 0 ? visibleServices().map((service, index) => (
                    <div key={service._id || index} className="lg:col-4 sm:col-4 px-4 flex-shrink-0">
                      <div className="service-card-wrapper">
                        <div className="relative service-card rounded-lg bg-white shadow-md h-auto overflow-visible">
                          {/* Card Content */}
                          <div className="p-8 flex flex-col service-card-content">
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
                            {/* Features List - Only visible on hover */}
                            <div className="service-feature-list">
                              <div className="border-t border-gray-200">
                                <ul className="space-y-0 pt-4">
                                  {service.features && service.features.map ? 
                                    service.features.map((feature, idx) => (
                                      <li key={idx}>
                                        <Link 
                                          href={`/${slugify(typeof feature === 'string' ? feature : feature.title)}`}
                                          onClick={() => {
                                            localStorage.setItem('selectedFeature', typeof feature === 'string' ? feature : feature.title);
                                            localStorage.setItem('featureServiceSlug', service.slug);
                                            localStorage.setItem('featureServiceTitle', service.title);
                                            localStorage.setItem('featureSlug', slugify(typeof feature === 'string' ? feature : feature.title));
                                          }}
                                          className="text-red-500 hover:underline block py-3"
                                        >
                                          {typeof feature === 'string' ? feature : feature.title}
                                        </Link>
                                        {idx < (service.features.length - 1) && (
                                          <div className="border-t border-gray-100"></div>
                                        )}
                                      </li>
                                    )) : (
                                    <li>
                                      <Link 
                                        href={`/${slugify(typeof feature === 'string' ? feature : feature.title)}`}
                                        onClick={() => {
                                          localStorage.setItem('selectedFeature', typeof feature === 'string' ? feature : feature.title);
                                          localStorage.setItem('featureServiceSlug', service.slug);
                                          localStorage.setItem('featureServiceTitle', service.title);
                                          localStorage.setItem('featureSlug', slugify(typeof feature === 'string' ? feature : feature.title));
                                        }}
                                        className="text-red-500 hover:underline block py-3"
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
                    </div>
                  )) : (
                    <div className="col-12 text-center py-8">
                      <p>Loading services...</p>
                    </div>
                  )}
                </div>
              </div>
              
                {/* Right arrow for 3+ services */}
              {services.length > 3 && (
                <button 
                  onClick={() => scrollServices('next')} 
                  className="absolute right-0 z-10 p-3 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  aria-label="Next service"
                  disabled={services.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              )}
            </div>

              {/* Dots for 3+ services */}
            {services.length > 3 && (
              <div className="flex justify-center mt-8">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveServiceIndex(index * 3)}
                    className={`w-3 h-3 mx-1 rounded-full transition-colors duration-300 ${
                      index === Math.floor(activeServiceIndex / 3)
                        ? 'bg-red-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
          )}

          {/* Mobile View - Vertical List */}
          {isMobile && (
            <div className="md:hidden">
              <div className="space-y-6">
                {services.length > 0 ? services.map((service, index) => (
                  <div key={service._id || index} className="service-card-wrapper">
                    <div className="service-card rounded-lg bg-white shadow-md overflow-hidden">
                      <div className="p-6 service-card-content">
                        <div className="flex items-center mb-4">
                          <Image 
                            src={service.icon || "/images/icons/default-service.svg"} 
                            alt={service.title || "Service"}
                            width={60} 
                            height={60}
                            className="mr-4"
                          />
                          <div>
                            <h3 className="text-2xl font-medium text-gray-800">
                              {service.title || "Service"}
                            </h3>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">
                          {service.description || "Service description"}
                        </p>
                        
                        {/* Features List - Always visible on mobile */}
                        <div className="service-feature-list">
                          <div className="border-t border-gray-200">
                            <ul className="space-y-0 pt-4">
                              {service.features && service.features.map ? 
                                service.features.map((feature, idx) => (
                                  <li key={idx}>
                                    <Link 
                                      href={`/${slugify(typeof feature === 'string' ? feature : feature.title)}`}
                                      onClick={() => {
                                        localStorage.setItem('selectedFeature', typeof feature === 'string' ? feature : feature.title);
                                        localStorage.setItem('featureServiceSlug', service.slug);
                                        localStorage.setItem('featureServiceTitle', service.title);
                                        localStorage.setItem('featureSlug', slugify(typeof feature === 'string' ? feature : feature.title));
                                      }}
                                      className="text-red-500 hover:underline block py-3"
                                    >
                                      {typeof feature === 'string' ? feature : feature.title}
                                    </Link>
                                    {idx < (service.features.length - 1) && (
                                      <div className="border-t border-gray-100"></div>
                                    )}
                                  </li>
                                )) : (
                                <li>
                                  <Link 
                                    href={`/${slugify(typeof feature === 'string' ? feature : feature.title)}`}
                                    onClick={() => {
                                      localStorage.setItem('selectedFeature', typeof feature === 'string' ? feature : feature.title);
                                      localStorage.setItem('featureServiceSlug', service.slug);
                                      localStorage.setItem('featureServiceTitle', service.title);
                                      localStorage.setItem('featureSlug', slugify(typeof feature === 'string' ? feature : feature.title));
                                    }}
                                    className="text-red-500 hover:underline block py-3"
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
                )) : (
                  <div className="text-center py-8">
                    <p>Loading services...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-28 bg-white text-dark rounded-b-2xl">
        <div className="container">
          <div className="row mb-16 items-end">
            <div className="sm:col-8 order-2 sm:order-1">
              <h2 className="text-black text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center sm:text-left">
                {blogPage.frontMatter.title}
              </h2>
            </div>
            <div className="sm:col-4 order-1 sm:order-2 block mb-4 sm:mb-0 text-center sm:text-right">
              <span className="font-secondary text-2xl leading-none text-black/75">
                {blogPage.frontMatter.subtitle}
              </span>
            </div>
          </div>

          <div className="row md:gx-4 gy-5">
            {limitedBlogs.map((blog, index) => (
              <div
                key={blog._id || index}
                className="lg:col-4 sm:col-6 init-delay"
                data-aos="fade-up-sm"
                data-aos-duration="500"
                style={{
                  "--lg-delay": `${(index % 3) * 75}ms`,
                  "--md-delay": `${(index % 2) * 75}ms`,
                  "--sm-delay": `${(index % 2) * 75}ms`
                }}
              >
                <BlogCard 
                  slug={blog.slug} 
                  frontMatter={{
                    title: blog.title,
                    description: blog.description,
                    image: blog.image,
                    date: blog.date || blog.createdAt,
                    category: blog.category,
                    author: blog.author
                  }} 
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link className="button button-dark" href="/blog">
              <span>All Posts</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomeClient; 