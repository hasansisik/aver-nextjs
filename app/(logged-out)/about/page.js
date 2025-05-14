import AboutImage from "@/blocks/AboutImage";
import Testimonials from "@/blocks/Testimonials";
import PageHeader from "@/components/PageHeader";
import Markdown from "@/components/ReactMarkdown";
import { getSinglePage } from "@/libs/getSinglePage";
import Image from "next/image";
import React from "react";

const getAboutPageData = async () => {
  return getSinglePage("content/about.md");
}

export const generateMetadata = async () => {
  const aboutPage = await getAboutPageData();
  return {
    title: aboutPage.frontMatter.title,
    description: aboutPage.frontMatter.subtitle,
  };
};

const About = async () => {
  const aboutPage = await getAboutPageData();
  const { title, subtitle, about, featuredBy, services, whatClientsSay } = aboutPage.frontMatter;

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />

      <AboutImage about={about} />

      {featuredBy.enable && (
        <section className="pb-24 pt-10 bg-white text-dark overflow-hidden">
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
                  {featuredBy.brands.map((item, index) => (
                    <div
                      key={index}
                      className="mx-8 my-4"
                      data-aos="fade-left"
                      data-aos-delay={index * 50}
                    >
                      <Image
                        src={item}
                        alt="Brand"
                        width={120}
                        height={80}
                        className="w-auto max-h-20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {services.enable && (
        <section className="py-28">
          <div className="container">
            <div className="row mb-16 items-end">
              <div className="sm:col-8 order-2 sm:order-1">
                <h2 className="text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center sm:text-left">
                  {services.title}
                </h2>
              </div>
              <div className="sm:col-4 order-1 sm:order-2 block mb-4 sm:mb-0 text-center sm:text-right">
                <span className="font-secondary text-2xl leading-none text-white/75">
                  {services.subtitle}
                </span>
              </div>
            </div>

            <div className="row g-0">
              {services.serviceLists.map((item, index) => (
                <React.Fragment key={index}>
                  <div className={`lg:col-4 md:col-6`} data-aos="fade-in">
                    <div className={`${item.active ? "" : "select-none cursor-not-allowed hover:border-white/5"} border border-white/5 hover:border-white/40 p-8 h-full rounded-lg`}>
                      <span className="text-lg font-secondary font-medium text-white/75">
                        / {index < 9 ? "0" + (index + 1) : (index + 1)}
                      </span>
                      <h3 className={`my-6 text-3xl ${item.active ? "" : "text-white/75"}`}>{item.title}</h3>
                      <div className="text-white/75 text-lg">
                        <Markdown content={item.description} inline={true} />
                      </div>
                    </div>
                  </div>
                  {index !== services.serviceLists.length - 1 && services.rotatingIcon && (
                    <div className={`lg:col-4 md:col-6 block md:hidden lg:block`}>
                      <div className="p-8 h-full flex items-center content-center py-6">
                        <svg className="mx-auto opacity-10 !animate-[spin_50s_linear_infinite] h-10 w-10 md:h-16 md:w-16" style={{ animationDuration: "6000ms" }} xmlns="http://www.w3.org/2000/svg" width="62" height="62" viewBox="0 0 23 23" fill="none"><path d="M23 12.9234H14.9568L20.6503 18.6169L18.6169 20.6051L12.9234 14.9116V23L10.0766 22.9548V14.9116L4.3831 20.6503L2.39489 18.6169L8.08841 12.9234H0V10.0766H8.08841L2.39489 4.33792L4.3831 2.3497L10.0766 8.08841V0H12.9234V8.08841L18.6621 2.3497L20.6503 4.33792L14.9568 10.0766H23V12.9234Z" fill="white" /></svg>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      )}

      <Testimonials whatClientsSay={whatClientsSay} />
    </>
  );
};

export default About;