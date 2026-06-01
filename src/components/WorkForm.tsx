"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workSchema, type WorkFormValues } from "@/lib/validations";
import MediaUpload from "@/components/MediaUpload";
import { createClient } from "@/supabase/client";

const CATEGORIES = [
  "Residential",
  "Industrial",
  "Commercial",
  "Agricultural Land",
  "Non-agricultural Land",
];
const STATUSES = ["Completed", "Ongoing", "Upcoming"];

// ── Image Compression Utility ──────────────────────────────────────────
async function compressImageToWebP(file: File): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
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
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".webp"),
                {
                  type: "image/webp",
                  lastModified: Date.now(),
                }
              );
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          0.8 // 80% quality for optimal space saving
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
// ───────────────────────────────────────────────────────────────────────

export default function WorkForm() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkFormValues>({
    resolver: zodResolver(workSchema),
    defaultValues: { status: "Completed" },
  });

  const onSubmit = async (data: WorkFormValues) => {
    if (files.length === 0) return alert("Please upload at least one media file.");
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const uploadedMedia = [];
      const bucket = "works"; 

      for (const file of files) {
        let fileToUpload = file;

        // Process File specific to type
        if (file.type.startsWith("image/")) {
          fileToUpload = await compressImageToWebP(file);
        } else if (file.type.startsWith("video/")) {
          // Restrict video size to 50MB
          const maxVideoSize = 50 * 1024 * 1024;
          if (file.size > maxVideoSize) {
            throw new Error(`Video ${file.name} exceeds the 50MB limit. Please compress it first.`);
          }
        }

        const ext = fileToUpload.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, fileToUpload, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(path);

        uploadedMedia.push({
          url: publicUrl,
          path,
          type: file.type.startsWith("video/") ? "video" : "image",
        });
      }

      const payload = {
        ...data,
        media: uploadedMedia,
      };

      const { error: dbError } = await supabase.from("works").insert(payload as any);

      if (dbError) throw dbError;

      reset();
      setFiles([]);

      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Something went wrong while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Title</label>
          <input
            {...register("title")}
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
            placeholder="e.g. Sukoon Villa"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Location</label>
          <input
            {...register("location")}
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
            placeholder="e.g. Vadodara, Gujarat"
          />
          {errors.location && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.location.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Category</label>
          <select
            {...register("category")}
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
          >
            <option value="">Select Category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Status</label>
          <select
            {...register("status")}
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* New Description Field spanning both columns */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-stone-700 mb-2">Description (Optional)</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all resize-none"
            placeholder="Add specific details, project highlights, or an overview..."
          />
          {errors.description && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.description.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-stone-700 mb-2 border-t border-stone-100 pt-6 mt-2">
          Media Upload
        </label>
        <MediaUpload files={files} onFilesChange={setFiles} />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-brand hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95"
        >
          {isSubmitting ? "Saving..." : "Save Work"}
        </button>
      </div>
    </form>
  );
}