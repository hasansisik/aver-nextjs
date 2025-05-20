import { getServiceBySlug } from "@/redux/actions/serviceActions";
import { store } from "@/redux/store";
import ServiceDetail from "../services/[slug]/ServiceDetail";
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

export async function generateMetadata({ params }) {
  const service = await getServiceData(params.slug);
  
  if (!service) {
    return {
      title: "Page Not Found",
      description: "The requested page could not be found",
    };
  }
  
  return {
    title: `${service.title} | Our Services`,
    description: service.description || "Professional service offered by our company",
  };
}

export default async function ServicePage({ params }) {
  const service = await getServiceData(params.slug);
  
  // If no service found, return 404
  if (!service) {
    return notFound();
  }
  
  // Return the client component that handles state on its own
  return <ServiceDetail />;
} 