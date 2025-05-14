"use client";

import Breadcrumb from "@/app/_components/Breadcrumb";
import BreadcrumbItem from "@/app/_components/BreadcrumbItem";
import { capitalizeText } from "@/utils/capitalizeText";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const PageHeader = ({ title, subtitle }) => {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState();

  useEffect(() => {
    const pathWithoutQuery = pathname.split("?")[0];
    let pathArray = pathWithoutQuery.split("/");
    pathArray.shift();

    pathArray = pathArray.filter((path) => path !== "");

    const breadcrumbs = pathArray.map((path, index) => {
      const href = "/" + pathArray.slice(0, index + 1).join("/");
      return {
        href,
        label: path.charAt(0).toUpperCase() + path.slice(1),
        isCurrent: index === pathArray.length - 1,
      };
    });

    setBreadcrumbs(breadcrumbs);
  }, [pathname]);

  return (
    <section className="banner bg-white">
      <div className="pt-20 pb-24 page-banner bg-dark rounded-b-2xl relative z-10">
        <div className="container">
          <div className="row items-end" data-aos="fade">
            <div className="sm:col-8 text-center sm:text-left">
              <h1 className="text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center sm:text-left mb-8">
                {capitalizeText(title)}
              </h1>

              <Breadcrumb>
                <li>
                  {/* prettier-ignore */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mr-3"
                    style={{ transform: "rotateY(180deg)" }}>
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2"></path>
                    <path d="M19 12h2l-9 -9l-9 9h2v7a2 2 0 0 0 2 2h5.5"></path>
                    <path d="M16 19h6"></path>
                    <path d="M19 16l3 3l-3 3"></path>
                  </svg>
                </li>
                <BreadcrumbItem isCurrent={pathname === "/"} href="/">
                  Home
                </BreadcrumbItem>
                {breadcrumbs &&
                  breadcrumbs.map((breadcrumb) => (
                    <React.Fragment key={breadcrumb.href}>
                      <li>
                        <span className="px-4">•</span>
                      </li>
                      <BreadcrumbItem
                        href={breadcrumb.href}
                        isCurrent={breadcrumb.isCurrent}
                      >
                        {breadcrumb.label}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
              </Breadcrumb>
            </div>
            <div className="sm:col-4 block mt-6 sm:mt-0 text-center sm:text-right">
              <span className="font-secondary text-2xl leading-none text-white/75">
                {subtitle}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default PageHeader;
