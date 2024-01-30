'use client';
import { itemSlide } from '@/shared/lib/animate';
import LandingWrapper from './LandingWrapper';
import { FaDiscord } from 'react-icons/fa';
import ImageSwiper from './ImageSwiper';
import { motion } from 'framer-motion';
import { trpc } from '@/trpc';
import Count from './Count';

const Community = () => {
  const { data: memberCount, isLoading } = trpc.getMembers.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return (
    <div className="w-full py-24 relative px-6">
      <div className="flex flex-col md:flex-row justify-center md:space-x-8 lg:space-x-16">
        <LandingWrapper
          title="Our"
          colorTitle="community"
          buttonLink="https://discord.gg/RjbAsWs7H6"
          buttonText={
            <>
              Join Discord <FaDiscord className="h-6 w-6 ml-2" />
            </>
          }
          description={
            <>
              <span>
                Join our vibrant Discord community. Engage in discussions about the game, seek support, team up with
                fellow members, explore in-game statistics, and discover many more exciting features. Don&apos;t miss
                out – be part of the <span className="tracking-wide font-bold">EliteCore</span> experience!
              </span>
              <div className="mt-2 text-lg md:text-right space-x-1">
                <span className="w-[55px] inline-block font-bold">
                  {!isLoading && <Count countTo={memberCount ?? 7000} duration={2} />}
                </span>
                <span>members so far</span>
              </div>
            </>
          }
          textRight
          listHeader="Moreover, you can"
          listItems={['Track your in-game stats', 'See server statuses', 'Create tickets', 'and many more!']}
        />

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
      <div className="absolute bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 w-[300px] h-[200px] left-0 top-1/3 -z-10 blur-[200px]" />
      <div className="absolute bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rotate-45 w-[400px] h-[100px] top-1/4 blur-[180px] -z-10 opacity-75 right-0" />
    </div>
  );
};

export default Community;
