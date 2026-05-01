import { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Bot, Loader2, Info, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { chatWithStudyMaterial } from '../services/geminiService';

export default function Chat({ session, isBento }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session.id) return;
    
    const q = query(
      collection(db, `sessions/${session.id}/messages`),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    return () => unsubscribe();
  }, [session.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      await addDoc(collection(db, `sessions/${session.id}/messages`), {
        sender: 'user',
        text: userText,
        createdAt: serverTimestamp(),
      });

      const history = messages.map(m => ({
        role: (m.sender === 'user' ? 'user' : 'model') as "user" | "model",
        content: String(m.text)
      }));
      
      const response = await chatWithStudyMaterial(
        `Summary: ${session.summary}\nKey Concepts: ${session.keyConcepts.join(', ')}`,
        history,
        userText
      );

      await addDoc(collection(db, `sessions/${session.id}/messages`), {
        sender: 'ai',
        text: response,
        createdAt: serverTimestamp(),
      });

    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isBento ? '' : 'max-w-3xl mx-auto h-[600px] glass-card overflow-hidden'}`}>
      <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
               <span className="text-xs">✨</span>
            </div>
            <h3 className="font-display font-bold text-slate-800 text-sm">Socratic Tutor</h3>
         </div>
         <span className="text-[10px] text-green-500 font-bold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            AI Online
         </span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto p-5 space-y-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="text-center py-10 opacity-50">
             <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
             <p className="text-[10px] font-bold uppercase tracking-widest">Ask a follow-up</p>
          </div>
        )}
        
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
             <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
               m.sender === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
             }`}>
                {m.text}
             </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
             <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none">
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-white">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="w-full h-11 pl-4 pr-12 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-xs"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 top-1.5 w-8 h-8 text-primary flex items-center justify-center hover:bg-surface rounded-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
