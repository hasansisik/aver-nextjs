import siteConfig from "@/config/site.config.json";
import axios from "axios";
import { server } from "@/config";

export async function generateMetadata({ params }) {
  try {
    // Server-side fetch the blog data for metadata
    const { data } = await axios.get(`${server}/blog/${params.slug}`);
    const blog = data.blog;
    
    if (!blog) {
      return { 
        title: 'Blog Post Not Found' 
      };
    }
    
    return {
      title: blog.title,
      description: blog.description || siteConfig.metadata.description
    };
  } catch (error) {
    console.error("Error fetching blog data for metadata:", error);
    return { 
      title: 'Blog',
      description: siteConfig.metadata.description
    };
  }
}

export default function BlogPostLayout({ children }) {
  return children;
} 