"use client";

import PageHeader from "@/components/PageHeader";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const ProjectCard = ({ project }) => {
  const {
    slug,
    title,
    description,
    image,
    color = "#67A94C",
    category = "Project"
  } = project;

  return (
    <div
      data-aos
      className="rounded-lg overflow-hidden relative group h-full"
    >
      <span
        className="absolute h-full group-[.aos-animate]:h-0 w-full z-30 duration-700 left-0 bottom-0"
        style={{ backgroundColor: color, transitionDelay: "100ms" }}
      ></span>
      <Image
        src={image || "/images/placeholder.jpg"}
        alt={title}
        width={520}
        height={550}
        className="scale-150 group-[.aos-animate]:scale-100 duration-700 group-hover:!scale-125 object-cover w-full h-full bg-light/20"
      />
      <div className="absolute inset-0 z-20 flex justify-center flex-col p-8">
        <span className="absolute h-full w-full duration-300 left-0 bottom-0 opacity-0 bg-overlay group-hover:opacity-100 -z-10 pointer-events-none"></span>

        <div className="flex items-center justify-between opacity-0 -mt-1 group-hover:opacity-100 group-hover:mt-0 duration-300 group-hover:delay-300">
          <span className="uppercase text-white bg-white/25 text-sm font-light tracking-wider px-3 py-1 rounded-full backdrop-blur-lg">
            {category}
          </span>
          <Link href={`/${slug}`} className="stretched-link">
            <Image
              className="inline-block rotate-[135deg]"
              src="/images/arrow-right.svg"
              alt="arrow"
              height={22}
              width={25}
            />
          </Link>
        </div>
        <div className="text-center mt-auto">
          <h3 className="text-4xl font-secondary font-semibold text-white mb-2 relative overflow-hidden">
            <span className="block translate-y-full group-hover:translate-y-0 duration-300">
              {title}
            </span>
          </h3>
          <p className="text-white font-light relative overflow-hidden">
            <span className="block translate-y-full group-hover:translate-y-0 duration-300 group-hover:delay-150">
              {description}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

const PageData = ({ title, subtitle, allProjects, totalProjects }) => {
  const projectsToShow = 6;
  const [displayedCount, setDisplayedCount] = useState(projectsToShow);
  const [loadMore, setLoadMore] = useState(totalProjects > projectsToShow);

  // Create a normalized list of projects with consistent structure
  const normalizedProjects = allProjects.map(project => ({
    _id: project._id || '',
    title: project.title || '',
    description: project.description || '',
    image: project.image || '/images/placeholder.jpg',
    category: project.category || 'Project',
    color: project.color || '#67A94C',
    slug: project.slug || project._id,
    date: project.date || project.createdAt
  }));

  const handleLoadMore = () => {
    const newCount = displayedCount + projectsToShow;
    setDisplayedCount(newCount);
    
    if (newCount >= totalProjects) {
      setLoadMore(false);
    }
  };

  const projectsToDisplay = normalizedProjects.slice(0, displayedCount);

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />

      <section className="py-28 bg-white text-dark rounded-b-2xl">
        <div className="container">
          <div className="row md:gx-4 gy-4">
            {projectsToDisplay.length > 0 ? (
              projectsToDisplay.map((project) => (
                <div key={project._id || project.slug} className="lg:col-4 sm:col-6">
                  <ProjectCard project={project} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-12">
                <p className="text-gray-500">No projects found</p>
              </div>
            )}
         
          </div>
        </div>
      </section>
    </>
  );
};

export default PageData;