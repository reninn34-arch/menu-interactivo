import { useAnimation, useSpring, useTransform, MotionValue, Variants } from 'motion/react';

export const pageTransition: Variants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const staggerContainer: Variants = {
  enter: { transition: { staggerChildren: 0.05 } },
};

export const listItem: Variants = {
  enter: { opacity: 0, x: -20 },
  center: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  enter: { opacity: 0, scale: 0.9 },
  center: { opacity: 1, scale: 1 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export const useScrollProgress = (scrollY: MotionValue<number>) => {
  const progress = useTransform(scrollY, [0, 300], [0, 1]);
  return progress;
};

export const useSlideAnimation = (direction: 'left' | 'right' | 'up' | 'down' = 'up') => {
  const directions = {
    left: { x: -100 },
    right: { x: 100 },
    up: { y: 100 },
    down: { y: -100 },
  };

  const variants: Variants = {
    enter: { opacity: 0, ...directions[direction] },
    center: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...directions[direction] },
  };

  return variants;
};

export const springTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

export const gentleTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};

export const bounceTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 15,
};