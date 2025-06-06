import { getServiceBySlug } from "@/redux/actions/serviceActions";
import { store } from "@/redux/store";
import ServiceDetail from "./ServiceDetail";
import { redirect } from "next/navigation";

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
  // Await params before destructuring
  const resolvedParams = await params;
  const service = await getServiceData(resolvedParams.slug);
  
  if (!service) {
    return {
      title: "Service Not Found | Our Services",
      description: "The requested service could not be found",
    };
  }
  
  return {
    title: `${service.title} | Our Services`,
    description: service.description || "Professional service offered by our company",
  };
}

export default async function ServicePage({ params, searchParams }) {
  // Check if there's a feature parameter in the URL or hash
  // If not, redirect to the services page
  if (!searchParams?.feature && !params?.feature) {
    redirect('/services');
  }
  
  return <ServiceDetail />;
} 