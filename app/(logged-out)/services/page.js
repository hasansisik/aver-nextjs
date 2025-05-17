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
  // Use Redux store to dispatch and get services data
  await store.dispatch(getServices());
  const state = store.getState();
  
  const services = state.service.services || [];
  const totalServices = state.service.pagination.totalServices || services.length;
  
  const title = "Our Services";
  const subtitle = "What we offer";

  // Fall back to mock data if no services found and we're not loading
  let finalServices = services;
  
  if (services.length === 0 && !state.service.loading) {
    // Mock data as fallback
    finalServices = [
      {
        _id: "mock1",
        slug: "web-development",
        title: "Web Development",
        description: "We build custom websites tailored to your specific needs using modern technologies.",
        image: "/images/services/web-development.jpg",
        icon: "/images/icons/web-development.svg",
        features: [
          { title: "Content management systems" },
          { title: "Virtual shops and ecommerce" },
          { title: "Presentation websites" },
          { title: "Online catalogues" },
          { title: "Portal systems" }
        ],
        isPublished: true
      },
      {
        _id: "mock2",
        slug: "graphic-design",
        title: "Graphic Design",
        description: "We create visual content that communicates messages through typography, images, and colors.",
        image: "/images/services/graphic-design.jpg",
        icon: "/images/icons/graphic-design.svg",
        features: [
          { title: "Brand identity design" },
          { title: "Print materials design" },
          { title: "Digital design assets" },
          { title: "Packaging design" },
          { title: "Promotional materials" }
        ],
        isPublished: true
      },
      {
        _id: "mock3",
        slug: "internet-marketing",
        title: "Internet Marketing",
        description: "We help businesses reach their target audience online and drive meaningful results.",
        image: "/images/services/internet-marketing.jpg",
        icon: "/images/icons/internet-marketing.svg",
        features: [
          { title: "Search engine optimization (SEO)" },
          { title: "Pay-per-click advertising (PPC)" },
          { title: "Social media marketing" },
          { title: "Content marketing" },
          { title: "Email marketing campaigns" }
        ],
        isPublished: true
      }
    ];
  }

  return (
    <PageData 
      title={title}
      subtitle={subtitle}
      services={finalServices.filter(service => service.isPublished)}
      totalServices={totalServices}
    />
  );
} 