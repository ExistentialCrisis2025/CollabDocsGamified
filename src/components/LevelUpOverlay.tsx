import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import JSConfetti from "js-confetti";
import { useEffect } from "react";

interface LevelUpOverlayProps {
  level: number;
  onClose: () => void;
}

const LevelUpOverlay = ({ level, onClose }: LevelUpOverlayProps) => {
  useEffect(() => {
    const jsConfetti = new JSConfetti();
    jsConfetti.addConfetti({
      confettiColors: [
        "#facc15", "#f97316", "#3b82f6", "#10b981", "#ef4444", "#a855f7"
      ],
      confettiNumber: 150,
    });

    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative flex flex-col items-center justify-center p-10 bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-400/50 rounded-3xl shadow-[0_0_80px_rgba(99,102,241,0.6)]"
        initial={{ scale: 0.5, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.5, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div 
           initial={{ rotate: -180, scale: 0 }}
           animate={{ rotate: 0, scale: 1 }}
           transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
           className="w-32 h-32 mb-6 bg-gradient-to-tr from-yellow-300 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50"
        >
          <Trophy className="w-16 h-16 text-white" />
        </motion.div>
        
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-2 drop-shadow-sm uppercase tracking-wider">
          Level Up!
        </h2>
        
        <p className="text-xl text-indigo-100 font-medium mb-6">
          You have reached <span className="font-bold text-white text-2xl">Level {level}</span>
        </p>

        <button 
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-colors shadow-sm"
        >
          Awesome!
        </button>
      </motion.div>
    </motion.div>
  );
};

export default LevelUpOverlay;