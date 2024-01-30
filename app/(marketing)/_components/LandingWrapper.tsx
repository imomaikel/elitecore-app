'use client';
import { itemSlide, staggerContainer } from '@/shared/lib/animate';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';

type TLandingWrapper = {
  description: React.ReactNode;
  title: string;
  extraTitle?: string;
  colorTitle: string;
  buttonText: React.ReactNode;
  buttonLink: string;
  listHeader?: string;
  listItems?: string[];
  extraContent?: React.ReactNode;
  className?: string;
  extraButton?: React.ReactNode;
  textRight?: boolean;
};
const LandingWrapper = ({
  description,
  colorTitle,
  title,
  buttonLink,
  buttonText,
  listHeader,
  listItems,
  extraContent,
  className,
  extraButton,
  textRight,
  extraTitle,
}: TLandingWrapper) => {
  return (
    <div className={className}>
      <div className="relative z-10">
        <motion.div
          variants={itemSlide(0, -100)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-3xl space-x-2"
        >
          {title} <span className="px-2 bg-primary rounded-md">{colorTitle}</span> {extraTitle}
        </motion.div>
        <motion.div
          variants={itemSlide(0, 100)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-md mt-4 text-justify"
        >
          <div>{description}</div>
        </motion.div>
        <motion.div
          variants={itemSlide(0, -100)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className={cn('md:text-right mt-2 flex space-x-2 items-center', textRight && 'justify-end')}
        >
          <Button asChild className="w-1/2 text-black">
            <Link href={buttonLink}>{buttonText}</Link>
          </Button>
          {extraButton}
        </motion.div>
        {listHeader && listItems && (
          <div className="mt-2 text-right md:text-left">
            <motion.span
              variants={itemSlide(0, 0)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-muted-foreground"
            >
              {listHeader}
            </motion.span>
            <motion.ul
              className="ml-4"
              variants={staggerContainer()}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {listItems.map((item) => (
                <motion.li key={item} variants={itemSlide(100, 0)}>
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        )}
      </div>
      {extraContent}
    </div>
  );
};

export default LandingWrapper;
