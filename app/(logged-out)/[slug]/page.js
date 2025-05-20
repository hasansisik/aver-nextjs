'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { getBlogBySlug } from "@/redux/actions/blogActions";
import { getProjectBySlug } from "@/redux/actions/projectActions";
import { getServiceBySlug } from "@/redux/actions/serviceActions";
import Image from "next/image";
import Link from "next/link";
import Markdown from "@/app/_components/ReactMarkdown";
import { formatDate } from "@/libs/utils/formatDate";

// Helper function to generate table of contents from markdown
function generateTableOfContents(markdown) {
  if (!markdown) return '';
  
  // Extract headings from markdown
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const slug = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    
    headings.push({ level, text, slug });
  }
  
  // Generate markdown for table of contents
  let toc = '';
  headings.forEach(({ level, text, slug }) => {
    const indent = '  '.repeat(level - 1);
    toc += `${indent}- [${text}](#${slug})\n`;
  });
  
  return toc;
}

export default function DynamicPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const { slug } = params;
  
  // Redux states
  const { currentBlog } = useSelector((state) => state.blog);
  const { currentProject } = useSelector((state) => state.project);
  const { currentService } = useSelector((state) => state.service);
  
  const [contentType, setContentType] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedFeatureContent, setSelectedFeatureContent] = useState(null);

  // Check for feature first
  useEffect(() => {
    const checkFeature = async () => {
      try {
        // Check localStorage for feature info
        const featureSlug = localStorage.getItem('featureSlug');
        const featureServiceSlug = localStorage.getItem('featureServiceSlug');
        const selectedFeatureTitle = localStorage.getItem('selectedFeature');
        
        if (featureSlug === slug && featureServiceSlug && selectedFeatureTitle) {
          // This is a service feature
          setContentType('feature');
          
          // Get the service details
          const response = await dispatch(getServiceBySlug(featureServiceSlug));
          
          if (response.payload) {
            const service = response.payload;
            
            // Find the feature in the service
            if (service.features && service.features.length > 0) {
              const feature = service.features.find(f => {
                const featureTitle = typeof f === 'string' ? f : f.title;
                return featureTitle === selectedFeatureTitle;
              });
              
              if (feature) {
                setSelectedFeature(selectedFeatureTitle);
                setSelectedFeatureContent(typeof feature === 'string' ? null : feature.content);
                setContent({
                  title: selectedFeatureTitle,
                  description: `Feature of ${service.title}`,
                  serviceTitle: service.title,
                  serviceSlug: service.slug,
                  icon: service.icon
                });
                setLoading(false);
                return true;
              }
            }
          }
        }
        return false;
      } catch (error) {
        console.error("Error checking for feature:", error);
        return false;
      }
    };
    
    const loadContent = async () => {
      try {
        // First check if it's a feature
        const isFeature = await checkFeature();
        if (isFeature) return;
        
        // Try to load as blog
        const blogResponse = await dispatch(getBlogBySlug(slug));
        if (blogResponse.payload && !blogResponse.error) {
          // It's a blog
          setContentType('blog');
          setContent(blogResponse.payload);
          setLoading(false);
          return;
        }
        
        // Try to load as project
        const projectResponse = await dispatch(getProjectBySlug(slug));
        if (projectResponse.payload && !projectResponse.error) {
          // It's a project
          setContentType('project');
          setContent(projectResponse.payload);
          setLoading(false);
          return;
        }
        
        // Not found
        setError("Content not found");
        setLoading(false);
      } catch (err) {
        console.error("Error loading content:", err);
        setError("Error loading content");
        setLoading(false);
      }
    };
    
    loadContent();
  }, [slug, dispatch]);

  if (loading) {
    return (
      <div className="container py-28">
        <div className="flex justify-center items-center min-h-[400px]">
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="container py-28">
        <div className="flex flex-col justify-center items-center min-h-[400px]">
          <h1 className="text-4xl mb-4">Content Not Found</h1>
          <p>{error || "The requested content could not be found."}</p>
          <Link href="/" className="button mt-8">
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  // Render based on content type
  switch (contentType) {
    case 'blog':
      return (
        <>
          <section className="pt-24 pb-28">
            <div className="container">
              <div className="row justify-center">
                <div className="lg:col-8 text-center banner mb-16" data-aos="fade-up-sm">
                  <div className="flex flex-wrap items-center justify-center mb-12 space-x-8">
                    {content.category && (
                      <span className="inline-block text-sm rounded-full bg-[#efefef] px-3 py-1 capitalize text-black">
                        {content.category}
                      </span>
                    )}
                    {content.date && (
                      <span className="opacity-75 text-sm">{formatDate(content.date)}</span>
                    )}
                  </div>

                  <h1 className="text-4xl md:text-5xl mb-4 !leading-tight">{content.title}</h1>
                  <p className="max-w-xl mx-auto">{content.description}</p>
                </div>

                {content.image && (
                  <div className="lg:col-10 mx-auto" data-aos="fade-up-sm" data-aos-delay="100">
                    <div className="h-[460px] bg-black/20 overflow-hidden relative z-10 rounded-lg">
                      <Image
                        className="w-auto h-[460px] object-cover object-center mx-auto z-10"
                        src={content.image}
                        alt={content.title}
                        width={1020}
                        height={460}
                      />
                      <Image
                        className="w-full h-[500px] object-cover filter blur-sm absolute top-0 left-0 -z-10 scale-110"
                        src={content.image}
                        alt={content.title}
                        width={100}
                        height={100}
                      />
                    </div>
                  </div>
                )}

                <div className="xl:col-9 lg:col-10 mx-auto" data-aos="fade-in">
                  <div className={`flex flex-wrap lg:flex-nowrap w-full ${content.image ? "pt-20" : ""}`}>
                    <div className="w-[60px] order-1 mr-6">
                      <div className="sticky top-8">
                        <div className="flex flex-col space-y-4">
                          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(content.title)}`} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                            </svg>
                          </a>
                          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                            </svg>
                          </a>
                          <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(content.title)}`} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                              <rect x="2" y="9" width="4" height="12"></rect>
                              <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 order-2">
                      <article className="content content-light">
                        <Markdown content={content.markdownContent || content.description} />
                      </article>
                    </div>

                    <div className="w-[250px] order-3 ml-8 hidden xl:block">
                      {content.markdownContent && (
                        <div className="sticky top-8">
                          <h3 className="text-lg font-semibold mb-4">Table of Contents</h3>
                          <div className="border-l border-white/20 pl-4">
                            <Markdown content={generateTableOfContents(content.markdownContent)} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      );
      
    case 'project':
      return (
        <>
          <section className="pt-24 pb-28">
            <div className="container">
              <div className="row justify-center banner">
                <div className="md:col-7 lg:col-6" data-aos="fade-up-sm">
                  <div className="flex flex-wrap items-center mb-6 space-x-4">
                    {content.category && (
                      <span
                        className="inline-block text-sm rounded-full px-3 py-1 capitalize text-black"
                        style={{ backgroundColor: content.color ? content.color + '20' : '#67A94C20', color: content.color || '#67A94C' }}
                      >
                        {content.category}
                      </span>
                    )}
                    {content.date && (
                      <span className="opacity-75 text-sm">{formatDate(content.date)}</span>
                    )}
                  </div>

                  <h1 className="text-4xl md:text-5xl mb-4 !leading-tight">{content.title}</h1>
                  <p>{content.description}</p>

                  {content.projectInfo && content.projectInfo.length > 0 && (
                    <ul className="row text-white mt-4">
                      {content.projectInfo.map((item, index) => (
                        <li key={index} className="col-6 mt-8">
                          <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
                            {item.title}
                          </p>
                          <div className="[&_a]:underline [&_a]:hover:no-underline [&_li]:mt-1">
                            <Markdown content={item.data} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                {content.image && (
                  <div
                    className="md:col-5 lg:col-4 mt-12 md:mt-0"
                    data-aos="fade-up-sm"
                    data-aos-delay="100"
                  >
                    <Image
                      className="aspect-square object-cover object-center rounded-lg bg-light/20 w-full md:w-[500px]"
                      src={content.image}
                      alt={content.title}
                      width={500}
                      height={500}
                    />
                  </div>
                )}

                <div className="xl:col-10">
                  <hr className="opacity-5 mt-28 mb-24" />
                </div>
                
                <div className="xl:col-10 lg:col-11 mx-auto" data-aos="fade-in">
                  <article className="content content-light [&_img]:w-full">
                    <Markdown content={content.markdownContent || content.description} />
                  </article>
                </div>
              </div>
            </div>
          </section>
        </>
      );
      
    case 'feature':
      return (
        <>
          <section className="pt-20 pb-20">
            <div className="container">
              <div className="row">
                <div className="col-12 mb-4">
                  <Link href="/" className="text-red-500 hover:underline flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                  </Link>
                </div>
                
                <div className="col-12">
                  <div className="service-header mb-10 md:mb-16">
                    <div className="flex items-center">
                      {content.icon && (
                        <Image 
                          src={content.icon}
                          alt={content.serviceTitle}
                          width={60}
                          height={60}
                          className="mr-4"
                        />
                      )}
                      <div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{content.title}</h1>
                        <p className="text-gray-500">
                          Feature of {content.serviceTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-12">
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    {selectedFeatureContent ? (
                      <Markdown content={selectedFeatureContent} />
                    ) : (
                      <div>
                        <p className="text-lg">Detailed information about {content.title}</p>
                        <div className="bg-gray-800 p-8 rounded-lg mt-8">
                          <h2 className="text-2xl mb-4">About this feature</h2>
                          <p>This is a detailed page about the {content.title} feature from our {content.serviceTitle} service.</p>
                          <p className="mt-4">For more information or to request this service, please contact us.</p>
                          
                          <Link href="/contact" className="button mt-8 inline-block">
                            <span>Contact Us</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      );
      
    default:
      return (
        <div className="container py-28">
          <div className="flex flex-col justify-center items-center min-h-[400px]">
            <h1 className="text-4xl mb-4">Content Not Found</h1>
            <p>The requested content could not be found.</p>
            <Link href="/" className="button mt-8">
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      );
  }
} 