'use client';
import { Button } from '@/shared/components/ui/button';
import { HiChevronDoubleDown } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const vpHeight = isMounted ? window.innerHeight : null;

  return (
    <div
      className="bg-landing w-full bg-center bg-cover bg-no-repeat relative"
      style={{
        height: vpHeight ?? '100vh',
      }}
    >
      <div className="absolute w-full h-full backdrop-blur-sm bg-black/60" />
      <div className="h-full flex flex-col items-center max-w-screen-xl mx-auto z-10 relative justify-evenly px-6">
        {/*  */}
        <div className="text-center">
          <h1 className="sr-only">EliteCore</h1>
          <div className="w-64 h-64 mx-auto mt-12">
            <Image
              src="/ec.webp"
              width={0}
              height={0}
              loading="eager"
              sizes="100vw"
              alt="logo"
              className="w-full h-full object-center object-contain"
            />
          </div>
          <p className="mt-6 text-xl font-semibold bg-muted px-4 py-1 rounded-lg capitalize">
            Crafting ARK: Survival servers for you since 2019.
          </p>
          <p className="text-lg tracking-wide mt-1">For gamers, by gamers.</p>
        </div>
        <div>
          <div className="flex flex-col space-y-2">
            <motion.span
              className="uppercase font-bold tracking-widest text-5xl text-center"
              initial={{
                opacity: 0,
                x: -100,
              }}
              animate={{
                opacity: 1,
                x: -20,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                type: 'spring',
                damping: 8,
              }}
            >
              Join
            </motion.span>
            <motion.span
              className="uppercase font-bold tracking-widest text-5xl text-center text-primary"
              initial={{
                opacity: 0,
                x: 100,
              }}
              animate={{
                opacity: 1,
                x: 33,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                type: 'spring',
                damping: 8,
              }}
            >
              The
            </motion.span>
            <motion.span
              className="uppercase font-bold tracking-widest text-5xl text-center"
              initial={{
                opacity: 0,
                x: -100,
              }}
              animate={{
                opacity: 1,
                x: -5,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                type: 'spring',
                damping: 8,
              }}
            >
              ARK
            </motion.span>
            <motion.div
              initial={{
                opacity: 0,
                y: 100,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                type: 'spring',
                bounce: 0.3,
              }}
              className="!mt-4"
            >
              <Button className="px-24 text-black" size="lg" asChild>
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
            </motion.div>
          </div>
        </div>
        {/*  */}
        <Link href="#community" scroll>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'tween' }}
            viewport={{ once: true }}
            className="flex flex-col items-center space-y-1 group cursor-pointer"
          >
            <div className="w-full text-center -top-7 text-muted-foreground transition-colors group-hover:text-white text-sm">
              Explore More
            </div>
            <div className="relative">
              <HiChevronDoubleDown className="h-12 w-12 transition-colors group-hover:text-primary animate-pulse group-hover:animate-none " />
              <div className="w-12 h-12 absolute bg-primary inset-0 rounded-full -z-10 transition-colors group-hover:bg-white" />
            </div>
          </motion.div>
        </Link>
        {/*  */}
        <div className="mt-16 flex flex-col space-y-2 text-6xl font-bold tracking-wide"></div>
        {/*  */}
      </div>
    </div>
  );
};

export default Hero;
