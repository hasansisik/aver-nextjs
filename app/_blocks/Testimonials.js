"use client";

import Image from "next/image";
import { A11y, Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

const Testimonials = ({ whatClientsSay }) => {
  return (
    <section className="py-28 bg-white text-dark rounded-b-2xl" data-aos="fade-in">
        <div className="container">
          <div className="row mb-16 items-end">
            <div className="col-12 text-center">
              <span className="font-secondary block text-2xl leading-none text-black/75 mb-4">
                {whatClientsSay.subtitle}
              </span>
              <h2 className="text-4xl md:text-5xl font-secondary font-medium -mt-[6px]">
                {whatClientsSay.title}
              </h2>
            </div>
          </div>
          <div className="row justify-center">
            <div className="lg:col-8">
              <div className="relative md:px-20 text-center">
                <Swiper
                  modules={[Navigation, Autoplay, A11y]}
                  slidesPerView={1}
                  loop={true}
                  speed={500}
                  autoHeight={true}
                  navigation={{
                    nextEl: ".slide-next",
                    prevEl: ".slide-prev"
                  }}
                  // autoplay={{
                  //   delay: 5000,
                  //   disableOnInteraction: false,
                  // }}
                >
                  {whatClientsSay.reviewsItems.map((item, index) => (
                    <SwiperSlide key={index}>
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-6 mx-auto opacity-50" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" color="currentColor"><path d="M14 16c0-1.886 0-2.828.586-3.414S16.114 12 18 12s2.828 0 3.414.586S22 14.114 22 16s0 2.828-.586 3.414S19.886 20 18 20s-2.828 0-3.414-.586S14 17.886 14 16"/><path d="M14 16v-4.137C14 8.196 16.516 5.086 20 4M2 16c0-1.886 0-2.828.586-3.414S4.114 12 6 12s2.828 0 3.414.586S10 14.114 10 16s0 2.828-.586 3.414S7.886 20 6 20s-2.828 0-3.414-.586S2 17.886 2 16"/><path d="M2 16v-4.137C2 8.196 4.516 5.086 8 4"/></g></svg>

                        <div className="text-lg mb-8 px-5 md:px-10">{item.review}</div>
                        <p className="text-xl font-medium mb-1">{item.name}</p>
                        <p className="text-black/50">{item.info}</p>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <button
                  className="slide-prev md:absolute px-3 md:px-0 mt-14 md:mt-0 left-0 top-1/2 -translate-y-1/2 hover:opacity-50 hover:-translate-x-2 transition-all duration-300"
                  title="Slide Prev"
                >
                  <Image
                    className="inline-block invert rotate-180"
                    src="/images/arrow-right.svg"
                    alt="arrow-right"
                    height={31}
                    width={39}
                  />
                </button>
                <button
                  className="slide-next md:absolute px-3 md:px-0 mt-14 md:mt-0 right-0 top-1/2 -translate-y-1/2 hover:opacity-50 hover:translate-x-2 transition-all duration-300"
                  title="Slide Next"
                >
                  <Image
                    className="inline-block invert"
                    src="/images/arrow-right.svg"
                    alt="arrow-right"
                    height={31}
                    width={39}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default Testimonials