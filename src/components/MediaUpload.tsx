'use client';

import { useCallback, useRef, useState } from 'react';
import { Trash2, Star } from "lucide-react";

interface Props {
    files: File[];
    onFilesChange: (files: File[]) => void;
}

const MAX_FILES = 5;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'];

export default function MediaUpload({ files, onFilesChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSetAsCover = (indexToMove: number) => {
        const updatedFiles = [...files];
        const [coverFile] = updatedFiles.splice(indexToMove, 1);
        updatedFiles.unshift(coverFile);
        onFilesChange(updatedFiles);
    };

    const addFiles = useCallback(
        (incoming: FileList | null) => {
            if (!incoming) return;
            const newFiles = Array.from(incoming).filter((f) => ALLOWED.includes(f.type));
            
            let videoCount = files.filter(f => f.type.startsWith('video/')).length;
            
            const validFiles: File[] = [];
            for (const f of newFiles) {
                if (f.type.startsWith('video/')) {
                    if (videoCount >= 1) {
                        setError("Maximum 1 video allowed.");
                        continue;
                    }
                    videoCount++;
                }
                validFiles.push(f);
            }

            const combined = [...files, ...validFiles].slice(0, MAX_FILES);
            if (combined.length > files.length) {
                setError(null);
            }
            onFilesChange(combined);
        },
        [files, onFilesChange]
    );

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        addFiles(e.dataTransfer.files);
    }

    function removeFile(index: number) {
        onFilesChange(files.filter((_, i) => i !== index));
        setError(null);
    }

    return (
        <div className="space-y-4">
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center cursor-pointer hover:border-[--color-brand] hover:bg-stone-50 transition-colors group relative"
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ALLOWED.join(',')}
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                />
                <div className="text-3xl mb-2">📹 📷</div>
                <p className="text-sm font-medium text-stone-600 group-hover:text-[--color-brand] transition-colors">
                    Click or drag media here
                </p>
                <p className="text-xs text-stone-400 mt-1">
                    Images / MP4 / WebM — max {MAX_FILES} files (Max 1 video)
                </p>
            </div>
            
            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

            {files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {files.map((file, i) => (
                        <div 
                            key={i} 
                            className={`relative aspect-square bg-stone-100 rounded-xl overflow-hidden border-2 transition-all ${
                                i === 0 ? "border-[#52B7EC] shadow-md" : "border-stone-200"
                            }`}
                        >
                            {file.type.startsWith('video/') ? (
                                <video
                                    src={URL.createObjectURL(file)}
                                    className="w-full h-full object-cover"
                                    muted
                                />
                            ) : (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Top Left: Cover Image Badge */}
                            {i === 0 && !file.type.startsWith('video/') && (
                                <span className="absolute top-2 left-2 bg-[#52B7EC] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10 pointer-events-none">
                                    Cover
                                </span>
                            )}

                            {/* Top Right: Always-Visible Action Buttons */}
                            <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-20">
                                
                                {/* Delete Button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(i);
                                    }}
                                    className="p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-md shadow-sm backdrop-blur-sm transition-colors"
                                    title="Delete File"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                {/* Set as Cover Button (Only for images, not videos, and not the 1st item) */}
                                {i !== 0 && !file.type.startsWith('video/') && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSetAsCover(i);
                                        }}
                                        className="p-1.5 bg-white/90 hover:bg-white text-stone-700 hover:text-[#52B7EC] rounded-md shadow-sm backdrop-blur-sm transition-colors border border-stone-200/50"
                                        title="Set as Cover Image"
                                    >
                                        <Star className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Bottom: Filename */}
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] px-2 py-1 z-10 truncate pointer-events-none">
                                {file.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}