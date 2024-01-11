import RecentPayments from './_components/RecentPayments';
import TopDonators from './_components/TopDonators';
import PaymentGoal from './_components/PaymentGoal';
import ForYou from './_components/ForYou';

const DashboardPage = () => {
  return (
    <div className="flex flex-col xl:flex-row lg:space-x-3 xl:space-x-16 space-y-10 lg:space-y-0">
      <div className="space-y-6 max-w-[400px] lg:max-w-[450px] xl:max-w-[600px]">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-primary z-10 relative whitespace-nowrap">
            Welcome to the EliteCore
          </h1>
          <p className="max-w-[480px] whitespace-break-spaces text-justify z-10 relative">
            EliteCore is a x1000 cluster with a friendly and healthy community. In order to get you started and ready
            for pvp quickly, we have great kits and a large shop! On our site you will find all the information you
            require. From game links all the way to donations!
          </p>
          <div className="bg-gradient-to-r from-yellow-600 to-red-600 absolute w-[75%] left-[10%] top-[20%] h-[75%] rotate-45 blur-[220px] opacity-75 z-0" />
        </div>
        <TopDonators />
        <RecentPayments />
        <PaymentGoal />
      </div>
      <ForYou />
    </div>
  );
};

export default DashboardPage;
