"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getServiceBySlug, getServices } from "@/redux/actions/serviceActions";
import { getProjectBySlug, getProjects } from "@/redux/actions/projectActions";
import { getBlogBySlug, getBlogs } from "@/redux/actions/blogActions";
import { useParams } from "next/navigation";
import Markdown from "@/app/_components/ReactMarkdown";
import SharePost from "@/app/_components/SharePost";
import TableOfContents from "@/app/_components/TableOfContents";
import ServiceClient from "@/app/(logged-out)/services/[slug]/ServiceClient";
import { formatDate } from "@/libs/utils/formatDate";
import siteConfig from "@/config/site.config.json";

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

export default function SlugClient({ slug, contentType, initialData, featureName }) {
  const params = useParams();
  const dispatch = useDispatch();
  
  // State for all content types
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState(null);
  
  // Blog states
  const { currentBlog, blogs, loading: blogLoading, error: blogError } = useSelector((state) => state.blog);
  const [relatedPosts, setRelatedPosts] = useState([]);
  
  // Project states
  const { currentProject, projects, loading: projectLoading, error: projectError } = useSelector((state) => state.project);
  const [relatedProjects, setRelatedProjects] = useState([]);
  
  // Service states
  const { currentService, services, loading: serviceLoading, error: serviceError } = useSelector((state) => state.service);
  const [featureTitle, setFeatureTitle] = useState(featureName || "");
  const [featureContent, setFeatureContent] = useState("");
  const [serviceData, setServiceData] = useState(null);
  
  // Combined loading and error states
  useEffect(() => {
    setContentLoading(blogLoading || projectLoading || serviceLoading);
    setContentError(blogError || projectError || serviceError);
  }, [blogLoading, projectLoading, serviceLoading, blogError, projectError, serviceError]);
  
  // Fetch data based on content type
  useEffect(() => {
    if (!contentType || !initialData) return;
    
    const fetchRelatedContent = async () => {
      switch(contentType) {
        case 'blog':
          dispatch(getBlogBySlug(slug));
          dispatch(getBlogs());
          break;
        case 'project':
          dispatch(getProjectBySlug(slug));
          dispatch(getProjects());
          break;
        case 'service':
          dispatch(getServiceBySlug(slug));
          setServiceData(initialData);
          break;
        case 'feature':
          if (initialData && initialData.slug) {
            dispatch(getServiceBySlug(initialData.slug));
            setServiceData(initialData);
            if (featureName) {
              setFeatureTitle(featureName);
            }
          }
          break;
      }
    };
    
    fetchRelatedContent();
  }, [contentType, initialData, slug, dispatch, featureName]);
  
  // Set up related blog posts
  useEffect(() => {
    if (contentType === 'blog' && currentBlog && blogs && blogs.length > 0) {
      // Filter out the current blog and get up to 2 related posts
      const filteredBlogs = blogs.filter(blog => blog.slug !== slug);
      
      // Format related posts data
      const formattedRelatedPosts = filteredBlogs.slice(0, 2).map(blog => ({
        slug: blog.slug,
        frontMatter: {
          title: blog.title,
          date: blog.createdAt || blog.date || new Date().toISOString(),
          image: blog.image || 'https://via.placeholder.com/300',
          category: blog.category || 'General'
        }
      }));
      
      setRelatedPosts(formattedRelatedPosts);
    }
  }, [contentType, currentBlog, blogs, slug]);
  
  // Set up related projects
  useEffect(() => {
    if (contentType === 'project' && currentProject && projects && projects.length > 0) {
      // Filter out the current project and get up to 2 related projects
      const filteredProjects = projects.filter(project => project.slug !== slug);
      
      // Format related projects data
      const formattedRelatedProjects = filteredProjects.slice(0, 2).map(project => ({
        slug: project.slug,
        frontMatter: {
          title: project.title,
          date: project.createdAt || project.date || new Date().toISOString(),
          image: project.image || 'https://via.placeholder.com/500',
          category: project.category || 'Design'
        }
      }));
      
      setRelatedProjects(formattedRelatedProjects);
    }
  }, [contentType, currentProject, projects, slug]);
  
  // Handle service feature content
  useEffect(() => {
    if (contentType === 'feature' && currentService && featureTitle) {
      // Find the selected feature's content
      if (currentService.features) {
        const feature = currentService.features.find(f => {
          const title = typeof f === 'string' ? f : f.title;
          return title === featureTitle;
        });
        
        if (feature) {
          setFeatureContent(typeof feature === 'string' ? null : feature.content);
        }
      }
    }
  }, [contentType, currentService, featureTitle]);
  
  // Effect to find the feature in services when no initial data is provided
  useEffect(() => {
    if (contentType !== 'feature' || initialData || !services || services.length === 0 || serviceData) {
      return;
    }
    
    const findServiceWithFeature = () => {
      // If we don't have a feature title yet, derive it from the slug
      const searchFeatureTitle = featureTitle || decodeURIComponent(slug)
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
          const slugified = slugify(slug);
          const searchSlug = searchFeatureTitle ? slugify(searchFeatureTitle) : '';
          
          return titleSlug === slugified || 
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
  }, [contentType, services, slug, featureTitle, dispatch, serviceData, initialData]);
  
  // Effect for legacy support - trying to find feature using localStorage
  useEffect(() => {
    // Only run if no content type detected
    if (contentType || serviceData) {
      return;
    }
    
    const findFeatureFromLocalStorage = async () => {
      try {
        // Try getting the service slug from localStorage
        const storedServiceSlug = localStorage.getItem('featureServiceSlug');
        const storedFeature = localStorage.getItem('selectedFeature');
        
        // Verify if the stored feature slug matches the current URL
        const storedFeatureSlug = localStorage.getItem('featureSlug');
        const isStoredFeatureMatchingUrl = storedFeatureSlug && 
          (storedFeatureSlug === slug || storedFeatureSlug.toLowerCase() === slug.toLowerCase());
        
        // If we have a stored service slug and the feature matches the URL
        if (storedServiceSlug && (isStoredFeatureMatchingUrl || !storedFeatureSlug)) {
          await dispatch(getServiceBySlug(storedServiceSlug));
          
          // If we also have a stored feature, use that
          if (storedFeature) {
            setFeatureTitle(storedFeature);
          } else {
            // Otherwise derive it from the slug
            const derivedFeature = decodeURIComponent(slug)
              .replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase()); // Convert to title case
            setFeatureTitle(derivedFeature);
          }
          
          // Don't clear localStorage here - let the component fully render first
        } else {
          // If no localStorage match, fetch all services to search
          await dispatch(getServices());
        }
      } catch (error) {
        // Silently handle errors
      }
    };
    
    findFeatureFromLocalStorage();
  }, [contentType, dispatch, slug, serviceData]);
  
  // Effect to clean up localStorage when any content is successfully loaded
  useEffect(() => {
    if (contentType && (currentBlog || currentProject || currentService || serviceData)) {
      // Only clear localStorage if we've successfully rendered any content
      try {
        localStorage.removeItem('featureServiceSlug');
        localStorage.removeItem('selectedFeature');
        localStorage.removeItem('featureServiceTitle');
        localStorage.removeItem('featureSlug');
      } catch (error) {
        // Silently handle errors accessing localStorage
      }
    }
  }, [contentType, currentBlog, currentProject, currentService, serviceData]);
  
  if (contentLoading) {
    return <div className="container py-20 text-center">Loading...</div>;
  }
  
  if (contentError) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl mb-4">Error Loading Content</h2>
        <p className="text-red-500">{contentError}</p>
      </div>
    );
  }
  
  // Content type specific rendering
  if (contentType === 'blog' && currentBlog) {
    // Extract blog data
    const title = currentBlog.title;
    const date = currentBlog.createdAt || currentBlog.date || new Date().toISOString();
    const image = currentBlog.image || 'https://via.placeholder.com/1020x460';
    const description = currentBlog.description || '';
    const category = currentBlog.category || 'General';
    
    // Create content from blog content blocks or markdown content
    let content;
    if (currentBlog.markdownContent) {
      content = currentBlog.markdownContent;
    } else if (currentBlog.contentBlocks && currentBlog.contentBlocks.length > 0) {
      content = `## ${title}\n\n${description || ''}\n\n`;
      
      // Create section headings for each block type
      const blockTypeHeadings = {
        code: '## Code Example',
        list: '## List Items',
        quote: '## Quote',
        table: '## Table Data'
      };
      
      // Track which headings we've already used
      const usedHeadings = {};
      
      content += currentBlog.contentBlocks.map(block => {
        let blockContent = '';
        
        if (blockTypeHeadings[block.type] && !usedHeadings[block.type]) {
          blockContent += blockTypeHeadings[block.type] + '\n\n';
          usedHeadings[block.type] = true;
        }
        
        // Add the content based on block type
        switch(block.type) {
          case 'text':
            blockContent += block.content;
            break;
          case 'heading':
            blockContent += block.content;
            break;
          case 'image':
            blockContent += `![${block.metadata?.alt || 'Image'}](${block.content})`;
            break;
          case 'code':
            blockContent += `\`\`\`\n${block.content}\n\`\`\``;
            break;
          case 'quote':
            blockContent += `> ${block.content}`;
            break;
          case 'list':
            // Convert to unordered list
            const listItems = block.content.split('\n');
            blockContent += listItems.map(item => `* ${item}`).join('\n');
            break;
          case 'unordered-list':
            blockContent += block.content;
            break;
          case 'ordered-list':
            blockContent += block.content;
            break;
          case 'table':
            blockContent += block.content;
            break;
          default:
            blockContent += block.content;
        }
        
        return blockContent;
      }).join('\n\n');
    } else {
      content = `## ${title}\n\n${description || 'No content available for this blog post yet.'}`;
    }
    
    // Get Page Url
    const pageUrl = `${siteConfig.baseURL?.replace(/\/$|$/, "/") || window.location.origin}${slug || ''}`;
    
    // Get Next and Previous Post from related posts
    const previousPost = relatedPosts[0] || null;
    const nextPost = relatedPosts[1] || null;
    
    return (
      <>
        <section className="pt-24 pb-28">
          <div className="container">
            <div className="row justify-center">
              <div className="lg:col-8 text-center banner mb-16" data-aos="fade-up-sm">
                <div className="flex flex-wrap items-center justify-center mb-12 space-x-8">
                  <span className="inline-block text-sm rounded-full bg-[#efefef] px-3 py-1 capitalize text-black">
                    {category}
                  </span>
                  <span className="opacity-75 text-sm">{formatDate(date)}</span>
                </div>

                <h1 className="text-4xl md:text-5xl mb-4 !leading-tight">{title}</h1>
                <p className="max-w-xl mx-auto">{description}</p>
              </div>

              {image && (
                <div className="lg:col-10 mx-auto" data-aos="fade-up-sm" data-aos-delay="100">
                  <div className="h-[460px] bg-black/20 overflow-hidden relative z-10 rounded-lg">
                    <Image
                      className="w-auto h-[460px] object-cover object-center mx-auto z-10"
                      src={image}
                      alt={title}
                      width={1020}
                      height={460}
                    />
                    <Image
                      className="w-full h-[500px] object-cover filter blur-sm absolute top-0 left-0 -z-10 scale-110"
                      src={image}
                      alt={title}
                      width={100}
                      height={100}
                    />
                  </div>
                </div>
              )}

              <div className="xl:col-9 lg:col-10 mx-auto" data-aos="fade-in">
                <div className={`flex flex-wrap lg:flex-nowrap w-full ${image !== null ? "pt-20" : ""}`}>
                  <div className="w-[60px] order-1 mr-6">
                    <div className="sticky top-8">
                      <SharePost title={title} pageUrl={pageUrl} />
                    </div>
                  </div>

                  <div className="flex-1 order-2">
                    <article className="content content-light">
                      <Markdown content={content} />
                    </article>
                  </div>

                  <div className="w-[250px] order-3 ml-8 hidden xl:block">
                    {content && <TableOfContents content={content} />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {(previousPost || nextPost) && (
          <section className="py-28 bg-white text-dark rounded-b-2xl overflow-hidden">
            <div className="container">
              <div className="mb-20">
                <h2 className="text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center">
                  Keep Reading
                </h2>
              </div>
              <div className="row gy-2 sm:gy-4 justify-center">
                {previousPost && (
                  <div className="xl:col-6 lg:col-8 md:col-10">
                    <div className="relative group flex items-center z-10">
                      <div className="shrink-0 relative overflow-hidden rounded sm:rounded-lg h-[4.5rem] w-[4.5rem] sm:h-28 sm:w-28 self-start pointer-events-none">
                        <Image
                          src={previousPost.frontMatter.image}
                          alt={previousPost.frontMatter.title}
                          width={300}
                          height={300}
                          className="duration-500 group-hover:scale-110 group-hover:-rotate-1 object-cover w-full h-full rounded sm:rounded-lg group-hover:brightness-75 bg-light/20"
                        />
                      </div>
                      <div className="grow pl-4 sm:pl-7 transition-all duration-500 group-hover:opacity-60">
                        <span className="absolute right-0 sm:-right-1/4 top-0 leading-[0.65] text-[25vh] -z-10 opacity-[0.015] select-none">PREV</span>
                        <div className="flex flex-wrap items-center mb-4 space-x-5">
                          <span className="inline-block text-sm rounded-full bg-[#efefef] px-3 py-1 capitalize">
                            {previousPost.frontMatter.category}
                          </span>
                          <span className="opacity-75 text-sm">
                            {formatDate(previousPost.frontMatter.date)}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-2xl leading-snug">
                          <Link
                            href={`/${previousPost.slug}`}
                            className="stretched-link"
                          >
                            {previousPost.frontMatter.title}
                          </Link>
                        </h3>
                      </div>
                    </div>
                  </div>
                )}
                <div className="lg:col-12"></div>
                {nextPost && (
                  <div className="xl:col-6 lg:col-8 md:col-10">
                    {/* Similar structure to previousPost */}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </>
    );
  }
  
  // Project content
  else if (contentType === 'project' && currentProject) {
    // Extract project data
    const title = currentProject.title;
    const date = currentProject.createdAt || currentProject.date || new Date().toISOString();
    const image = currentProject.image || 'https://via.placeholder.com/500';
    const description = currentProject.description || '';
    const category = currentProject.category || 'Design';
    const color = currentProject.color || '#67A94C';
    const projectInfo = currentProject.projectInfo || [];
    
    // Create content from project content blocks or markdown content
    let content;
    if (currentProject.markdownContent) {
      content = currentProject.markdownContent;
    } else if (currentProject.contentBlocks && currentProject.contentBlocks.length > 0) {
      // Similar logic as blog content
      content = `## ${title}\n\n${description || ''}\n\n`;
      // Process content blocks...
    } else {
      content = `## ${title}\n\n${description || 'No content available for this project yet.'}`;
    }
    
    // Get Page Url
    const pageUrl = `${siteConfig.baseURL?.replace(/\/$|$/, "/") || window.location.origin}${slug || ''}`;
    
    return (
      <>
        <section className="pt-24 pb-28">
          <div className="container">
            <div className="row justify-center banner">
              <div className="md:col-7 lg:col-6" data-aos="fade-up-sm">
                <div className="flex flex-wrap items-center mb-6 space-x-4">
                  <span
                    className="inline-block text-sm rounded-full px-3 py-1 capitalize text-black"
                    style={{ backgroundColor: color + '20', color: color }}
                  >
                    {category}
                  </span>
                  <span className="opacity-75 text-sm">{formatDate(date)}</span>
                </div>

                <h1 className="text-4xl md:text-5xl mb-4 !leading-tight">{title}</h1>
                <p>{description}</p>

                {projectInfo.length > 0 && (
                  <ul className="row text-white mt-4">
                    {projectInfo.map((item, index) => (
                      <li key={index} className="col-6 mt-8">
                        <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
                          {item.title}
                        </p>
                        <p>{item.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {image && (
                <div className="lg:col-6 md:col-5 text-center mt-10 md:mt-0" data-aos="fade-up-sm" data-aos-delay="100">
                  <div className="h-[400px] bg-black/20 overflow-hidden relative z-10 rounded-lg">
                    <Image
                      className="w-auto h-[400px] object-cover object-center mx-auto z-10"
                      src={image}
                      alt={title}
                      width={500}
                      height={400}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="row mt-20">
              <div className="xl:col-9 lg:col-10 mx-auto" data-aos="fade-in">
                <article className="content content-light">
                  <Markdown content={content} />
                </article>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
  
  // Service or feature content
  else if ((contentType === 'service' && currentService) || 
           (contentType === 'feature' && serviceData) ||
           (!contentType && serviceData)) {
    return (
      <>
        <section className="pt-20 pb-20">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="service-header mb-10 md:mb-16">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                    {contentType === 'feature' || featureTitle ? featureTitle : (currentService?.title || serviceData?.title)}
                  </h1>
                  <p className="text-lg text-gray-500 max-w-3xl">
                    {contentType === 'feature' || featureTitle ? 
                      `Feature of ${currentService?.title || serviceData?.title}` : 
                      (currentService?.description || serviceData?.description)}
                  </p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <ServiceClient markdownContent={
                    contentType === 'feature' || featureTitle ? 
                      (featureContent || "") : 
                      (currentService?.markdownContent || serviceData?.markdownContent || "")
                  } />
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
  
  // If no matching content found
  return (
    <div className="container py-20 text-center">
      <h2 className="text-2xl mb-4">Content Not Found</h2>
      <p>The content you&apos;re looking for could not be found.</p>
      <div className="mt-6 flex justify-center space-x-4">
        <Link href="/blog" className="inline-block px-6 py-2 bg-white text-black rounded-md">
          Browse Blogs
        </Link>
        <Link href="/project" className="inline-block px-6 py-2 bg-white text-black rounded-md">
          Browse Projects
        </Link>
        <Link href="/services" className="inline-block px-6 py-2 bg-white text-black rounded-md">
          Browse Services
        </Link>
      </div>
    </div>
  );
} 