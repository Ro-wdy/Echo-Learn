import { useState, useRef } from 'react';
import { Upload, File, X, Check, Brain, Loader2, Youtube, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { processFile, processText } from '../services/geminiService';

export default function UploadArea({ onProcessStart, onProcessEnd, userId }: any) {
  const [mode, setMode] = useState<'file' | 'youtube'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (mode === 'file' && !file) return;
    if (mode === 'youtube' && !youtubeUrl) return;

    try {
      onProcessStart();
      
      let studyResult;
      let sessionTitle = '';
      let sourceName = '';

      if (mode === 'file' && file) {
        sourceName = file.name;
        sessionTitle = file.name.split('.')[0];
        
        // 1. Upload to Firebase Storage
        const storageRef = ref(storage, `uploads/${userId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // 2. Convert to base64 for Gemini
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(file);
        });
        
        const base64Data = await base64Promise;
        
        // 3. Process with Gemini
        studyResult = await processFile(base64Data, file.type);
      } else if (mode === 'youtube') {
        sourceName = 'YouTube Lecture';
        sessionTitle = 'YouTube Study Session';
        
        // 1. Fetch transcript from server
        const response = await fetch(`/api/youtube-transcript?url=${encodeURIComponent(youtubeUrl)}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch transcript");
        }
        const { transcript } = await response.json();
        
        // 2. Process with Gemini
        studyResult = await processText(transcript);
      }

      if (!studyResult) throw new Error("Processing failed");

      // Store in Firestore
      const docRef = await addDoc(collection(db, 'sessions'), {
        userId,
        fileName: sourceName,
        title: sessionTitle,
        summary: studyResult.summary,
        keyConcepts: studyResult.keyConcepts,
        flashcards: studyResult.flashcards,
        createdAt: serverTimestamp(),
        sourceUrl: mode === 'youtube' ? youtubeUrl : null,
      });

      onProcessEnd({ id: docRef.id, ...studyResult, fileName: sourceName, userId });
      
    } catch (err: any) {
      console.error("Upload/Process error:", err);
      alert(err.message || "Failed to process material. Please try again.");
      onProcessEnd(null); // Reset processing state in App
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Mode Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 w-fit mx-auto">
        <button 
          onClick={() => setMode('file')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'file' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <File className="w-4 h-4" />
          File Upload
        </button>
        <button 
          onClick={() => setMode('youtube')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'youtube' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Youtube className="w-4 h-4" />
          YouTube Link
        </button>
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); if (mode === 'file') setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleDrop}
        onClick={() => mode === 'file' && !file && fileInputRef.current?.click()}
        className={`relative aspect-[16/9] bg-white border border-slate-100 shadow-sm rounded-3xl transition-all duration-300 flex flex-col items-center justify-center border-2 border-dashed ${
          mode === 'file' 
            ? (isHovering ? 'border-primary bg-surface/50 cursor-pointer' : file ? 'border-primary/30 cursor-default' : 'border-slate-200 hover:border-primary/50 cursor-pointer')
            : 'border-slate-100 cursor-default p-10'
        }`}
      >
        {mode === 'file' ? (
          <>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf,image/*"
              className="hidden" 
            />

            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-lg font-display font-bold text-slate-900">Click or drag your material</p>
                  <p className="text-sm text-slate-400 mt-1">Accepts PDFs, Images (max 20MB)</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="file"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center relative shadow-sm border border-blue-100">
                    <File className="w-10 h-10 text-primary" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 shadow-sm"
                    >
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                  <p className="mt-4 font-bold text-slate-900 text-lg">{file.name}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">Ready for magic</p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="w-full max-w-md text-center">
             <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Youtube className="w-8 h-8 text-red-500" />
             </div>
             <h3 className="text-lg font-display font-bold text-slate-900 mb-2">Paste YouTube Lecture</h3>
             <p className="text-sm text-slate-400 mb-6">EchoLearn will extract the transcript and build your suite.</p>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <LinkIcon className="h-4 w-4 text-slate-300" />
                </div>
                <input 
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                />
             </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {(file || (mode === 'youtube' && youtubeUrl)) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-8 flex justify-center"
          >
            <button 
              onClick={handleUpload}
              className="btn-primary h-14 px-10 text-lg shadow-lg shadow-blue-100"
            >
              <Brain className="w-5 h-5" />
              Generate Study Suite
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
