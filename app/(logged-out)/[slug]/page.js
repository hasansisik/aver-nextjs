import { getServiceBySlug, getServices } from "@/redux/actions/serviceActions";
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
  const result = await findServiceWithFeature(resolvedParams.slug);
  
  if (!result) {
    return {
      title: "Feature Not Found",
      description: "The requested feature could not be found",
    };
  }
  
  return {
    title: `${result.featureName} | ${result.service.title}`,
    description: `Learn about ${result.featureName} - a feature of our ${result.service.title} service`,
  };
}

export default async function SlugPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Try to find the feature before rendering the client component
  const result = await findServiceWithFeature(slug);
  
  // Pass the slug and found service data (if any) to the client component
  if (result) {
    return (
      <SlugClient 
        slug={slug} 
        initialServiceData={{
          id: result.service._id,
          slug: result.service.slug,
          title: result.service.title,
          featureName: result.featureName
        }} 
      />
    );
  }
  
  // If no service found, just pass the slug
  return <SlugClient slug={slug} />;
} 