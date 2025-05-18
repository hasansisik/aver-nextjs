"use client";

import menu from "@/config/menus.json";
import siteConfig from "@/config/site.config.json";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFooter } from "@/redux/actions/footerActions";

import style from "@/styles/modules/Footer.module.scss";

const Footer = () => {
  const dispatch = useDispatch();
  const { footer, loading } = useSelector((state) => state.footer);
  const pathname = usePathname();
  
  // Fallback için siteConfig'ten gelen değerler
  const { copyright: defaultCopyright, socialLinks: defaultSocialLinks } = siteConfig;
  const { footerMenu: defaultFooterMenu } = menu;
  
  // Redux store'dan verileri alıyoruz
  const footerMenu = footer?.footerMenu || [];
  const socialLinks = footer?.socialLinks || [];
  const copyright = footer?.copyright || defaultCopyright;
  const ctaText = footer?.ctaText || "Let's make something";
  const ctaLink = footer?.ctaLink || "/contact";
  const developerInfo = footer?.developerInfo || "Developed by Platol";
  const developerLink = footer?.developerLink || "https://themeforest.net/user/platol/portfolio";

  // Footer verilerini API'den çekme
  useEffect(() => {
    dispatch(getFooter());
  }, [dispatch]);

  // get the page slug from the url
  const [contactPage, setContactPage] = useState(false);
  
  // Update contact page state whenever pathname changes
  useEffect(() => {
    // Check if pathname includes 'contact' and update state accordingly
    setContactPage(pathname.includes("contact"));
  }, [pathname]);

  return (
    <footer className={`${contactPage ? "pt-24" : "pt-28"} pb-20 sticky bottom-0 z-[1]`}>
      <div className="mb-16 overflow-hidden">
        <Link
          href={ctaLink}
          className={`${style["footer-cta"]} block text-5xl font-secondary font-medium mb-8`}
        >
          <div className={`${style["animated-line"]} ${style["animated-line-one"]} mb-5`}>
            <div className={style["line-block"]}>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
            </div>
            <div className={style["line-block-copy"]}>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
            </div>
          </div>

          <div className={`${style["animated-line"]} ${style["animated-line-two"]}`}>
            <div className={style["line-block"]}>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
            </div>
            <div className={style["line-block-copy"]}>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
              <span className="mr-24">
                <span className={style["cta-text"]}>{ctaText}</span>
                <Image
                  className={`inline-block ml-16 ${style["cta-icon"]}`}
                  src="/images/arrow-right.svg"
                  alt="arrow-right"
                  height={31}
                  width={39}
                />
              </span>
            </div>
          </div>
        </Link>
      </div>
      <div className="container">
        <div className="row">
          <div className="md:col-6 text-center md:text-left mb-4">
            <ul className="inline-flex flex-wrap justify-center md:justify-start gap-x-6">
              {socialLinks.length > 0 ? (
                // API'den gelen sosyal bağlantıları göster
                socialLinks.map((item, key) => (
                  <li key={key} className="inline-block hover:opacity-75 transition-op duration-300">
                    <a href={item.link} className="link">{item.name}</a>
                  </li>
                ))
              ) : (
                // API'den veri gelmezse varsayılan sosyal bağlantıları göster
                defaultSocialLinks.map((item, key) => (
                  <li key={key} className="inline-block hover:opacity-75 transition-op duration-300">
                    <a href={item.link} className="link">{item.fullName || item.name}</a>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="md:col-6 text-center md:text-right mb-4">
            <ul className="inline-flex flex-wrap justify-center md:justify-end gap-x-6">
              {footerMenu.length > 0 ? (
                // API'den gelen footer menü öğelerini göster
                footerMenu.map((item, key) => (
                  <li key={key} className="inline-block hover:opacity-75 transition-op duration-300">
                    <a href={item.link} className="link">{item.name}</a>
                  </li>
                ))
              ) : (
                // API'den veri gelmezse varsayılan footer menü öğelerini göster
                defaultFooterMenu.map((item, key) => (
                  <li key={key} className="inline-block hover:opacity-75 transition-op duration-300">
                    <a href={item.link} className="link">{item.name}</a>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="md:col-6 text-center md:text-left mb-4 md:mb-0">
            <p className="text-white/75">{copyright}</p>
          </div>
          <div className="md:col-6 text-center md:text-right">
            <p className="text-white/75">
              <a className="link text-white" href={developerLink} target="_blank" rel="noopener noreferrer">
                {developerInfo}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;