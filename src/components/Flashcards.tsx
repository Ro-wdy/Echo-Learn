import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Flashcards({ cards }: { cards: { q: string, a: string }[] }) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = cards[index];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setIndex((i) => (i - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
         <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
               <Brain className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
               <h3 className="font-display font-bold text-slate-900">Active Recall</h3>
               <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Card {index + 1} of {cards.length}</p>
            </div>
         </div>
         <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-500" 
              animate={{ width: `${((index + 1) / cards.length) * 100}%` }}
            />
         </div>
      </div>

      <div 
        className="relative h-[380px] perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden glass-card p-10 flex flex-col items-center justify-center text-center">
            <div className="text-xs font-bold text-indigo-400 mb-6 tracking-widest uppercase">Question</div>
            <p className="text-2xl font-display font-bold text-slate-900 leading-snug">{card.q}</p>
            <div className="absolute bottom-6 text-slate-300 text-xs font-medium uppercase tracking-widest">Click to reveal answer</div>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 backface-hidden glass-card p-10 flex flex-col items-center justify-center text-center bg-indigo-50 border-indigo-100"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="text-xs font-bold text-indigo-500 mb-6 tracking-widest uppercase">Answer</div>
            <p className="text-xl text-slate-700 leading-relaxed">{card.a}</p>
            <div className="absolute bottom-6 text-indigo-300 text-xs font-medium uppercase tracking-widest">Click to flip back</div>
          </div>
        </motion.div>
      </div>

      <div className="mt-10 flex items-center justify-center gap-4">
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="btn-primary h-12 px-8 rounded-full shadow-lg shadow-blue-100"
        >
          Next Card
          <ChevronRight className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setIndex(0)}
          className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all shadow-sm"
          title="Restart"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
