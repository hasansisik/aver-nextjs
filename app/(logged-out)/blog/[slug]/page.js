"use client";

import Markdown from "@/app/_components/ReactMarkdown";
import SharePost from "@/app/_components/SharePost";
import TableOfContents from "@/app/_components/TableOfContents";
import siteConfig from "@/config/site.config.json";
import { formatDate } from "@/libs/utils/formatDate";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBlogBySlug, getBlogs } from "@/redux/actions/blogActions";
import { useParams } from "next/navigation";

export default function BlogPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const { currentBlog, blogs, loading, error } = useSelector((state) => state.blog);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);
    
  // Fetch current blog and all blogs
  useEffect(() => {
    if (params.slug) {
      dispatch(getBlogBySlug(params.slug));
    }
    
    // Also fetch all blogs to use for related posts
    dispatch(getBlogs());
  }, [dispatch, params.slug]);
  
  useEffect(() => {
    setDebugInfo({ currentBlog, loading, error });
    
    if (currentBlog && blogs && blogs.length > 0) {
      // Filter out the current blog and get up to 2 related posts
      const filteredBlogs = blogs.filter(blog => blog.slug !== params.slug);
      
      // If we have related posts, format them for display
      const formattedRelatedPosts = filteredBlogs.slice(0, 2).map(blog => ({
        slug: blog.slug,
        frontMatter: {
          title: blog.title,
          date: blog.createdAt || blog.date || new Date().toISOString(),
          image: blog.image || 'https://via.placeholder.com/300',
          category: blog.category || 'General'
        }
      }));
      
      setRelatedPosts(formattedRelatedPosts);
    }
  }, [currentBlog, blogs, loading, error, params.slug]);

  if (loading) {
    return <div className="container py-20 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl mb-4">Error Loading Blog</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl mb-4">Blog Not Found</h2>
        <p>The blog post youre looking for could not be found.</p>
        <Link href="/blog" className="inline-block mt-6 px-6 py-2 bg-blue-500 text-white rounded-md">
          Back to Blog
        </Link>
      </div>
    );
  }

  // Extract blog data from the API response
  const title = currentBlog.title;
  const date = currentBlog.createdAt || currentBlog.date || new Date().toISOString();
  const image = currentBlog.image || 'https://via.placeholder.com/1020x460';
  const description = currentBlog.description || '';
  const category = currentBlog.category || 'General';
  const author = currentBlog.author || '';
  const subtitle = currentBlog.subtitle || '';
  
  // Create content from blog content blocks or markdown content
  let content;
  if (currentBlog.markdownContent) {
    // If markdownContent exists, use it directly
    content = currentBlog.markdownContent;
  } else if (currentBlog.contentBlocks && currentBlog.contentBlocks.length > 0) {
    // Add heading at the beginning for table of contents
    content = `## ${title}\n\n${description || ''}\n\n`;
    
    // Create section headings for each block type
    const blockTypeHeadings = {
      code: '## Code Example',
      list: '## List Items',
      quote: '## Quote',
      table: '## Table Data'
    };
    
    // Track which headings we've already used
    const usedHeadings = {};
    
    // Otherwise convert content blocks to markdown
    content += currentBlog.contentBlocks.map(block => {
      let blockContent = '';
      
      // Add heading for this block type if we haven't used it yet
      if (blockTypeHeadings[block.type] && !usedHeadings[block.type]) {
        blockContent += blockTypeHeadings[block.type] + '\n\n';
        usedHeadings[block.type] = true;
      }
      
      // Add the content based on block type
      switch(block.type) {
        case 'text':
          blockContent += block.content;
          break;
        case 'heading':
          blockContent += block.content;
          break;
        case 'image':
          blockContent += `![${block.metadata?.alt || 'Image'}](${block.content})`;
          break;
        case 'code':
          blockContent += `\`\`\`\n${block.content}\n\`\`\``;
          break;
        case 'quote':
          blockContent += `> ${block.content}`;
          break;
        case 'list':
          // Convert to unordered list
          const listItems = block.content.split('\n');
          blockContent += listItems.map(item => `* ${item}`).join('\n');
          break;
        case 'unordered-list':
          // Already in correct format
          blockContent += block.content;
          break;
        case 'ordered-list':
          // Already in correct format
          blockContent += block.content;
          break;
        case 'table':
          // Already in correct format
          blockContent += block.content;
          break;
        default:
          blockContent += block.content;
      }
      
      return blockContent;
    }).join('\n\n');
  } else {
    // Default content if no content blocks or markdown exists
    content = `## ${title}\n\n${description || 'No content available for this blog post yet.'}`;
  }

  // Get Page Url
  const pageUrl = `${siteConfig.baseURL?.replace(/\/$|$/, "/") || window.location.origin}${params.slug || ''}`;

  // Get Next and Previous Post from related posts
  const previousPost = relatedPosts[0] || null;
  const nextPost = relatedPosts[1] || null;
  
  return (
    <>
      <section className="pt-24 pb-28">
        <div className="container">
          <div className="row justify-center">
            <div className="lg:col-8 text-center banner mb-16" data-aos="fade-up-sm">
              <div className="flex flex-wrap items-center justify-center mb-12 space-x-8">
                <span className="inline-block text-sm rounded-full bg-[#efefef] px-3 py-1 capitalize text-black">
                  {category}
                </span>
                <span className="opacity-75 text-sm">{formatDate(date)}</span>
              </div>

              <h1 className="text-4xl md:text-5xl mb-4 !leading-tight">{title}</h1>
              <p className="max-w-xl mx-auto">{description}</p>
            </div>

            {image && (
              <div className="lg:col-10 mx-auto" data-aos="fade-up-sm" data-aos-delay="100">
                <div className="h-[460px] bg-black/20 overflow-hidden relative z-10 rounded-lg">
                  <Image
                    className="w-auto h-[460px] object-cover object-center mx-auto z-10"
                    src={image}
                    alt={title}
                    width={1020}
                    height={460}
                  />
                  <Image
                    className="w-full h-[500px] object-cover filter blur-sm absolute top-0 left-0 -z-10 scale-110"
                    src={image}
                    alt={title}
                    width={100}
                    height={100}
                  />
                </div>
              </div>
            )}

            <div className="xl:col-9 lg:col-10 mx-auto" data-aos="fade-in">
              <div className={`flex flex-wrap lg:flex-nowrap w-full ${image !== null ? "pt-20" : ""}`}>
                <div className="w-[60px] order-1 mr-6">
                  <div className="sticky top-8">
                    <SharePost title={title} pageUrl={pageUrl} />
                  </div>
                </div>

                <div className="flex-1 order-2">
                  <article className="content content-light">
                    <Markdown content={content} />
                  </article>
                </div>

                <div className="w-[250px] order-3 ml-8 hidden xl:block">
                  {content && <TableOfContents content={content} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(previousPost || nextPost) && (
        <section className="py-28 bg-white text-dark rounded-b-2xl overflow-hidden">
          <div className="container">
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center">
                Keep Reading
              </h2>
            </div>
            <div className="row gy-2 sm:gy-4 justify-center">
              {previousPost && (
                <div className="xl:col-6 lg:col-8 md:col-10">
                  <div className="relative group flex items-center z-10">
                    <div className="shrink-0 relative overflow-hidden rounded sm:rounded-lg h-[4.5rem] w-[4.5rem] sm:h-28 sm:w-28 self-start pointer-events-none">
                      <Image
                        src={previousPost.frontMatter.image}
                        alt={previousPost.frontMatter.title}
                        width={300}
                        height={300}
                        className="duration-500 group-hover:scale-110 group-hover:-rotate-1 object-cover w-full h-full rounded sm:rounded-lg group-hover:brightness-75 bg-light/20"
                      />
                    </div>
                    <div className="grow pl-4 sm:pl-7 transition-all duration-500 group-hover:opacity-60">
                      <span className="absolute right-0 sm:-right-1/4 top-0 leading-[0.65] text-[25vh] -z-10 opacity-[0.015] select-none">PREV</span>
                      <div className="flex flex-wrap items-center mb-4 space-x-5">
                        <span className="inline-block text-sm rounded-full bg-[#efefef] px-3 py-1 capitalize">
                          {previousPost.frontMatter.category}
                        </span>
                        <span className="opacity-75 text-sm">
                          {formatDate(previousPost.frontMatter.date)}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-2xl leading-snug">
                        <Link
                          href={`/${previousPost.slug}`}
                          className="stretched-link"
                        >
                          {previousPost.frontMatter.title}
                        </Link>
                      </h3>
                    </div>
                  </div>
                </div>
              )}
              <div className="lg:col-12"></div>
              {nextPost && (
                <div className="xl:col-6 lg:col-8 md:col-10">
                  <div className="relative group flex items-center z-10">
                    <div className="grow pr-4 sm:pr-7 transition-all duration-500 group-hover:opacity-60">
                      <span className="absolute left-0 sm:-left-1/4 top-0 leading-[0.65] text-[25vh] -z-10 opacity-[0.015] select-none">NEXT</span>
                      <div className="flex flex-wrap items-center justify-end mb-4 space-x-5">
                        <span className="opacity-75 text-sm">
                          {formatDate(nextPost.frontMatter.date)}
                        </span>
                        <span className="inline-block text-sm rounded-full bg-[#efefef] px-3 py-1 capitalize">
                          {nextPost.frontMatter.category}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-2xl leading-snug text-right">
                        <Link
                          href={`/${nextPost.slug}`}
                          className="stretched-link"
                        >
                          {nextPost.frontMatter.title}
                        </Link>
                      </h3>
                    </div>
                    <div className="shrink-0 relative overflow-hidden rounded sm:rounded-lg h-[4.5rem] w-[4.5rem] sm:h-28 sm:w-28 self-start pointer-events-none">
                      <Image
                        src={nextPost.frontMatter.image}
                        alt={nextPost.frontMatter.title}
                        width={300}
                        height={300}
                        className="duration-500 group-hover:scale-110 group-hover:-rotate-1 object-cover w-full h-full rounded sm:rounded-lg group-hover:brightness-75 bg-light/20"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}