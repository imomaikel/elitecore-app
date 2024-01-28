'use client';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { ElementRef, useEffect, useRef } from 'react';

type TCount = {
  countTo: number;
  duration: number;
};
const Count = ({ countTo, duration }: TCount) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const ref = useRef<ElementRef<'span'>>(null);
  const isInView = useInView(ref);

  const animation = animate(count, countTo, { autoplay: false, duration });

  useEffect(() => {
    if (isInView) {
      animation.play();
    } else {
      animation.stop();
    }

    return animation.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};

export default Count;
