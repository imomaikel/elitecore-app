'use client';
import { itemSlide, staggerContainer } from '@/shared/lib/animate';
import { Button } from '@/shared/components/ui/button';
import { FaDiscord } from 'react-icons/fa';
import ImageSwiper from './ImageSwiper';
import { motion } from 'framer-motion';
import { trpc } from '@/trpc';
import Link from 'next/link';
import Count from './Count';

const Community = () => {
  const { data: memberCount, isLoading } = trpc.getMembers.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return (
    <div className="w-full py-24 relative px-6">
      <div className="flex flex-col md:flex-row justify-center md:space-x-8 lg:space-x-16">
        <div>
          <motion.div
            variants={itemSlide(0, -100)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-3xl space-x-2"
          >
            Our <span className="px-2 bg-primary rounded-md">community</span>
          </motion.div>
          <motion.div
            variants={itemSlide(0, 100)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-md mt-4 text-justify"
          >
            <span>
              Join our vibrant Discord community. Engage in discussions about the game, seek support, team up with
              fellow members, explore in-game statistics, and discover many more exciting features. Don&apos;t miss out
              – be part of the <span className="tracking-wide font-bold">EliteCore</span> experience!
            </span>
            <div className="mt-2 text-lg md:text-right space-x-1">
              <span className="w-[55px] inline-block font-bold">
                {!isLoading && <Count countTo={memberCount ?? 7000} duration={2} />}
              </span>
              <span>members so far</span>
            </div>
          </motion.div>
          <motion.div
            variants={itemSlide(0, -100)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="md:text-right mt-2"
          >
            <Button asChild className="w-1/2 text-black">
              <Link href="https://discord.gg/RjbAsWs7H6" target="_blank">
                Join Discord <FaDiscord className="h-6 w-6 ml-2" />
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
              Moreover, you can
            </motion.span>
            <motion.ul
              className="ml-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <motion.li variants={itemSlide(100, 0)}>Track your in-game stats</motion.li>
              <motion.li variants={itemSlide(100, 0)}>See server statuses</motion.li>
              <motion.li variants={itemSlide(100, 0)}>Create tickets</motion.li>
              <motion.li variants={itemSlide(100, 0)}>and many more!</motion.li>
            </motion.ul>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <motion.div
            variants={itemSlide(0, 300)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <ImageSwiper
              images={[
                {
                  url: '/discord/chat1.webp',
                  caption: 'Talk about anything',
                },
                {
                  url: '/discord/chat2.webp',
                  caption: 'See the most recent announcements',
                },
                {
                  url: '/discord/chat3.webp',
                  caption: 'Share your content',
                },
                {
                  url: '/discord/chat4.webp',
                  caption: 'Team up with other members',
                },
              ]}
            />
          </motion.div>
        </div>
      </div>
      <div className="absolute bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rotate-45 w-[400px] h-[100px] top-1/4 blur-[180px] -z-10 opacity-75 hidden md:block" />
      <div className="absolute bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rotate-45 w-[400px] h-[100px] top-1/4 blur-[180px] -z-10 opacity-75 right-0" />
    </div>
  );
};

export default Community;
