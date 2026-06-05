import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';

export default function Toast() {
  const { toast } = useMovieStore();

  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-9999 flex items-center gap-3 px-6 h-14 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-medium whitespace-nowrap shadow-xl"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
        >
          <CheckCircle size={20} fill="white" className="text-black shrink-0" />
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
