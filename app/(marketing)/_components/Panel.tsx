'use client';
import { itemSlide } from '@/shared/lib/animate';
import LandingWrapper from './LandingWrapper';
import { FaBook } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import Image from 'next/image';

const Panel = () => {
  return (
    <div className="w-full py-24 pb-48 relative px-6">
      <div className="flex flex-col lg:flex-row justify-start lg:space-x-8 xl:space-x-16">
        <LandingWrapper
          className="flex flex-col space-y-4 max-w-md"
          title="Our web"
          colorTitle="panel"
          description="Stay in the loop with our comprehensive in-game dashboard! Access statistics, check your in-game tribe
          log anytime, and stay informed even when you're not playing. Elevate your gaming experience with
          at-a-glance insights – because staying connected with your in-game world has never been this convenient!"
          buttonLink="/dashboard/tribe/logs"
          buttonText={
            <>
              Open panel <FaBook className="h-6 w-6 ml-2" />
            </>
          }
          textRight
          listHeader="Coming soon"
          listItems={['Discord notifications when you are being raided']}
          extraContent={
            <motion.div
              variants={itemSlide(100, 0)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="relative max-w-md"
            >
              <Image
                src="/tribe/chart.webp"
                width={0}
                height={0}
                sizes="100vw"
                className="object-contain object-center h-full w-full rounded-lg"
                alt="logs"
              />
            </motion.div>
          }
        />

        <div className="mt-4 lg:mt-0 relative flex flex-1 flex-col lg:flex-row space-y-2 lg:space-y-0">
          <div className="lg:absolute w-full lg:-translate-y-0 right-0 z-10">
            <motion.div variants={itemSlide(100, 0)} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <Image
                src="/tribe/filters.webp"
                width={0}
                height={0}
                sizes="100vw"
                className="object-contain object-center h-full w-full rounded-lg"
                alt="logs filter"
              />
              <div className="hidden lg:block absolute w-full h-full inset-0 backdrop-blur-[1px] bg-black/10" />
            </motion.div>
          </div>
          <div className="lg:absolute w-full lg:translate-y-48 2xl:-right-24 z-10">
            <motion.div
              variants={itemSlide(100, 0)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
            >
              <Image
                src="/tribe/logs.webp"
                width={0}
                height={0}
                sizes="100vw"
                className="object-cover object-center h-full w-full rounded-lg lg:border-2 border-primary/50"
                alt="logs"
              />
            </motion.div>
          </div>
        </div>
      </div>
      <div className="absolute bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 inset-0 -z-10 w-[550px] h-[200px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 blur-[225px] opacity-75" />
      <div className="absolute bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 w-[300px] h-[200px] left-0 top-1/3 -z-10 blur-[200px]" />
    </div>
  );
};

export default Panel;
