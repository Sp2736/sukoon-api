'use client';

import { useCallback, useRef, useState } from 'react';

interface Props {
    files: File[];
    onFilesChange: (files: File[]) => void;
}

const MAX_FILES = 5;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'];

export default function MediaUpload({ files, onFilesChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const addFiles = useCallback(
        (incoming: FileList | null) => {
            if (!incoming) return;
            const newFiles = Array.from(incoming).filter((f) => ALLOWED.includes(f.type));
            
            // Check constraints: max 1 video total
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
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {files.map((file, i) => (
                        <div key={i} className="relative group aspect-square bg-stone-100 rounded-lg border border-stone-200 overflow-hidden">
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
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                ×
                            </button>
                            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] px-1 py-0.5 z-10 truncate">
                                {file.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}