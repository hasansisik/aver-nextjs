import { getServiceBySlug, getServices } from "@/redux/actions/serviceActions";
import { getProjectBySlug, getProjects } from "@/redux/actions/projectActions";
import { getBlogBySlug, getBlogs } from "@/redux/actions/blogActions";
import { store } from "@/redux/store";
import SlugClient from "./SlugClient";

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

// Function to find the content type and data for a given slug
async function findContentForSlug(slug) {
  try {
    // Try blog first
    await store.dispatch(getBlogBySlug(slug));
    let state = store.getState();
    if (state.blog.currentBlog && state.blog.currentBlog._id) {
      return {
        type: 'blog',
        data: state.blog.currentBlog
      };
    }
    
    // Try project next
    await store.dispatch(getProjectBySlug(slug));
    state = store.getState();
    if (state.project.currentProject && state.project.currentProject._id) {
      return {
        type: 'project',
        data: state.project.currentProject
      };
    }
    
    // Finally, check if it's a service
    await store.dispatch(getServiceBySlug(slug));
    state = store.getState();
    if (state.service.currentService && state.service.currentService._id) {
      return {
        type: 'service',
        data: state.service.currentService
      };
    }
    
    // Check if it's a service feature
    const serviceFeature = await findServiceWithFeature(slug);
    if (serviceFeature) {
      return {
        type: 'feature',
        data: serviceFeature.service,
        featureName: serviceFeature.featureName
      };
    }
    
    // Not found in any of our content types
    return null;
  } catch (error) {
    console.error("Error finding content for slug:", error);
    return null;
  }
}

// This function will try to find a service containing the requested feature
async function findServiceWithFeature(slug) {
  try {
    // Get all services first
    await store.dispatch(getServices());
    const state = store.getState();
    const services = state.service.services;
    
    // Convert slug format back to potential feature names
    const featureName = decodeURIComponent(slug)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()); // Basic title case conversion
    
    // Check each service to see if it contains this feature
    for (const service of services) {
      if (!service.features) continue;
      
      const hasFeature = service.features.some(f => {
        const title = typeof f === 'string' ? f : f.title;
        // Create various normalized versions for comparison
        const normalizedTitle = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const titleAsSlug = slugify(title);
        
        return normalizedTitle === featureName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || 
               titleAsSlug === slugify(slug) || 
               titleAsSlug.replace(/-/g, '') === slugify(slug).replace(/-/g, '');
      });
      
      if (hasFeature) {
        // Fetch full service details if we find a match
        await store.dispatch(getServiceBySlug(service.slug));
        const updatedState = store.getState();
        return {
          service: updatedState.service.currentService,
          featureName: featureName
        };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const contentData = await findContentForSlug(resolvedParams.slug);
  
  if (!contentData) {
    return {
      title: "Content Not Found",
      description: "The requested content could not be found",
    };
  }
  
  switch (contentData.type) {
    case 'blog':
      return {
        title: contentData.data.title || "Blog Post",
        description: contentData.data.description || "Read our latest blog post",
      };
    case 'project':
      return {
        title: contentData.data.title || "Project",
        description: contentData.data.description || "Check out our project",
      };
    case 'service':
      return {
        title: contentData.data.title || "Service",
        description: contentData.data.description || "Learn about our services",
      };
    case 'feature':
      return {
        title: `${contentData.featureName} | ${contentData.data.title}`,
        description: `Learn about ${contentData.featureName} - a feature of our ${contentData.data.title} service`,
      };
    default:
      return {
        title: "Content",
        description: "View our content",
      };
  }
}

export default async function SlugPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Try to find the content type for this slug
  const contentData = await findContentForSlug(slug);
  
  // Pass the content data to the client component
  if (contentData) {
    return (
      <SlugClient 
        slug={slug}
        contentType={contentData.type}
        initialData={contentData.data}
        featureName={contentData.featureName}
      />
    );
  }
  
  // If no content found, just pass the slug
  return <SlugClient slug={slug} />;
} 