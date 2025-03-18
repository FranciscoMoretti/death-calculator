import { motion } from 'framer-motion';

export const HeartbeatAnimation = () => {
  return (
    <motion.div
      className="absolute inset-0 bg-red-600/10 rounded-full"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};
