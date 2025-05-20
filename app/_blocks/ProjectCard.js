import Image from "next/image";
import Link from "next/link";

const Projects = ({ index, slug, frontMatter, twoColumns }) => {
  const { title, description, image, color, category } = frontMatter;

  return (
    <div
      data-aos
      className="rounded-lg overflow-hidden relative group h-full"
    >
      <span
        className="absolute h-full group-[.aos-animate]:h-0 w-full z-30 duration-700 left-0 bottom-0"
        style={{ backgroundColor: color, transitionDelay: `${index * 100}ms` }}
      ></span>
      <Image
        src={image}
        alt={title}
        width={twoColumns ? 620 : 520}
        height={twoColumns ? 420 : 550}
        className={`scale-150 group-[.aos-animate]:scale-100 duration-700 group-hover:!scale-125 object-cover w-full h-full bg-light/20 ${twoColumns ? "has-twoColumns" : ""}`}
        style={twoColumns ? { height: "376px" } : ""}
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

export default Projects;
