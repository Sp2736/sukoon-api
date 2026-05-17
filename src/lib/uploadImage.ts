import { createClient } from '@/supabase/client';

const BUCKET = 'properties';
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export interface UploadResult {
    url: string;
    path: string;
}

export interface UploadError {
    file: string;
    message: string;
}

export interface UploadBatchResult {
    successes: UploadResult[];
    errors: UploadError[];
}

async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) return resolve(file);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1080;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Shrink to WebP at 80% quality
                            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                                type: 'image/webp',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    },
                    'image/webp',
                    0.8
                );
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
}

/** Upload a single File to the `properties` bucket. Returns the public URL. */
export async function uploadPropertyImage(
    file: File,
    propertyId: string
): Promise<UploadResult> {
    const supabase = createClient();

    // ── Validation ────────────────────────────────────────────
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`${file.name}: Unsupported file type. Use JPEG, PNG, WebP, or AVIF.`);
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        throw new Error(`${file.name}: File exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
    }

    // ── Compress ──────────────────────────────────────────────
    const compressedFile = await compressImage(file);

    // ── Build a unique path ───────────────────────────────────
    const ext = compressedFile.name.split('.').pop()?.toLowerCase() ?? 'webp';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${propertyId}/${uniqueName}`;

    // ── Upload ────────────────────────────────────────────────
    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, compressedFile, { cacheControl: '3600', upsert: false });

    if (error) throw new Error(`${file.name}: ${error.message}`);

    // ── Get public URL ────────────────────────────────────────
    const {
        data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return { url: publicUrl, path };
}

/** Upload multiple images concurrently. Collects both successes and errors. */
export async function uploadPropertyImages(
    files: File[],
    propertyId: string
): Promise<UploadBatchResult> {
    const results = await Promise.allSettled(
        files.map((f) => uploadPropertyImage(f, propertyId))
    );

    const successes: UploadResult[] = [];
    const errors: UploadError[] = [];

    results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            successes.push(result.value);
        } else {
            errors.push({
                file: files[i].name,
                message: result.reason?.message ?? 'Unknown upload error',
            });
        }
    });

    return { successes, errors };
}

/** Delete an image from storage by its public URL. */
export async function deletePropertyImage(imageUrl: string): Promise<void> {
    const supabase = createClient();

    // Extract the path after the bucket name
    const url = new URL(imageUrl);
    const segments = url.pathname.split(`/${BUCKET}/`);
    if (segments.length < 2) throw new Error('Could not parse image path from URL.');
    const path = decodeURIComponent(segments[1]);

    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw new Error(error.message);
}