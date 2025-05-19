"use client";

import siteConfig from "@/config/site.config.json";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHeader } from "@/redux/actions/headerActions";

import style from "@/styles/modules/Header.module.scss";

const Header = () => {
  const dispatch = useDispatch();
  const { header, loading } = useSelector((state) => state.header);
  const pathname = usePathname();

  // Fallback için siteConfig'ten gelen değerler
  const { logo, logoText, socialLinks: defaultSocialLinks } = siteConfig;
  
  // Redux store'dan verileri alıyoruz
  const mainMenu = header?.mainMenu || [];
  const socialLinks = header?.socialLinks || [];
  const mainMenuLength = mainMenu.length || 0;

  // Header verilerini API'den çekme
  useEffect(() => {
    dispatch(getHeader());
  }, [dispatch]);

  const [indicatorPosition, setIndicatorPosition] = useState(null);
  const navRef = useRef(null);
  const activeLinkRef = useRef(null);

  useEffect(() => {
    // Menü öğeleri değiştiğinde veya yüklendiğinde
    if (navRef.current && !loading && mainMenu.length > 0) {
      const activeLink = navRef.current.querySelector(".active");
      if (activeLink) {
        activeLinkRef.current = activeLink;
        setIndicatorPosition({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
        });
      }
    }
  }, [mainMenu, loading]);

  const handleLinkMouseEnter = (event) => {
    const link = event.currentTarget;
    setIndicatorPosition({
      left: link.offsetLeft,
      width: link.offsetWidth,
    });
  };

  const handleLinkMouseLeave = () => {
    if (activeLinkRef.current) {
      setIndicatorPosition({
        left: activeLinkRef.current.offsetLeft,
        width: activeLinkRef.current.offsetWidth,
      });
    }
  };

  const handleLinkClick = (event) => {
    const link = event.currentTarget;
    activeLinkRef.current = link;
    setIndicatorPosition({
      left: link.offsetLeft === 0 ? link.offsetLeft + 8 : link.offsetLeft,
      width: link.offsetLeft === 0 ? link.offsetWidth + 7 : link.offsetWidth,
    });
    // Close mobile menu when a link is clicked
    setMobileNavClose(true);
  };

  // Update Header element position on Scroll
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Open-Close Mobile Nav state
  const [mobileNavClose, setMobileNavClose] = useState(true);
  // disable scroll when mobile nav is open
  useEffect(() => {
    const html = document.documentElement;
    mobileNavClose 
      ? html.classList.remove("overflow-hidden") 
      : html.classList.add("overflow-hidden");
  }, [mobileNavClose]);

  // Header Show Hide state
  const [isInvisible, setIsInvisible] = useState(false);
  // Header Active inActive state
  const [isActive, setIsActive] = useState(false);

  // Change Header background color on scroll
  useEffect(() => {
    const banner = document.querySelector(".banner");
    const bannerScrollHeight = banner?.scrollHeight + 100;
    const observer = new IntersectionObserver(
      (entry) => {
        window.addEventListener("scroll",
          () => entry[0].isIntersecting ? setIsActive(false) : setIsActive(true)
        );

        // Hide Header on scroll down and show on scroll up
        let lastScrollTop = 0;
        const handleScroll = () => {
          const currentScrollTop = document.documentElement.scrollTop;
          if (currentScrollTop > bannerScrollHeight && currentScrollTop > lastScrollTop) {
            setIsInvisible(true);
          } else {
            setIsInvisible(false);
          }
          lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
      },
      { threshold: [0] }
    );
    banner && observer.observe(banner);
  }, []);

  // Header yüklenirken fallback göster
  if (loading && mainMenu.length === 0) {
    // Default verilerle render et
    return (
      <header 
        className={`fixed top-0 z-[9000] w-full ${style.header} ${isActive ? style.active : ""} ${isInvisible ? "-translate-y-full invisible" : ""}`}>
        <div className="container">
          <div className="flex justify-between py-6 items-center relative">
            {/* Logo */}
            <div className="w-1/4">
              <Link href="/" className="inline-block align-middle">
                <Image
                  src={logo}
                  alt={logoText}
                  width={80}
                  height={29}
                  quality={100}
                  priority
                />
              </Link>
            </div>
            
            {/* Yükleniyor animasyonu */}
            <div className="flex-1 flex justify-center items-center h-12">
              <div className="w-4 h-4 rounded-full bg-white/30 animate-pulse"></div>
            </div>
            
            {/* Telefon menü toggle butonu */}
            <button
              type="button"
              aria-label="Toggle Mobile Navigation"
              className={style.navToggler}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M4 8l16 0"></path>
                <path d="M4 16l16 0"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      className={`fixed top-0 z-[9000] w-full ${style.header} ${isActive ? style.active : ""} ${isInvisible ? "-translate-y-full invisible" : ""}`}>
      <div className="container">
        <div className="flex justify-between py-6 items-center relative">
          <div className={`w-1/5 lg:w-1/6 transition-all duration-300 ${isScrolled ? "lg:opacity-0 lg:-translate-x-8" : ""}`}>
            <Link
              href="/" 
              className="inline-block align-middle"
              onClick={handleLinkClick}
            >
              <Image
                src={header?.logoUrl || logo}
                alt={header?.logoText || logoText}
                width={80}
                height={29}
                quality={100}
                priority
              />
            </Link>
          </div>
          <nav
            ref={navRef}
            className={`${style.navbar} ${mobileNavClose ? "w-12 !h-12 lg:w-auto lg:!h-auto" : "w-full max-w-xs lg:w-auto"} ${!mobileNavClose ? style.navbarOpen : ""}`}
            style={{ height: mobileNavClose ? "auto" : "auto" }}
          >
            {indicatorPosition && (
              <span
                className={style.indicator}
                style={indicatorPosition}
              ></span>
            )}

            {mainMenu.length > 0 ? (
              // API'den gelen menü öğelerini göster
              mainMenu.map((item, key) => (
                <Link
                  key={key}
                  href={item.link}
                  className={
                    pathname == item.link
                      || pathname.includes("/blog") && item.link == "/blog"
                      || pathname.includes("/project") && item.link == "/project"
                      ? "active !text-white/100" : ""}
                  onMouseEnter={handleLinkMouseEnter}
                  onMouseLeave={handleLinkMouseLeave}
                  onClick={handleLinkClick}
                >
                  {item.name}
                </Link>
              ))
            ) : (
              // API'den veri gelmezse veya hata olursa config'ten varsayılan menüyü göster
              <>
                <Link href="/" className={pathname === "/" ? "active !text-white/100" : ""}>Home</Link>
                <Link href="/about" className={pathname === "/about" ? "active !text-white/100" : ""}>About</Link>
                <Link href="/project" className={pathname.includes("/project") ? "active !text-white/100" : ""}>Project</Link>
                <Link href="/blog" className={pathname.includes("/blog") ? "active !text-white/100" : ""}>Blog</Link>
                <Link href="/contact" className={pathname === "/contact" ? "active !text-white/100" : ""}>Contact</Link>
              </>
            )}
          </nav>

          <div
            className={`${style.navOverlay} ${mobileNavClose ? "" : style.navOverlayVisible}`}
            onClick={() => setMobileNavClose(true)}
          ></div>

          <button
            type="button"
            aria-label="Toggle Mobile Navigation"
            className={`${style.navToggler} ${mobileNavClose ? "" : "scale-[0.85]"}`}
            onClick={() => setMobileNavClose(!mobileNavClose)}
          >
            <div className="relative flex items-center justify-center w-full h-full">
              <svg 
                className={`${mobileNavClose ? "opacity-100" : "opacity-0"}`} 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                strokeWidth="2" 
                stroke="currentColor" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M4 8l16 0"></path>
                <path d="M4 16l16 0"></path>
              </svg>
              <svg 
                className={`absolute ${mobileNavClose ? "opacity-0" : "opacity-100"}`} 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                strokeWidth="2" 
                stroke="currentColor" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M18 6l-12 12"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </div>
          </button>

          <div className={`w-1/5 lg:w-1/6 transition-all duration-300 text-right text-sm hidden lg:block ${isScrolled ? "lg:opacity-0 lg:translate-x-8" : ""}`}>
            <span className="block text-white/75 mb-1">Social Links:</span>
            <ul className="inline-flex gap-x-4">
              {socialLinks.length > 0 ? (
                // API'den gelen sosyal bağlantıları göster
                socialLinks.map((item, key) => (
                  <li key={key} className="inline-block hover:opacity-75 transition-op duration-300">
                    <a href={item.link} className="link">{item.name}</a>
                  </li>
                ))
              ) : (
                // API'den veri gelmezse default sosyal bağlantıları göster
                defaultSocialLinks.map((item, key) => (
                  <li key={key} className="inline-block hover:opacity-75 transition-op duration-300">
                    <a href={item.link} className="link">{item.name}</a>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
