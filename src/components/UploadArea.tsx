import { useState, useRef } from 'react';
import { Upload, File, X, Check, Brain, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { processFile } from '../services/geminiService';

export default function UploadArea({ onProcessStart, onProcessEnd, userId }: any) {
  const [file, setFile] = useState<File | null>(null);
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
    if (!file) return;

    try {
      onProcessStart();
      
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
      const result = await processFile(base64Data, file.type);
      
      // 4. Store in Firestore
      const docRef = await addDoc(collection(db, 'sessions'), {
        userId,
        fileName: file.name,
        fileURL: downloadURL,
        title: file.name.split('.')[0],
        summary: result.summary,
        keyConcepts: result.keyConcepts,
        flashcards: result.flashcards,
        createdAt: serverTimestamp(),
      });

      onProcessEnd({ id: docRef.id, ...result, fileName: file.name, userId });
      
    } catch (err) {
      console.error("Upload/Process error:", err);
      alert("Failed to process file. Please try again.");
      onProcessEnd(null); // Reset processing state in App
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
        className={`relative aspect-[16/9] glass-card flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer ${
          isHovering ? 'border-primary bg-surface/50' : file ? 'border-primary/30' : 'border-slate-200 hover:border-primary/50'
        }`}
      >
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
      </div>

      <AnimatePresence>
        {file && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-8 flex justify-center"
          >
            <button 
              onClick={handleUpload}
              className="btn-primary h-14 px-10 text-lg shadow-lg shadow-blue-200"
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
