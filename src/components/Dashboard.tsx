import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Brain, MessageCircle, FileText, Share, Download, ChevronLeft, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Flashcards from './Flashcards';
import Chat from './Chat';

export default function Dashboard({ session, onBack }: { session: any, onBack: () => void }) {
  const [view, setView] = useState<'suite' | 'flashcards'>('suite');
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Header Info Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600 cursor-pointer pointer-events-auto"
            title="Back to Library"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display leading-tight">{session.title || 'Untitled Session'}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Source: {session.fileName} • {session.flashcards?.length} flashcards generated</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setView('suite')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${view === 'suite' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Layout className="w-4 h-4" />
            Study Suite
          </button>
          <button 
            onClick={() => setView('flashcards')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${view === 'flashcards' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Brain className="w-4 h-4" />
            Active Recall
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {view === 'suite' ? (
            <motion.div 
              key="suite"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-12 gap-5 h-full"
            >
              {/* Summary Card */}
              <div className="col-span-12 lg:col-span-7 bento-tile h-full">
                <div className="flex items-center gap-2 mb-6 shrink-0">
                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                  <h2 className="font-display font-bold text-lg text-slate-800">Executive Summary</h2>
                </div>
                <div className="flex-1 overflow-auto pr-4 scrollbar-hide">
                  <div className="markdown-body">
                    <ReactMarkdown>{session.summary}</ReactMarkdown>
                  </div>
                  <div className="mt-8 bg-slate-50 p-5 rounded-2xl border-l-4 border-primary">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Key Concepts</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {session.keyConcepts?.map((concept: string, i: number) => (
                        <div key={i} className="flex gap-3 items-start group">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary mt-1.5 transition-colors" />
                          <p className="text-slate-600 text-xs leading-relaxed">{concept}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Flashcards Teaser & Chat */}
              <div className="col-span-12 lg:col-span-5 flex flex-col gap-5 h-full">
                <div className="bg-primary rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-100 h-48 shrink-0">
                  <div className="relative z-10 h-full flex flex-col">
                    <h3 className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mb-4">Study Flashcard</h3>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-base font-display font-medium leading-relaxed mb-4 line-clamp-3 italic">
                        " {showAnswer ? session.flashcards?.[0]?.a : session.flashcards?.[0]?.q || "Ready to test your knowledge?"} "
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-auto relative z-20">
                      <button 
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="text-[10px] font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity cursor-pointer p-2 -m-2"
                      >
                        {showAnswer ? 'Hide Answer' : 'Reveal Answer'}
                      </button>
                      <button 
                        onClick={() => setView('flashcards')}
                        className="text-xs font-bold bg-white text-primary px-4 py-2 rounded-xl shadow-sm hover:scale-105 transition-all cursor-pointer"
                      >
                        Open Full Deck
                      </button>
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="flex-1 bento-tile bg-bento-bg border-slate-100 p-0 overflow-hidden">
                  <Chat session={session} isBento />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="flashcards"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="h-full"
            >
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm h-full overflow-auto">
                <Flashcards cards={session.flashcards || []} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
