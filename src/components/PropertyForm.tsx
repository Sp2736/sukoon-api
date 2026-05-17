'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema, type PropertyFormValues } from '@/lib/validations';
import { createPropertyAction, updatePropertyAction, deletePropertyImageAction } from '@/lib/actions';
import { uploadPropertyImages, deletePropertyImage } from '@/lib/uploadImage';
import ImageUpload from '@/components/ImageUpload';
import type { PropertyWithImages, PropertyImageRow, PropertyRow } from '@/types/database';

interface Props {
    mode: 'create' | 'edit';
    property?: PropertyWithImages;
    allProperties?: PropertyRow[];
}

const CATEGORIES = ['Residential', 'Commercial', 'Agricultural Land', 'Non-agricultural Land'] as const;

export default function PropertyForm({ mode, property, allProperties = [] }: Props) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<PropertyImageRow[]>(property?.property_images ?? []);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema) as any,
        defaultValues: {
            title: property?.title ?? '',
            description: property?.description ?? '',
            price: property ? String(property.price) : '',
            location: property?.location ?? '',
            city: property?.city ?? '',
            village: property?.village ?? '',
            area_unit: property?.area_unit ?? 'sq. mtr',
            area_value: property?.area_value ? String(property.area_value) : '',
            survey_number: property?.survey_number ?? '',
            category: property?.category ?? 'Residential',
            configuration: property?.configuration ?? '',
            floor_number: property?.floor_number ?? '',
            room_size: property?.room_size ?? '',
            plot_size: property?.plot_size ?? '',
            zone_type: property?.zone_type ?? '',
            fencing: property?.fencing ?? '',
            related_properties: property?.related_properties ?? [],
            is_published: property?.is_published ?? false,
        },
    });

    // Watch the category and related properties to change fields dynamically
    const selectedCategory = watch('category');
    const selectedRelatedProperties = (watch('related_properties' as any) || []) as string[];
    const isRelatedPropertiesMaxed = selectedRelatedProperties.length >= 3;

    const inputCls = (hasError?: boolean) =>
        `w-full rounded-sm border px-4 py-3 text-sm transition-all outline-none focus:ring-2 focus:ring-sky-100 ${hasError ? 'border-red-500 bg-red-50' : 'border-stone-200 bg-white focus:border-[#0ea5e9]'
        }`;

    const labelCls = 'block text-[10px] font-black uppercase tracking-[0.15em] text-stone-400 mb-2 ml-1';
    const cardCls = "bg-white rounded-sm border border-stone-200 p-6 md:p-10";

    const onSubmit = async (values: PropertyFormValues) => {
        setServerError(null);

        // 1. Determine a property ID to use for storage path
        const propertyId = property?.id ?? crypto.randomUUID();

        // 2. Upload any pending files
        let newImageUrls: string[] = [];
        if (pendingFiles.length > 0) {
            const { successes, errors } = await uploadPropertyImages(pendingFiles, propertyId);
            newImageUrls = successes.map((r) => r.url);
            if (errors.length > 0) {
                // Log or handle upload errors if needed
                console.error("Upload errors:", errors);
            }
        }

        // 3. Call server action
        const result = mode === 'create'
            ? await createPropertyAction(values, newImageUrls)
            : await updatePropertyAction(property!.id, values, newImageUrls);

        if ('error' in result) {
            setServerError(result.error);
            return;
        }

        setSuccess(true);
        setTimeout(() => router.push('/admin/dashboard'), 800);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="min-h-screen pb-32">

            <div className="sticky top-0 z-50 mb-8 bg-white/80 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-7xl px-4 md:px-8 py-4 md:py-6">
                    <h1 className="text-xl md:text-3xl font-black text-stone-800 tracking-tight">
                        {mode === 'create' ? 'Add New Listing' : 'Edit Listing'}
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-12 gap-8 items-start">

                {/* LEFT COLUMN */}
                <div className="col-span-12 lg:col-span-7 space-y-8">

                    {/* 01. Dynamic Specifications Section */}
                    <section className={cardCls}>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0ea5e9] mb-8">
                            01. {selectedCategory} Details
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className={labelCls}>Listing Title *</label>
                                <input {...register('title')} className={inputCls(!!errors.title)} placeholder="e.g. Modern 3BHK Apartment" />
                                {(errors as any).title && <p className="text-red-500 text-xs mt-1">{(errors as any).title.message}</p>}
                            </div>

                            {/* CONDITIONAL FIELDS BASED ON CATEGORY */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {selectedCategory === 'Residential' && (
                                    <>
                                        <div>
                                            <label className={labelCls}>Configuration (BHK)</label>
                                            <input {...register('configuration' as any)} className={inputCls()} placeholder="e.g. 3 BHK" />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Floor No.</label>
                                            <input {...register('floor_number' as any)} className={inputCls()} placeholder="e.g. 5th" />
                                        </div>
                                    </>
                                )}

                                {(selectedCategory === 'Agricultural Land' || selectedCategory === 'Non-agricultural Land') && (
                                    <>
                                        <div>
                                            <label className={labelCls}>Zone Type</label>
                                            <select {...register('zone_type' as any)} className={inputCls()}>
                                                <option value="Green">Green Zone</option>
                                                <option value="Yellow">Yellow Zone</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Fencing</label>
                                            <select {...register('fencing' as any)} className={inputCls()}>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div>
                                <label className={labelCls}>Full Description</label>
                                <textarea {...register('description')} rows={8} className={inputCls()} />
                            </div>
                        </div>
                    </section>

                    {/* 02. Media Gallery */}
                    <section className={cardCls}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0ea5e9]">
                                02. Media Gallery
                            </h2>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${(existingImages.length + pendingFiles.length) >= 5 ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-500'}`}>
                                {existingImages.length + pendingFiles.length} / 5 IMAGES
                            </span>
                        </div>

                        {/* Custom Dropzone / Upload logic should respect the 5-image limit */}
                        <ImageUpload
                            files={pendingFiles}
                            onFilesChange={(newFiles) => setPendingFiles(newFiles.slice(0, 5 - existingImages.length))}
                        />

                        {(existingImages.length > 0 || pendingFiles.length > 0) && (
                            <div className="mt-8 space-y-6">
                                {/* FEATURED COVER IMAGE SLOT */}
                                {existingImages.length > 0 ? (
                                    <div className="relative aspect-video w-full rounded-sm overflow-hidden border-2 border-[#0ea5e9] bg-stone-50">
                                        <img
                                            src={existingImages[0].image_url}
                                            className="w-full h-full object-cover"
                                            alt="Cover"
                                        />
                                        <div className="absolute top-4 left-4 bg-[#0ea5e9] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider shadow-lg">
                                            Main Cover Image
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (confirm("Delete cover image?")) {
                                                    await deletePropertyImageAction(existingImages[0].id);
                                                    await deletePropertyImage(existingImages[0].image_url);
                                                    setExistingImages(prev => prev.slice(1));
                                                }
                                            }}
                                            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-sm text-xs shadow-lg transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>
                                ) : pendingFiles.length > 0 ? (
                                    <div className="relative aspect-video w-full rounded-sm overflow-hidden border-2 border-[#0ea5e9] bg-stone-50">
                                        <img
                                            src={URL.createObjectURL(pendingFiles[0])}
                                            className="w-full h-full object-cover"
                                            alt="Cover"
                                        />
                                        <div className="absolute top-4 left-4 bg-[#0ea5e9] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider shadow-lg">
                                            Main Cover Image
                                        </div>
                                    </div>
                                ) : null}

                                {/* GALLERY THUMBNAILS */}
                                {(existingImages.length > 1 || pendingFiles.length > (existingImages.length > 0 ? 0 : 1)) && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {/* Existing Thumbnails */}
                                        {existingImages.slice(1).map((img, idx) => (
                                            <div key={img.id} className="group relative aspect-square rounded-sm overflow-hidden border border-stone-200">
                                                <img
                                                    src={img.image_url}
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                    alt="Gallery"
                                                />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all gap-2 p-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newArr = [...existingImages];
                                                            const selected = newArr.splice(idx + 1, 1)[0];
                                                            setExistingImages([selected, ...newArr]);
                                                        }}
                                                        className="text-[8px] md:text-[9px] font-bold text-white uppercase bg-sky-600 px-2 py-1 rounded"
                                                    >
                                                        Set Cover
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (confirm("Delete this image?")) {
                                                                await deletePropertyImageAction(img.id);
                                                                await deletePropertyImage(img.image_url);
                                                                setExistingImages(prev => prev.filter(i => i.id !== img.id));
                                                            }
                                                        }}
                                                        className="text-[9px] font-bold text-white uppercase bg-red-600 px-2 py-1 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pending Thumbnails */}
                                        {pendingFiles.slice(existingImages.length > 0 ? 0 : 1).map((file, idx) => {
                                            const originalIdx = existingImages.length > 0 ? idx : idx + 1;
                                            return (
                                                <div key={originalIdx} className="group relative aspect-square rounded-sm overflow-hidden border border-sky-200 border-dashed bg-sky-50">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                        alt="Pending Gallery"
                                                    />
                                                    <div className="absolute top-1 right-1 bg-sky-500 text-white text-[8px] font-bold px-1 rounded">NEW</div>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newArr = [...pendingFiles];
                                                                newArr.splice(originalIdx, 1);
                                                                setPendingFiles(newArr);
                                                            }}
                                                            className="text-[9px] font-bold text-white uppercase bg-red-600 px-2 py-1 rounded"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}



                        <p className="mt-4 text-[10px] text-stone-400 italic">
                            * The first image will be used as the primary thumbnail in search results.
                        </p>
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-sm">
                            <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">
                                📏 Proper Dimensions
                            </p>
                            <p className="text-xs text-blue-600">
                                For best results, upload images with a <strong>16:9 aspect ratio</strong> (e.g. 1920x1080px or 1280x720px). Maximum file size: 2MB per image.
                            </p>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN - Sticky Sidebar */}
                <aside className="col-span-12 lg:col-span-5 space-y-8 lg:sticky lg:top-[140px]">

                    {/* Classification */}
                    <div className={cardCls}>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-8">Classification</h2>
                        <div className="space-y-6">
                            <div>
                                <label className={labelCls}>Asset Category *</label>
                                <select {...register('category')} className={inputCls(!!errors.category)}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {(errors as any).category && <p className="text-red-500 text-xs mt-1">{(errors as any).category.message}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Market Price (INR) *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                                        ₹
                                    </span>
                                    <input
                                        {...register('price')}
                                        type="number"
                                        placeholder="0.00"
                                        className={`${inputCls(!!errors.price)} pl-10`} // Adjusted padding for ₹ symbol
                                    />
                                </div>
                                {(errors as any).price && <p className="text-red-500 text-xs mt-1">{(errors as any).price.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Location & Area */}
                    <div className={cardCls}>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-8">Location & Area</h2>
                        <div className="space-y-6">
                            <div>
                                <label className={labelCls}>Address / Location *</label>
                                <input {...register('location')} className={inputCls(!!errors.location)} placeholder="e.g. Near Main Road" />
                                {(errors as any).location && <p className="text-red-500 text-xs mt-1">{(errors as any).location.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>City *</label>
                                    <input {...register('city')} className={inputCls(!!errors.city)} placeholder="City" />
                                    {(errors as any).city && <p className="text-red-500 text-xs mt-1">{(errors as any).city.message}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Village</label>
                                    <input {...register('village')} className={inputCls(!!errors.village)} placeholder="Village" />
                                    {(errors as any).village && <p className="text-red-500 text-xs mt-1">{(errors as any).village.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Area Value *</label>
                                    <input {...register('area_value')} type="number" step="0.01" className={inputCls(!!errors.area_value)} placeholder="Area Value" />
                                    {(errors as any).area_value && <p className="text-red-500 text-xs mt-1">{(errors as any).area_value.message}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Area Unit *</label>
                                    <select {...register('area_unit')} className={inputCls(!!errors.area_unit)}>
                                        <option value="sq. ft">Sq. ft</option>
                                        <option value="sq. mtr">Sq. mtr</option>
                                        <option value="Acre">Acre</option>
                                    </select>
                                    {(errors as any).area_unit && <p className="text-red-500 text-xs mt-1">{(errors as any).area_unit.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Properties */}
                    <div className={cardCls}>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-8">Related Properties</h2>
                        <div className="space-y-6">
                            <div>
                                <label className={labelCls}>Select Similar Properties</label>
                                <div className="mt-2 max-h-48 overflow-y-auto border border-stone-200 rounded-sm p-3 space-y-2 bg-stone-50">
                                    {allProperties.filter(p => p.id !== property?.id).length === 0 ? (
                                        <p className="text-xs text-stone-400">No other properties available.</p>
                                    ) : (
                                        allProperties.filter(p => p.id !== property?.id).map((p) => {
                                            const isSelected = selectedRelatedProperties.includes(p.id);
                                            const isDisabled = isRelatedPropertiesMaxed && !isSelected;
                                            return (
                                                <label key={p.id} className={`flex items-start gap-3 p-2 rounded transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white'}`}>
                                                    <input
                                                        type="checkbox"
                                                        value={p.id}
                                                        {...register('related_properties' as any)}
                                                        disabled={isDisabled}
                                                        className="mt-0.5 accent-[#0ea5e9] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-stone-700">{p.title}</span>
                                                        <span className="text-[10px] text-stone-400 uppercase">{p.category}</span>
                                                    </div>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                                {(errors as any).related_properties && <p className="text-red-500 text-xs mt-1">{(errors as any).related_properties.message}</p>}
                                <p className="mt-2 text-[10px] text-stone-400 italic">
                                    Selected properties (max 3) will appear in the "Similar Properties" section of the property page.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Fixed Bottom Action Bar */}
            <footer className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/90 backdrop-blur-xl border-t border-stone-200 p-6 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <input type="checkbox" {...register('is_published')} className="w-5 h-5 accent-[#0ea5e9] cursor-pointer" />
                        <span className="text-sm font-bold text-stone-700">Public Visibility</span>
                        {serverError && <span className="text-red-500 text-sm font-bold ml-4">Error: {serverError}</span>}
                        {success && <span className="text-green-500 text-sm font-bold ml-4">Saved Successfully!</span>}
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => router.back()} className="px-6 py-3 text-sm font-bold text-stone-400 hover:text-stone-800 transition-colors">Discard</button>
                        <button type="submit" disabled={isSubmitting} className="bg-[#0ea5e9] text-white px-10 py-3 rounded-2xl font-black text-sm shadow-lg shadow-sky-100 hover:bg-[#0284c7] transition-all active:scale-95 disabled:opacity-50">
                            {isSubmitting ? 'SAVING...' : 'SAVE & PUBLISH'}
                        </button>
                    </div>
                </div>
            </footer>
        </form>
    );
}