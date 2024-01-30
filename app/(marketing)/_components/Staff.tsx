'use client';
import { itemSlide } from '@/shared/lib/animate';
import { motion } from 'framer-motion';
import { trpc } from '@/trpc';
import Member from './Member';

const Staff = () => {
  const { data: members } = trpc.getStaffMembers.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return (
    <div className="w-full py-24 relative px-6">
      <div className="flex flex-col">
        <div className="h-min flex flex-col w-full">
          <motion.div
            variants={itemSlide(0, -100)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-3xl space-x-2 text-center"
          >
            Our <span className="px-2 bg-primary rounded-md">staff</span>
          </motion.div>
          <motion.div
            variants={itemSlide(0, 100)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-xl mx-auto mt-4 text-center"
          >
            <span>
              Meet our dedicated staff! Committed to delivering the best gaming experience, we invite you to join our
              Discord server. Your journey does not end here – become a staff member in the future and play a vital role
              in shaping the community! Join us and be part of the gaming excellence we strive for!
            </span>
          </motion.div>
          <motion.div
            variants={itemSlide(0, -100)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="md:text-right mt-2"
          ></motion.div>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap gap-4 mt-4 justify-center min-h-[100px]">
          {members?.map((member, index) => (
            <motion.div
              key={member.id}
              variants={itemSlide(100, 0)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: 0.1 * index }}
            >
              <Member member={member} />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute -z-10 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 w-[300px] h-[100px] left-0 top-24 -rotate-45 blur-[150px]" />
      <div className="absolute -z-10 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 w-[300px] h-[100px] right-0 bottom-24 -rotate-45 blur-[150px]" />
    </div>
  );
};

export default Staff;
