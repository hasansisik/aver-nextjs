import { formatDate } from "@/libs/utils/formatDate";
import Image from "next/image";
import Link from "next/link";

const BlogCard = ({ frontMatter, slug }) => {
  const { title, date, image, category } = frontMatter;

  return (
    <article className="relative group text-center">
      <div className="relative overflow-hidden rounded-lg mb-8">
        <Image
          src={image}
          alt={title}
          width={620}
          height={500}
          className="duration-700 group-hover:scale-110 group-hover:-rotate-1 object-cover w-full rounded-lg group-hover:brightness-75 bg-light/20"
        />
      </div>
      <div className="px-6 transition-all duration-500 group-hover:opacity-60">
        <div className="flex flex-wrap items-center justify-center mb-4 space-x-5">
          <span className="inline-block text-sm rounded-full bg-[#efefef] px-3 py-1 capitalize">
            {category}
          </span>
          <span className="opacity-75 text-sm">{formatDate(date)}</span>
        </div>
        <h3 className="text-2xl leading-tight">
          <Link href={`/blog/${slug}`} className="stretched-link">
            {title}
          </Link>
        </h3>
      </div>
    </article>
  );
};

export default BlogCard;
