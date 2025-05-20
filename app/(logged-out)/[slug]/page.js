import { getServiceBySlug } from "@/redux/actions/serviceActions";
import { getBlogBySlug } from "@/redux/actions/blogActions";
import { getProjectBySlug } from "@/redux/actions/projectActions";
import { store } from "@/redux/store";
import ServiceDetail from "../services/[slug]/ServiceDetail";
import BlogDetail from "../blog/[slug]/page";
import ProjectDetail from "../project/[slug]/page";
import { notFound } from 'next/navigation';

// Fetch service data for metadata
async function getServiceData(slug) {
  try {
    // Use Redux store to fetch service data
    await store.dispatch(getServiceBySlug(slug));
    const state = store.getState();
    
    return state.service.currentService;
  } catch (error) {
    console.error('Error fetching service data:', error);
    return null;
  }
}

// Fetch blog data for metadata
async function getBlogData(slug) {
  try {
    // Use Redux store to fetch blog data
    await store.dispatch(getBlogBySlug(slug));
    const state = store.getState();
    
    return state.blog.currentBlog;
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return null;
  }
}

// Fetch project data for metadata
async function getProjectData(slug) {
  try {
    // Use Redux store to fetch project data
    await store.dispatch(getProjectBySlug(slug));
    const state = store.getState();
    
    return state.project.currentProject;
  } catch (error) {
    console.error('Error fetching project data:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  // Await params before destructuring
  const resolvedParams = await params;
  
  // Try to get service data first
  const service = await getServiceData(resolvedParams.slug);
  
  if (service) {
    return {
      title: `${service.title} | Our Services`,
      description: service.description || "Professional service offered by our company",
    };
  }
  
  // If no service found, try to get blog data
  const blog = await getBlogData(resolvedParams.slug);
  
  if (blog) {
    return {
      title: `${blog.title} | Blog`,
      description: blog.description || "Latest insights and updates from our blog",
    };
  }
  
  // If no blog found, try to get project data
  const project = await getProjectData(resolvedParams.slug);
  
  if (project) {
    return {
      title: `${project.title} | Projects`,
      description: project.description || "Our latest work and projects",
    };
  }
  
  // If none found
  return {
    title: "Page Not Found",
    description: "The requested page could not be found",
  };
}

export default async function DynamicPage({ params }) {
  // Await params before destructuring
  const resolvedParams = await params;
  
  // Try to get service data first
  const service = await getServiceData(resolvedParams.slug);
  
  if (service) {
    // Return the service detail component
    return <ServiceDetail />;
  }
  
  // If no service found, try to get blog data
  const blog = await getBlogData(resolvedParams.slug);
  
  if (blog) {
    // Return the blog detail component
    return <BlogDetail />;
  }
  
  // If no blog found, try to get project data
  const project = await getProjectData(resolvedParams.slug);
  
  if (project) {
    // Return the project detail component
    return <ProjectDetail />;
  }
  
  // If none found, return 404
  return notFound();
} 