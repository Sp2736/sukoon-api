'use client';
// components/ImageUpload.tsx
// Drag-and-drop multi-image uploader with previews

import { useCallback, useRef } from 'react';

interface Props {
    files: File[];
    onFilesChange: (files: File[]) => void;
}

const MAX_FILES = 10;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export default function ImageUpload({ files, onFilesChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = useCallback(
        (incoming: FileList | null) => {
            if (!incoming) return;
            const valid = Array.from(incoming).filter((f) => ALLOWED.includes(f.type));
            const combined = [...files, ...valid].slice(0, MAX_FILES);
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
    }

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center cursor-pointer hover:border-[--color-brand] hover:bg-stone-50 transition-colors group"
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ALLOWED.join(',')}
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                />
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm font-medium text-stone-600 group-hover:text-[--color-brand] transition-colors">
                    Click or drag images here
                </p>
                <p className="text-xs text-stone-400 mt-1">
                    JPEG · PNG · WebP · AVIF — up to 5 MB each · max {MAX_FILES} images
                </p>
            </div>

            {/* Previews */}
            {files.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {files.map((file, i) => (
                        <div key={i} className="relative group aspect-square">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-full object-cover rounded-lg border border-stone-200"
                            />
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label={`Remove ${file.name}`}
                            >
                                ×
                            </button>
                            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] px-1 py-0.5 rounded-b-lg truncate">
                                {file.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {files.length > 0 && (
                <p className="text-xs text-stone-500">
                    {files.length} file{files.length !== 1 ? 's' : ''} selected
                    {files.length >= MAX_FILES && ' (maximum reached)'}
                </p>
            )}
        </div>
    );
}