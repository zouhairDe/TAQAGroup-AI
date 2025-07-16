"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
const carouselData = [
  {
    thumbnail: "/images/carousel/carousel-01.png",
  },
  {
    thumbnail: "/images/carousel/carousel-03.png",
  },
  {
    thumbnail: "/images/carousel/carousel-02.png",
  },
  {
    thumbnail: "/images/carousel/carousel-04.png",
  },
];
export default function WithIndicators() {
  const swiperOptions = {
    modules: [Pagination, Autoplay],
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  };
  return (
    <div className="relative border border-gray-200 rounded-lg carouselThree dark:border-gray-800">
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
        {/* <!-- If we need pagination --> */}
        <div className="swiper-pagination"></div>
      </Swiper>
    </div>
  );
}
