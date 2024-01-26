import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { MdCardGiftcard } from 'react-icons/md';
import { motion } from 'framer-motion';

type TGiftCardApplied = {
  className?: string;
};
const GiftCardApplied = ({ className }: TGiftCardApplied) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 200,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      className={className}
    >
      <Alert className="max-w-sm font-semibold relative overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 absolute w-full h-full inset-0 rounded-lg z-0 blur-[20px] opacity-75" />
        <MdCardGiftcard className="h-6 w-6" />
        <AlertTitle className="font-bold relative z-10">Gift Card Added!</AlertTitle>
        <AlertDescription className="z-10 relative">
          Prices have been updated according to the gift card!
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default GiftCardApplied;
