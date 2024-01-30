'use client';
import { itemSlide, staggerContainer } from '@/shared/lib/animate';
import { Button } from '@/shared/components/ui/button';
import { IoTicketOutline } from 'react-icons/io5';
import ImageSwiper from './ImageSwiper';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Tickets = () => {
  return (
    <div className="w-full py-12 relative px-6">
      <div className="absolute w-screen h-full inset-0 left-1/2 -translate-x-1/2 bg-white/5 -z-10" />
      <div className="flex flex-col md:flex-row justify-center md:space-x-8 lg:space-x-16">
        <div className="mt-4 md:mt-0">
          <div className="max-w-xl relative">
            <div className="absolute w-full h-full inset-0 z-10 backdrop-blur-xl rounded-md" />
            <ImageSwiper
              images={[
                {
                  url: '/discord/chat1.webp',
                },
              ]}
            />
          </div>
        </div>
        <div>
          <motion.div
            variants={itemSlide(0, -100)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-3xl space-x-2"
          >
            Our <span className="px-2 bg-primary rounded-md">ticket</span> system
          </motion.div>
          <motion.div
            variants={itemSlide(0, 100)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-md mt-4 text-justify"
          >
            <span>
              Explore our streamlined support with a custom ticket system! Easily share your questions or issues,
              specify the related server, and enjoy transcriptions for clarity. Manage tickets effortlessly on our
              website or Discord for quick resolutions. Elevate your support experience with us!
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
              <Link href="/dashboard/tickets/create">
                Create a ticket <IoTicketOutline className="h-6 w-6 ml-2" />
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
              Some features
            </motion.span>
            <motion.ul
              className="ml-4"
              variants={staggerContainer()}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <motion.li variants={itemSlide(100, 0)}>Adding another member to the ticket.</motion.li>
              <motion.li variants={itemSlide(100, 0)}>Specify your in-game coordinates with validation</motion.li>
              <motion.li variants={itemSlide(100, 0)}>Specify ticket-related server</motion.li>
              <motion.li variants={itemSlide(100, 0)}>Pair your Discord with in-game and Steam account</motion.li>
              <motion.li variants={itemSlide(100, 0)}>Instant transcription after close</motion.li>
            </motion.ul>
          </div>
        </div>
      </div>
      <div className="absolute bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rotate-45 w-[400px] h-[100px] top-1/4 blur-[180px] -z-10 opacity-75 hidden md:block" />
      <div className="absolute bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rotate-45 w-[400px] h-[100px] top-1/4 blur-[180px] -z-10 opacity-75 right-0" />
    </div>
  );
};

export default Tickets;
