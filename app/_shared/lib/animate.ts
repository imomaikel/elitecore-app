export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
    },
  },
};

export const itemSlide = (y: number, x: number) => {
  return {
    hidden: { opacity: 0, y, x },
    show: { opacity: 1, y: 0, x: 0 },
  };
};
