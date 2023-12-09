import { Progress } from '@/shared/components/ui/progress';
import UserMention from './_components/UserMention';
import ProductBox from '../_assets/components/shared/ProductBox';

const DashboardPage = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-primary">Welcome to the EliteCore</h1>
          <p className="max-w-[480px] whitespace-break-spaces text-justify">
            EliteCore is a x1000 cluster with a friendly and healthy community. In order to get you started and ready
            for pvp quickly, we have great kits and a large shop! On our site you will find all the information you
            require. From game links all the way to donations!
          </p>
        </div>
        {/* Top Donator */}
        <div>
          <h1 className="font-semibold text-xl md:text-2xl text-primary">Top Donator</h1>
          <UserMention avatarURL="" username="imomaikel" text="Paid the most this month" />
        </div>
        {/* Recent Payments */}
        <div>
          <h1 className="font-semibold text-xl md:text-2xl text-primary">Recent Payments</h1>
          <div className="flex flex-col gap-y-2">
            <UserMention avatarURL="" username="imomaikel" />
            <UserMention avatarURL="" username="imomaikel" />
            <UserMention avatarURL="" username="imomaikel" />
            <UserMention avatarURL="" username="imomaikel" />
          </div>
        </div>
        {/* Payment Goal */}
        <div>
          <h1 className="font-semibold text-xl md:text-2xl text-primary">Monthly Costs</h1>
          <div>
            <Progress value={50} />
          </div>
          <p>50% completed</p>
        </div>
      </div>
      {/* Top Picks */}
      <div>
        <h1 className="font-semibold text-xl md:text-2xl text-primary">Top Picks</h1>
        <div className="grid grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 2xl:gap-6">
          <ProductBox basePrice={5} description="Basic Kit" imageURL="/cyan.png" name="Basic kit" productId={13} />
          <ProductBox basePrice={10} description="VIP Kit" imageURL="/green.png" name="VIP kit" productId={12} />
          <ProductBox basePrice={15} description="Extra Kit" imageURL="/mixed.png" name="Extra kit" productId={15} />
          <ProductBox basePrice={15} description="Extra Kit" imageURL="/mixed.png" name="Extra kit" productId={15} />
          <ProductBox basePrice={15} description="Extra Kit" imageURL="/mixed.png" name="Extra kit" productId={15} />
          <ProductBox basePrice={15} description="Extra Kit" imageURL="/mixed.png" name="Extra kit" productId={15} />
          <ProductBox basePrice={15} description="Extra Kit" imageURL="/mixed.png" name="Extra kit" productId={15} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
