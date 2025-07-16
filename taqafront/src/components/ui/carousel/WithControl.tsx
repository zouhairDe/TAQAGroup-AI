"use client";
import Image from "next/image";
import React from "react";
import { Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const carouselData = [
  {
    thumbnail: "/images/carousel/carousel-01.png",
  },
  {
    thumbnail: "/images/carousel/carousel-02.png",
  },
  {
    thumbnail: "/images/carousel/carousel-03.png",
  },
  {
    thumbnail: "/images/carousel/carousel-04.png",
  },
];

export default function WithControl() {
  const swiperOptions = {
    modules: [Navigation, Autoplay],
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".next-style-one.swiper-button-next",
      prevEl: ".prev-style-one.swiper-button-prev",
    },
  };
  return (
    <div className="relative border border-gray-200 rounded-lg carouselTwo dark:border-gray-800">
      <Swiper {...swiperOptions}>
        {/* <!-- slider item --> */}
        {carouselData.map((item, i) => (
          <SwiperSlide key={i + 1}>
            <div className="overflow-hidden rounded-lg">
              <Image
                width={487}
                height={297}
                src={item.thumbnail}
                className="w-full rounded-lg"
                alt="carousel"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* <!-- If we need navigation buttons --> */}
      <div className="swiper-button-prev prev-style-one">
        <svg
          className="w-auto h-auto stroke-current"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.25 6L9 12.25L15.25 18.5"
            stroke=""
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="swiper-button-next next-style-one">
        <svg
          className="stroke-current"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.75 19L15 12.75L8.75 6.5"
            stroke=""
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
