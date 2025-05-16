'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects } from "@/redux/actions/projectActions";
import { getBlogs } from "@/redux/actions/blogActions";
import Banner from "@/app/_blocks/Banner";
import BlogCard from "@/app/_blocks/BlogCard";
import ProjectCard from "@/app/_blocks/ProjectCard";
import WorkProcess from "@/app/_blocks/WorkProcess";
import Image from "next/image";
import Link from "next/link";

const HomeClient = ({ home, projectPage, blogPage, banner, featuredBy, workProcess }) => {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.project);
  const { blogs } = useSelector((state) => state.blog);

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getBlogs());
  }, [dispatch]);

  // Get limited number of projects and blogs
  const limitedProjects = projects.slice(0, 5);
  const limitedBlogs = blogs.slice(0, 3);

  return (
    <>
      <Banner banner={banner} />

      {featuredBy.enable && (
        <section className="pt-28 lg:pb-10 overflow-hidden">
          <div className="container">
            <div className="row">
              <div className="col-12 mb-10">
                <h2
                  className="text-3xl font-secondary font-medium text-center"
                  data-aos="fade"
                >
                  {featuredBy.title}
                </h2>
              </div>
              <div className="col-12">
                <div className="flex justify-center items-center flex-wrap">
                  {featuredBy.brands_white.map((item, index) => (
                    <div
                      key={index}
                      className="mx-4 sm:mx-8 my-4"
                      data-aos="fade-left"
                      data-aos-delay={index * 50}
                    >
                      <Image
                        src={item}
                        alt="Brand"
                        width={120}
                        height={80}
                        className="w-auto h-auto sm:max-h-20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-28">
        <div className="container">
          <div className="row mb-16 items-end">
            <div className="sm:col-8 order-2 sm:order-1">
              <h2 className="text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center sm:text-left">
                {projectPage.frontMatter.title}
              </h2>
            </div>
            <div className="sm:col-4 order-1 sm:order-2 block mb-4 sm:mb-0 text-center sm:text-right">
              <span className="font-secondary text-2xl leading-none text-white/75">
                {projectPage.frontMatter.subtitle}
              </span>
            </div>
          </div>

          <div className="row md:gx-4 gy-4">
            {limitedProjects.map((project, i) => (
              <div
                key={project._id || i}
                className={`${i % 5 >= 3 ? "sm:col-6" : "lg:col-4 sm:col-6"} ${i === 4 ? "hidden lg:block" : ""}`}
              >
                <ProjectCard
                  index={i}
                  slug={project.slug}
                  frontMatter={{
                    title: project.title,
                    description: project.description,
                    image: project.image,
                    date: project.date || project.createdAt,
                    category: project.category,
                    color: project.color
                  }}
                  twoColumns={i % 5 >= 3}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link className="button" href="/project">
              <span>All Works</span>
            </Link>
          </div>
        </div>
      </section>

      <WorkProcess workProcess={workProcess} />

      <section className="py-28 bg-white text-dark rounded-b-2xl">
        <div className="container">
          <div className="row mb-16 items-end">
            <div className="sm:col-8 order-2 sm:order-1">
              <h2 className="text-black text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center sm:text-left">
                {blogPage.frontMatter.title}
              </h2>
            </div>
            <div className="sm:col-4 order-1 sm:order-2 block mb-4 sm:mb-0 text-center sm:text-right">
              <span className="font-secondary text-2xl leading-none text-black/75">
                {blogPage.frontMatter.subtitle}
              </span>
            </div>
          </div>

          <div className="row md:gx-4 gy-5">
            {limitedBlogs.map((blog, index) => (
              <div
                key={blog._id || index}
                className="lg:col-4 sm:col-6 init-delay"
                data-aos="fade-up-sm"
                data-aos-duration="500"
                style={{
                  "--lg-delay": `${(index % 3) * 75}ms`,
                  "--md-delay": `${(index % 2) * 75}ms`,
                  "--sm-delay": `${(index % 2) * 75}ms`
                }}
              >
                <BlogCard 
                  slug={blog.slug} 
                  frontMatter={{
                    title: blog.title,
                    description: blog.description,
                    image: blog.image,
                    date: blog.date || blog.createdAt,
                    category: blog.category,
                    author: blog.author
                  }} 
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link className="button button-dark" href="/blog">
              <span>All Posts</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomeClient; 