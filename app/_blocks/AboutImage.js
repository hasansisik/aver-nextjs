"use client";


import Markdown from "@/app/_components/ReactMarkdown";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const AboutImage = ({ about }) => {

  // Random Numbers
  const [randomNumbers, setRandomNumbers] = useState([]);
  useEffect(() => {
    const generateUniqueRandomNumbers = () => {
      const numbers = [];
      const min = -6;
      const max = 6;
      while (numbers.length < about.images.length) {
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!numbers.includes(randomNumber)) {
          numbers.push(randomNumber);
        }
      }
      setRandomNumbers(numbers);
    };
    generateUniqueRandomNumbers();
  }, []);


  // Swap Images
  const imageRef = useRef(null);
  const imageIndexRef = useRef(0);

  const swapImages = () => {
    const { children } = imageRef.current;
    const lastIndex = children.length - 1;
    const previousIndex = imageIndexRef.current;

    const nextIndex = previousIndex === 0 ? lastIndex : previousIndex - 1;

    for (let i = 0; i < children.length; i++) {
      children[i].style.zIndex = i === nextIndex ? 99 : 0;
    }

    imageIndexRef.current = nextIndex;
  };

  // Rotate Icon & Swap Images
  const [rotate, setRotate] = useState(0);
  const handleClick = () => {
    setRotate(rotate + 360);
    swapImages();
  };

  return (
    <section className="py-28 bg-white text-dark">
      <div className="container">
        <div className="row justify-center items-center">
          <div
            className="lg:col-4 md:col-6 col-10 mb-16 lg:mb-0"
            data-aos="fade-up-sm"
          >
            <div
              ref={imageRef}
              onClick={() => handleClick()}
              className="relative mx-8 z-10 cursor-pointer hover:scale-105 transition-transform ease-out duration-300"
            >
              {about.images.map((item, index) => (
                <div
                  key={index}
                  className={`transition-transform ${index !== 0 ? `absolute top-0 left-0` : "relative"}`}
                  style={{ zIndex: -index, transform: `rotate(${randomNumbers[index]}deg)` }}
                >
                  <Image
                    src={item}
                    alt="Image"
                    width={500}
                    height={607}
                    className="rounded-lg bg-light/10"
                  />
                </div>
              ))}
            </div>
          </div>
          <div
            className="lg:col-5 md:col-10 text-center lg:text-left"
            data-aos="fade-up-sm"
            data-aos-delay="100"
          >
            <div className="pl-0 lg:pl-8 flex flex-col">
              <div className="order-2 lg:order-1 mb-0 lg:mb-10 mt-10 lg:mt-0">
                <p className="text-2xl leading-snug mb-4">{about.title}</p>
                <div className="text-black/75">
                  <Markdown content={about.description} inline={true} />
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <button className="button button-sm button-dark" onClick={() => handleClick()}>
                  <span>
                    <svg
                      style={{ transform: `rotate(${rotate}deg)` }}
                      className="inline align-bottom mr-2 transition-transform ease-out duration-1000"
                      width="16" height="16" viewBox="0 0 20 20" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.3332 10.0003C18.3332 14.6027 14.6022 18.3337 9.99984 18.3337C5.39746 18.3337 2.49984 13.7503 2.49984 13.7503M1.6665 10.0003C1.6665 5.39795 5.37021 1.66699 9.99984 1.66699C15.5554 1.66699 18.3332 6.25033 18.3332 6.25033M18.3332 6.25033V3.33366M18.3332 6.25033H15.4165M2.49984 13.7503H5.4165M2.49984 13.7503V16.667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    More Photos
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutImage;
