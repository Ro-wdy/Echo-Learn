import { GraduationCap, Plus, History, LogOut, FileText, ChevronRight, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';

export default function Sidebar({ sessions, activeSessionId, onSelectSession, onNew, user, onLogout }: any) {
  return (
    <aside className="w-72 bg-bento-bg border-r border-slate-100 flex flex-col">
      <div className="p-6 flex items-center gap-2 mb-4">
        <div className="bg-primary p-2 rounded-lg">
          <GraduationCap className="text-white w-5 h-5 shadow-sm" />
        </div>
        <span className="text-xl font-display font-bold text-primary tracking-tight">EchoLearn</span>
      </div>

      <div className="px-6 mb-8">
        <button 
          onClick={onNew}
          className="w-full btn-primary h-11 text-sm justify-center"
        >
          <Plus className="w-4 h-4" />
          New Upload
        </button>
      </div>

      <div className="flex-1 overflow-auto px-4 space-y-2">
        <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
          Recent Sessions
        </div>
        {sessions.map((session: any) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group text-left ${
              activeSessionId === session.id 
                ? 'bg-white border border-surface shadow-sm text-primary' 
                : 'text-slate-600 hover:bg-surface/50'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${activeSessionId === session.id ? 'bg-surface' : 'bg-slate-100'}`}>
              <FileText className={`w-3.5 h-3.5 ${activeSessionId === session.id ? 'text-primary' : 'text-slate-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-bold truncate leading-none mb-1">{session.fileName || session.title || 'Untitled'}</p>
               <p className="text-[10px] text-slate-400">2 hours ago</p>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl">
          <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full border border-slate-200" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{user.displayName}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
