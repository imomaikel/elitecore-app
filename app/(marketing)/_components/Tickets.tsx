'use client';
import { IoTicketOutline } from 'react-icons/io5';
import LandingWrapper from './LandingWrapper';
import ImageSwiper from './ImageSwiper';

const Tickets = () => {
  return (
    <div className="w-full py-12 relative px-6">
      <div className="absolute w-screen h-full inset-0 left-1/2 -translate-x-1/2 bg-white/5 -z-10" />
      <div className="flex flex-col md:flex-row justify-center md:space-x-8 lg:space-x-16">
        <div className="mt-4 md:mt-0">
          <div className="max-w-xl relative">
            <ImageSwiper
              images={[
                {
                  url: '/tickets/review.webp',
                  caption: 'Review your tickets',
                },
                {
                  url: '/tickets/message.webp',
                  caption: 'Send messages through the web panel',
                },
                {
                  url: '/tickets/controls.webp',
                  caption: 'Control your ticket',
                },
                {
                  url: '/tickets/notification.webp',
                  caption: 'Receive notifications on ticket close',
                },
              ]}
            />
          </div>
        </div>
        <LandingWrapper
          title="Our"
          colorTitle="ticket"
          extraTitle="system"
          buttonLink=""
          buttonText={
            <>
              Create a ticket <IoTicketOutline className="h-6 w-6 ml-2" />
            </>
          }
          description="Explore our streamlined support with a custom ticket system! Easily share your questions or issues,
          specify the related server, and enjoy transcriptions for clarity. Manage tickets effortlessly on our
          website or Discord for quick resolutions. Elevate your support experience with us!"
          textRight
          listHeader="Some features"
          listItems={[
            'Adding another member to the ticket',
            'Specify your in-game coordinates with validation',
            'Specify ticket-related server',
            'Pair your Discord with in-game and Steam account',
            'Instant transcription after close',
          ]}
        />
      </div>
      <div className="absolute bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rotate-45 w-[400px] h-[100px] top-1/4 blur-[180px] -z-10 opacity-75 hidden md:block" />
      <div className="absolute bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rotate-45 w-[400px] h-[100px] top-1/4 blur-[180px] -z-10 opacity-75 right-0" />
      <div className="absolute bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 w-[300px] h-[200px] right-1/3 top-0 -z-10 blur-[200px]" />
    </div>
  );
};

export default Tickets;
