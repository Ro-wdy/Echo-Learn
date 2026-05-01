import { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { LogIn, GraduationCap, Plus, History, LogOut, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import UploadArea from './components/UploadArea';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        fetchSessions(u.uid);
      } else {
        setSessions([]);
        setActiveSession(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchSessions = async (userId: string) => {
    try {
      const q = query(
        collection(db, 'sessions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSessions(docs);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  const handleNewSession = (session: any) => {
    setSessions(prev => [session, ...prev]);
    setActiveSession(session);
    setIsProcessing(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage onSignIn={signInWithGoogle} />;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar 
        sessions={sessions} 
        activeSessionId={activeSession?.id} 
        onSelectSession={setActiveSession}
        onNew={() => setActiveSession(null)}
        user={user}
        onLogout={logout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-white p-6">
        <div className="h-full">
          <AnimatePresence mode="wait">
            {!activeSession ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto mt-20"
              >
                <div className="mb-10 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface text-primary rounded-full text-xs font-bold mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span>AI-Powered Study Suite</span>
                  </div>
                  <h1 className="text-4xl font-display font-bold text-slate-900 mb-2 tracking-tight">Ready to master something new?</h1>
                  <p className="text-slate-500">Upload your material and let EchoLearn do the rest.</p>
                </div>
                
                <UploadArea 
                  onProcessStart={() => setIsProcessing(true)}
                  onProcessEnd={handleNewSession}
                  userId={user.uid}
                />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full relative z-0"
              >
                <Dashboard session={activeSession} onBack={() => setActiveSession(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Processing Loader Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-primary animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary" />
            </div>
            <h2 className="mt-8 text-xl font-display font-bold text-slate-900">EchoLearn is reading...</h2>
            <div className="mt-4 max-w-sm text-center px-6">
              <EducationalTips />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EducationalTips() {
  const tips = [
    "Did you know? Spaced repetition can improve memory retention by 50%.",
    "Study tip: Teaching someone else a concept is the best way to master it yourself.",
    "Breathe. Taking 5-minute breaks every hour keeps your brain sharp.",
    "Pro-tip: Active recall is far more effective than passive reading.",
    "Hydration is key. Your brain is 75% water!"
  ];
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.p 
      key={tipIndex}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="text-slate-500 italic text-sm"
    >
      {tips[tipIndex]}
    </motion.p>
  );
}
