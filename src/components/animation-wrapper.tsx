import { motion } from "framer-motion";

type AnimationType = "fade" | "slide" | "slideUp" | "scale" | "fadeSlide";

interface AnimatedContainerProps {
  children: React.ReactNode;
  type?: AnimationType;
  delay?: number;
  duration?: number;
  animate?: boolean;
}

const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: -3 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 3 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -3 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  fadeSlide: {
    initial: { opacity: 0, y: 3 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -3 },
  },
};

const defaultDurations = {
  fade: 0.2,
  slide: 0.3,
  slideUp: 0.4,
  scale: 0.3,
  fadeSlide: 0.2,
};

const AnimatedContainer = ({
  children,
  type = "fadeSlide",
  delay = 0,
  duration,
  animate = true,
}: AnimatedContainerProps) => {
  if (!animate) {
    return <>{children}</>;
  }

  return (
    <motion.div
      variants={animations[type]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: duration || defaultDurations[type],
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContainer;
