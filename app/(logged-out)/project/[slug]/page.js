"use client";

import Markdown from "@/app/_components/ReactMarkdown";
import siteConfig from "@/config/site.config.json";
import { formatDate } from "@/libs/utils/formatDate";
import Image from "next/image";
import Link from "next/link";
import { notFound } from 'next/navigation';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProjectBySlug, getProjects } from "@/redux/actions/projectActions";
import { useParams } from "next/navigation";

export default function ProjectPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const { currentProject, projects, loading, error } = useSelector((state) => state.project);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);
    
  // Fetch current project and all projects
  useEffect(() => {
    if (params.slug) {
      dispatch(getProjectBySlug(params.slug));
    }
    
    // Also fetch all projects to use for related projects
    dispatch(getProjects());
  }, [dispatch, params.slug]);
  
  useEffect(() => {
    setDebugInfo({ currentProject, loading, error });
    
    if (currentProject && projects && projects.length > 0) {
      // Filter out the current project and get up to 2 related projects
      const filteredProjects = projects.filter(project => project.slug !== params.slug);
      
      // If we have related projects, format them for display
      const formattedRelatedProjects = filteredProjects.slice(0, 2).map(project => ({
        slug: project.slug,
        frontMatter: {
          title: project.title,
          date: project.createdAt || project.date || new Date().toISOString(),
          image: project.image || 'https://via.placeholder.com/500',
          category: project.category || 'Design'
        }
      }));
      
      setRelatedProjects(formattedRelatedProjects);
    }
  }, [currentProject, projects, loading, error, params.slug]);

  if (loading) {
    return <div className="container py-20 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl mb-4">Error Loading Project</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl mb-4">Project Not Found</h2>
        <p>The project you&apos;re looking for could not be found.</p>
        <Link href="/project" className="inline-block mt-6 px-6 py-2 bg-blue-500 text-white rounded-md">
          Back to Projects
        </Link>
      </div>
    );
  }

  // Extract project data from the API response
  const title = currentProject.title;
  const date = currentProject.createdAt || currentProject.date || new Date().toISOString();
  const image = currentProject.image || 'https://via.placeholder.com/500';
  const description = currentProject.description || '';
  const category = currentProject.category || 'Design';
  const color = currentProject.color || '#67A94C';
  const projectInfo = currentProject.projectInfo || [];
  
  // Create content from project content blocks or markdown content
  let content;
  if (currentProject.markdownContent) {
    // If markdownContent exists, use it directly
    content = currentProject.markdownContent;
  } else if (currentProject.contentBlocks && currentProject.contentBlocks.length > 0) {
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
    content += currentProject.contentBlocks.map(block => {
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
          // Check if the content is a valid URL or has markdown syntax
          if (block.content.startsWith('http') || block.content.startsWith('/')) {
            // If it's just a URL, create proper markdown
            blockContent += `![](${block.content})`;
          } else {
            // Otherwise use the content as is (likely already formatted as markdown)
            blockContent += block.content;
          }
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
    content = `## ${title}\n\n${description || 'No content available for this project yet.'}`;
  }

  // Get Page Url
  const pageUrl = `${siteConfig.baseURL?.replace(/\/$|$/, "/") || window.location.origin}project/${params.slug || ''}`;

  // Get Next and Previous Project from related projects
  const previousProject = relatedProjects[0] || null;
  const nextProject = relatedProjects[1] || null;
  
  return (
    <>
      <section className="pt-24 pb-28">
        <div className="container">
          <div className="row justify-center banner">
            <div className="md:col-7 lg:col-6" data-aos="fade-up-sm">
              <div className="flex flex-wrap items-center mb-6 space-x-4">
                <span
                  className="inline-block text-sm rounded-full px-3 py-1 capitalize text-black"
                  style={{ backgroundColor: color + '20', color: color }}
                >
                  {category}
                </span>
                <span className="opacity-75 text-sm">{formatDate(date)}</span>
              </div>

              <h1 className="text-4xl md:text-5xl mb-4 !leading-tight">{title}</h1>
              <p>{description}</p>

              <ul className="row text-white mt-4">
                {projectInfo.map((item, index) => (
                  <li key={index} className="col-6 mt-8">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
                      {item.title}
                    </p>
                    <div className="[&_a]:underline [&_a]:hover:no-underline [&_li]:mt-1">
                      <Markdown content={item.data} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="md:col-5 lg:col-4 mt-12 md:mt-0"
              data-aos="fade-up-sm"
              data-aos-delay="100"
            >
              <Image
                className="aspect-square object-cover object-center rounded-lg bg-light/20 w-full md:w-[500px]"
                src={image}
                alt={title}
                width={500}
                height={500}
              />
            </div>

            <div className="xl:col-10">
              <hr className="opacity-5 mt-28 mb-24" />
            </div>
          </div>

          <div className="xl:col-10 lg:col-11 mx-auto" data-aos="fade-in">
            <article className="content content-light [&_img]:w-full">
              <Markdown content={content} />
            </article>
          </div>
        </div>
      </section>

      <section className="py-28 bg-white text-dark rounded-b-2xl overflow-hidden">
        <div className="container">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center">
              More Projects
            </h2>
          </div>
          <div className="row gy-2 sm:gy-4 justify-center">
            {previousProject && (
              <div className="xl:col-6 lg:col-8 md:col-10">
                <div className="relative group flex items-center z-10">
                  <div className="shrink-0 relative overflow-hidden rounded sm:rounded-lg h-[4.5rem] w-[4.5rem] sm:h-28 sm:w-28 self-start pointer-events-none">
                    <Image
                      src={previousProject.frontMatter.image}
                      alt={previousProject.frontMatter.title}
                      width={300}
                      height={300}
                      className="duration-500 group-hover:scale-110 group-hover:-rotate-1 object-cover w-full h-full rounded sm:rounded-lg group-hover:brightness-75 bg-light/20"
                    />
                  </div>
                  <div className="grow pl-4 sm:pl-7 transition-all duration-500 group-hover:opacity-60">
                    <span className="absolute right-0 sm:-right-1/4 top-0 leading-[0.65] text-[25vh] -z-10 opacity-[0.015] select-none">PREV</span>
                    <div className="flex flex-wrap items-center mb-4 space-x-5">
                      <span className="inline-block text-sm rounded-full bg-[#efefef] px-3 py-1 capitalize">
                        {previousProject.frontMatter.category}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-2xl leading-snug">
                      <Link
                        href={`/project/${previousProject.slug}`}
                        className="stretched-link"
                      >
                        {previousProject.frontMatter.title}
                      </Link>
                    </h3>
                  </div>
                </div>
              </div>
            )}
            <div className="lg:col-12"></div>
            {nextProject && (
              <div className="xl:col-6 lg:col-8 md:col-10">
                <div className="relative group flex items-center z-10">
                  <div className="grow pr-4 sm:pr-7 transition-all duration-500 group-hover:opacity-60">
                    <span className="absolute left-0 sm:-left-1/4 top-0 leading-[0.65] text-[25vh] -z-10 opacity-[0.015] select-none">NEXT</span>
                    <div className="flex flex-wrap items-center justify-end mb-4 space-x-5">
                      <span className="inline-block text-sm rounded-full bg-[#efefef] px-3 py-1 capitalize">
                        {nextProject.frontMatter.category}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-2xl leading-snug text-right">
                      <Link
                        href={`/project/${nextProject.slug}`}
                        className="stretched-link"
                      >
                        {nextProject.frontMatter.title}
                      </Link>
                    </h3>
                  </div>
                  <div className="shrink-0 relative overflow-hidden rounded sm:rounded-lg h-[4.5rem] w-[4.5rem] sm:h-28 sm:w-28 self-start pointer-events-none">
                    <Image
                      src={nextProject.frontMatter.image}
                      alt={nextProject.frontMatter.title}
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
    </>
  );
}