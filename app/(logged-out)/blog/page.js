import axios from "axios";
import { server } from "@/config";
import PageData from "./PageData";

// Server-side data fetching for metadata and initial data
const getBlogData = async () => {
  try {
    const { data } = await axios.get(`${server}/blog`);
    return { 
      blogPosts: data.blogs.map(blog => ({
        slug: blog.slug,
        frontMatter: {
          title: blog.title,
          subtitle: blog.description,
          date: blog.createdAt || blog.date,
          image: blog.image,
          category: blog.category || 'General',
          tags: blog.tags || []
        }
      }))
    };
  } catch (error) {
    console.error("Error fetching blog data:", error);
    return { blogPosts: [] };
  }
}

export const generateMetadata = async () => {
  return {
    title: "Blog",
    description: "Latest articles and updates from our team",
  }
}

const BlogPage = async () => {
  const { blogPosts } = await getBlogData();
  const totalPosts = blogPosts.length;
  const title = "Our Blog";
  const subtitle = "Latest articles and updates";

  return (
    <PageData 
      title={title}
      subtitle={subtitle}
      blogPosts={blogPosts}
      totalPosts={totalPosts}
    />
  )
}

export default BlogPage;