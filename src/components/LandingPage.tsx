import { LogIn, GraduationCap, Sparkles, BookOpen, Brain, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-display font-bold text-slate-900">EchoLearn</span>
        </div>
        <button 
          onClick={onSignIn}
          className="btn-primary"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface text-primary rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Study Suite</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-display font-bold text-slate-900 leading-[1.1] mb-8">
            Study <span className="text-primary italic">Smarter</span>, Not Harder.
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
            Upload your lecture notes, PDFs, or images and let EchoLearn transform them into summaries, interactive flashcards, and a personal tutor.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onSignIn}
              className="btn-primary h-14 px-8 text-lg"
            >
              Get Started for free
            </button>
            <div className="flex items-center gap-2 text-slate-500">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
                ))}
              </div>
              <span className="text-sm font-medium">Joined by 2,000+ students</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="aspect-square bg-surface rounded-full absolute -inset-10 -z-10 blur-3xl opacity-50" />
          <div className="glass-card p-4 relative overflow-hidden border-2 border-slate-100">
             <div className="grid grid-cols-2 gap-4">
                <FeatureCard icon={BookOpen} title="Summaries" color="bg-blue-100 text-blue-600" />
                <FeatureCard icon={Brain} title="Flashcards" color="bg-indigo-100 text-indigo-600" />
                <FeatureCard icon={MessageCircle} title="Socratic Chat" color="bg-emerald-100 text-emerald-600" />
                <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-end">
                   <div className="text-slate-400 text-sm mb-1">Success Rate</div>
                   <div className="text-2xl font-display font-bold text-slate-900">98.2%</div>
                </div>
             </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100">
      <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-display font-bold text-slate-900">{title}</h3>
    </div>
  );
}
