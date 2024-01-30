import Image from 'next/image';

const NoData = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-[300px] max-w-3xl">
      <div className="w-full bg-background/50 rounded-tl-lg rounded-bl-lg">
        <h1 className="text-2xl font-bold text-center pt-2 px-2">We could not get your in-game account!</h1>
        <div className="p-4">
          <p className="text-muted-foreground">Make sure that</p>
          <ul>
            <li>You are logged into the website</li>
            <li>You have played on this wipe</li>
            <li>You have a tribe in-game</li>
            <li>Your Steam account is connected to your Discord</li>
          </ul>
          <p className="text-muted-foreground mt-4">Open a ticket if you still cannot see your in-game tribe</p>
        </div>
      </div>
      <div className="flex w-full relative overflow-hidden lg:rounded-tr-lg lg:rounded-br-lg">
        <Image
          src="/tribe/no-data.webp"
          alt="no data"
          width={300}
          height={300}
          className="object-cover w-full object-center rounded-br-lg rounded-bl-lg lg:rounded-none lg:rounded-tr-lg lg:rounded-br-lg hover:scale-110 transition-transform"
        />
      </div>
    </div>
  );
};

export default NoData;
