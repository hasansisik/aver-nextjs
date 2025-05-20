"use client";

import BlogCard from "@/app/_blocks/BlogCard";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";

const PageData = ({ title, subtitle, blogPosts, totalPosts }) => {
  const postsToShow = 6
  const [posts, setPosts] = useState(blogPosts.slice(0, postsToShow))
  const [loadMore, setLoadMore] = useState(true)

  const handleLoadMore = () => {
    let currentLength = posts.length
    let postLoaded = postsToShow + currentLength
    let isMore = currentLength < totalPosts
    const nextResults = isMore
      ? blogPosts.slice(currentLength, currentLength + postsToShow)
      : []
    setPosts([...posts, ...nextResults])
    totalPosts < postLoaded && setLoadMore(false)
  }

  return (
    <>
      <PageHeader title={title} subtitle={subtitle + ` (${totalPosts})`} />

      <section className="py-28 bg-white text-dark rounded-b-2xl">
        <div className="container">
          <div className="row md:gx-4 gy-5">
            {posts.map((item, index) => (
              <div
                key={item.slug}
                className="lg:col-4 sm:col-6 init-delay"
                data-aos="fade-up-sm"
                data-aos-duration="500"
                style={{
                  "--lg-delay": `${(index % 3) * 75}ms`,
                  "--md-delay": `${(index % 2) * 75}ms`,
                  "--sm-delay": `${(index % 2) * 75}ms`
                }}
              >
                <BlogCard slug={item.slug} frontMatter={item.frontMatter} />
              </div>
            ))}

          </div>
        </div>
      </section>
    </>
  )
}

export default PageData;