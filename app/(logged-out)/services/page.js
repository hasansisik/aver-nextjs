import { getServices } from "@/redux/actions/serviceActions";
import { store } from "@/redux/store";
import PageData from "./PageData";

// Server-side data fetching for services using Redux
export async function generateMetadata() {
  return {
    title: "Services | Our Professional Solutions",
    description: "Explore our range of professional services designed to help your business grow.",
  };
}

export default async function ServicesPage() {
  // Pre-fetch services data on the server side for initial load
  // Client will refresh this data when component mounts
  await store.dispatch(getServices());
  
  const title = "Our Services";
  const subtitle = "What we offer";

  return (
    <PageData 
      title={title}
      subtitle={subtitle}
    />
  );
} 