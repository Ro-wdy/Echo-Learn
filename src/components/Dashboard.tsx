import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Brain, MessageCircle, FileText, Share, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Flashcards from './Flashcards';
import Chat from './Chat';

export default function Dashboard({ session }: any) {
  return (
    <div className="grid grid-cols-12 grid-rows-6 gap-5 h-full">
      {/* Header Info Card */}
      <div className="col-span-12 row-span-1 bg-surface rounded-2xl p-5 border border-blue-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary font-display">{session.title || 'Untitled Session'}</h1>
          <p className="text-sm text-slate-500">Source: {session.fileName} • Study suite generated via Gemini 1.5 Flash</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100 text-primary">Flashcards: {session.flashcards?.length}</span>
           <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100 text-primary">Read Time: 8m</span>
        </div>
      </div>

      {/* Summary Card */}
      <div className="col-span-12 lg:col-span-7 row-span-5 bento-tile">
        <div className="flex items-center gap-2 mb-6">
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

      {/* Right Column: Flashcards & Chat */}
      <div className="col-span-12 lg:col-span-5 row-span-2 bg-primary rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-100">
        <div className="relative z-10 h-full flex flex-col">
          <h3 className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mb-6">Study Flashcard</h3>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-lg font-display font-medium leading-relaxed mb-6 line-clamp-4 italic">
              " {session.flashcards?.[0]?.q || "Ready to test your knowledge?"} "
            </p>
          </div>
          <div className="flex justify-between items-center mt-auto">
            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest leading-none">Question Sneak Peek</span>
            <button className="text-xs font-bold bg-white text-primary px-5 py-2.5 rounded-xl shadow-sm hover:scale-105 transition-all">Reveal Answer</button>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-4 right-4 text-white/20">
          <Brain className="w-12 h-12" />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5 row-span-3 bento-tile bg-bento-bg border-slate-100 p-0">
        <Chat session={session} isBento />
      </div>
    </div>
  );
}
