"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";

export default function TestimonialForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        quote: "",
    });

    const inputCls = "w-full rounded-lg border border-stone-300 px-4 py-3 text-sm transition-all focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 bg-white";
    const labelCls = "block text-xs font-bold text-stone-700 mb-2";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Upload Avatar if pendingFiles[0] exists
            // 2. Submit form data to your backend action
            // await createTestimonialAction(formData, avatarUrl);
            
            console.log("Submitting:", formData, pendingFiles[0]);
            
            // Simulate delay
            await new Promise(r => setTimeout(r, 800));
            router.push("/admin/testimonials");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="min-h-screen bg-stone-50 pb-32 font-sans text-stone-900">
            {/* Header Strip */}
            <div className="bg-white border-b border-stone-200 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">Add New Review</h1>
                        <p className="text-sm text-stone-500 mt-1">Create a new client testimonial for the website.</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">
                            Discard
                        </button>
                        <button type="submit" disabled={isSubmitting} className="bg-brand text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-brand-light transition-colors disabled:opacity-50">
                            {isSubmitting ? "Saving..." : "Save Testimonial"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN - Text Details */}
                <div className="md:col-span-8 space-y-8">
                    <section className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 lg:p-8">
                        <h2 className="text-lg font-bold text-stone-900 mb-6 pb-4 border-b border-stone-100">Client Information</h2>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelCls}>Client Name *</label>
                                    <input 
                                        required 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className={inputCls} 
                                        placeholder="e.g. Sarah Chen" 
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Role / Title *</label>
                                    <input 
                                        required 
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className={inputCls} 
                                        placeholder="e.g. Home Buyer" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Review Quote *</label>
                                <textarea 
                                    required 
                                    rows={5} 
                                    value={formData.quote}
                                    onChange={(e) => setFormData({...formData, quote: e.target.value})}
                                    className={`${inputCls} resize-none`} 
                                    placeholder="Enter the client's exact words..." 
                                />
                                <p className="text-xs text-stone-500 mt-2">
                                    Quotation marks will be added automatically on the frontend.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN - Avatar Upload */}
                <div className="md:col-span-4 space-y-8">
                    <section className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
                        <h2 className="text-sm font-bold text-stone-900 mb-4 pb-4 border-b border-stone-100">Avatar Image (Optional)</h2>
                        
                        <div className="space-y-4">
                            {/* We limit this to 1 file for avatars */}
                            <ImageUpload 
                                files={pendingFiles} 
                                onFilesChange={(newFiles) => setPendingFiles(newFiles.slice(0, 1))} 
                            />
                            
                            {pendingFiles.length > 0 && (
                                <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-full overflow-hidden border-4 border-stone-100 shadow-sm">
                                    <img 
                                        src={URL.createObjectURL(pendingFiles[0])} 
                                        className="w-full h-full object-cover" 
                                        alt="Avatar preview" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setPendingFiles([])}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                            <p className="text-[10px] text-stone-500 text-center font-medium leading-relaxed">
                                Recommended size: 100x100px.<br/>It will be cropped to a circle.
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            {/* Mobile Floating Action Bar */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 flex gap-4 z-40">
                <button type="button" onClick={() => router.back()} className="flex-1 py-3 text-sm font-bold text-stone-600 bg-stone-100 rounded-lg">Discard</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-brand text-white py-3 rounded-lg font-bold text-sm disabled:opacity-50">{isSubmitting ? "Saving..." : "Save"}</button>
            </div>
        </form>
    );
}