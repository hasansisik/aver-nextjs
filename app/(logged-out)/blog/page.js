import { getDirectoryPages } from "@/libs/getDirectoryPages";
import { getSinglePage } from "@/libs/getSinglePage";
import PageData from "./PageData";

const getBlogData = async () => {
  const blogPage = getSinglePage("content/blog/_index.md")
  const blogPosts = getDirectoryPages("content/blog")
  return { blogPage, blogPosts }
}

export const generateMetadata = async () => {
  const { blogPage } = await getBlogData()
  return {
    title: blogPage.frontMatter.title,
    description: blogPage.frontMatter.subtitle,
  }
}

const BlogPage = async () => {
  const { blogPage, blogPosts } = await getBlogData();
  const totalPosts = blogPosts.length
  let { title, subtitle } = blogPage.frontMatter

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