'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Video, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropzoneProps {
  onFileSelect: (file: File | string) => void;
  className?: string;
  accept?: string;
}

export function Dropzone({ onFileSelect, className, accept = 'image/*,video/*' }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileSelect(url);
    } else {
      onFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer group',
        isDragging
          ? 'border-[#14F1D9] bg-[rgba(20,241,217,0.05)] shadow-[0_0_30px_rgba(20,241,217,0.15)]'
          : 'border-white/[0.12] bg-white/[0.02] hover:border-[rgba(20,241,217,0.4)] hover:bg-white/[0.04]',
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />
      
      <AnimatePresence>
        {preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={clear}
                className="bg-[rgba(255,77,109,0.2)] text-[#FF4D6D] border border-[#FF4D6D]/40 rounded-full p-2 hover:bg-[#FF4D6D] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center px-6"
          >
            <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-[rgba(20,241,217,0.15)] to-[rgba(124,92,255,0.15)] border border-[rgba(20,241,217,0.2)] flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(20,241,217,0.2)] transition-all duration-300">
              <UploadCloud className="w-8 h-8 text-[#14F1D9]" />
            </div>
            <h3 className="text-sm font-semibold text-[#F0F4FF] mb-1">Upload Media for Analysis</h3>
            <p className="text-xs text-[#8B9AB4] mb-4 max-w-[240px]">Drag and drop CCTV footage or images, or click to browse files.</p>
            <div className="flex gap-3">
              <span className="flex items-center gap-1.5 text-[10px] text-[#4A5568] bg-white/[0.04] px-2 py-1 rounded-md border border-white/[0.05]">
                <ImageIcon className="w-3 h-3" /> JPG, PNG
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-[#4A5568] bg-white/[0.04] px-2 py-1 rounded-md border border-white/[0.05]">
                <Video className="w-3 h-3" /> MP4, MOV
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
