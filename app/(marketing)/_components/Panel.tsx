'use client';
import { itemSlide, staggerContainer } from '@/shared/lib/animate';
import { Button } from '@/shared/components/ui/button';
import { FaBook } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const Panel = () => {
  return (
    <div className="w-full py-24 relative px-6">
      <div className="flex flex-col md:flex-row justify-start md:space-x-8 lg:space-x-16">
        <div className="flex flex-col space-y-4">
          <div>
            <motion.div
              variants={itemSlide(0, -100)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-3xl space-x-2"
            >
              Our web <span className="px-2 bg-primary rounded-md">panel</span>
            </motion.div>
            <motion.div
              variants={itemSlide(0, 100)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="max-w-md mt-4 text-justify"
            >
              <span>
                Stay in the loop with our comprehensive in-game dashboard! Access statistics, check your in-game tribe
                log anytime, and stay informed even when you&apos;re not playing. Elevate your gaming experience with
                at-a-glance insights – because staying connected with your in-game world has never been this convenient!
              </span>
            </motion.div>
            <motion.div
              variants={itemSlide(0, -100)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="md:text-right mt-2"
            >
              <Button asChild className="w-1/2 text-black">
                <Link href="/dashboard/tribe/logs" target="_blank">
                  Open panel <FaBook className="h-6 w-6 ml-2" />
                </Link>
              </Button>
            </motion.div>
            <div className="mt-2 text-right md:text-left">
              <motion.span
                variants={itemSlide(0, 0)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="text-muted-foreground"
              >
                Coming soon
              </motion.span>
              <motion.ul
                className="ml-4"
                variants={staggerContainer()}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <motion.li variants={itemSlide(100, 0)}>Discord notifications when you are being raided</motion.li>
              </motion.ul>
            </div>
          </div>
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
        </div>
        <div className="mt-4 md:mt-0 relative flex flex-1 flex-col md:flex-row space-y-2 md:space-y-0">
          <div className="md:absolute w-full md:-translate-y-0 right-0 z-10">
            <motion.div variants={itemSlide(100, 0)} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <Image
                src="/tribe/filters.webp"
                width={0}
                height={0}
                sizes="100vw"
                className="object-contain object-center h-full w-full rounded-lg"
                alt="logs filter"
              />
              <div className="hidden md:block absolute w-full h-full inset-0 backdrop-blur-[1px] bg-black/10" />
            </motion.div>
          </div>
          <div className="md:absolute w-full md:translate-y-48 -right-24 z-10">
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
                className="object-cover object-center h-full w-full rounded-lg md:border-2 border-primary/50"
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
