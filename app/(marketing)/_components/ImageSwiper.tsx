'use client';
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from 'react-icons/fa';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import Image from 'next/image';
import 'swiper/css';

type TImageSwiper = {
  images: {
    url: string;
    caption?: string;
  }[];
  className?: string;
};
const ImageSwiper = ({ images, className }: TImageSwiper) => {
  const [swiper, setSwiper] = useState<null | SwiperClass>(null);
  const imageCount = images.length;
  const [controls, setControls] = useState({
    isFirst: true,
    isLast: imageCount >= 2 ? false : true,
  });

  useEffect(() => {
    swiper?.on('slideChange', ({ activeIndex }) => {
      setControls({
        isFirst: activeIndex === 0,
        isLast: activeIndex + 1 === imageCount,
      });
    });
  }, [swiper, imageCount]);

  return (
    <div className="relative">
      {!controls.isFirst && (
        <div
          className="absolute z-10 top-1/2 -translate-y-1/2 -translate-x-4 transition-colors hover:text-primary group"
          role="button"
          onClick={() => swiper?.slidePrev()}
        >
          <span className="sr-only">Previous image</span>
          <FaArrowAltCircleLeft className="h-8 w-8 animate-pulse group-hover:animate-none" />
        </div>
      )}
      {!controls.isLast && (
        <div
          className="absolute z-10 top-1/2 -translate-y-1/2 right-0 translate-x-4 transition-colors hover:text-primary group"
          role="button"
          onClick={() => swiper?.slideNext()}
        >
          <span className="sr-only">Next image</span>
          <FaArrowAltCircleRight className="h-8 w-8 animate-pulse group-hover:animate-none delay" />
        </div>
      )}
      <Swiper className={cn('bg-white/5 rounded-md select-none', className)} onSwiper={setSwiper}>
        {images.map((image, index) => (
          <SwiperSlide key={`image-${index}`}>
            <Image
              alt={`discord-${index + 1}`}
              width={0}
              height={0}
              sizes="100vw"
              quality={100}
              src={image.url}
              className="h-full w-full object-contain object-center"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="w-full text-center mt-1 flex flex-col">
        {swiper?.activeIndex !== undefined && (
          <span className="text-muted-foreground">{images[swiper.activeIndex].caption}</span>
        )}
        <span className="text-sm text-muted-foreground">
          {(swiper?.activeIndex ?? 0) + 1} / {imageCount}
        </span>
      </div>
    </div>
  );
};

export default ImageSwiper;
