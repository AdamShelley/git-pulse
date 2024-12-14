import { motion } from "framer-motion";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 5,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -5,
  },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};

export const AnimatedPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};
