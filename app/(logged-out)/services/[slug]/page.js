import { getServiceBySlug } from "@/redux/actions/serviceActions";
import { store } from "@/redux/store";
import ServiceDetail from "./ServiceDetail";

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

export async function generateMetadata({ params, searchParams }) {
  const service = await getServiceData(params.slug);
  const feature = searchParams?.feature;
  
  if (!service) {
    return {
      title: "Service Not Found | Our Services",
      description: "The requested service could not be found",
    };
  }
  
  return {
    title: feature 
      ? `${feature} - ${service.title} | Our Services`
      : `${service.title} | Our Services`,
    description: service.description || "Professional service offered by our company",
  };
}

export default async function ServicePage({ params, searchParams }) {
  return <ServiceDetail selectedFeature={searchParams?.feature} />;
} 