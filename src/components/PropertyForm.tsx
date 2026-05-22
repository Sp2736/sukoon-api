"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, type PropertyFormValues } from "@/lib/validations";
import {
  createPropertyAction,
  updatePropertyAction,
  deletePropertyImageAction,
} from "@/lib/actions";
import { uploadPropertyImages, deletePropertyImage } from "@/lib/uploadImage";
import ImageUpload from "@/components/ImageUpload";
import type {
  PropertyWithImages,
  PropertyImageRow,
  PropertyRow,
} from "@/types/database";

interface Props {
  mode: "create" | "edit";
  property?: PropertyWithImages;
  allProperties?: PropertyRow[];
}

const CATEGORIES = [
  "Residential",
  "Industrial",
  "Commercial",
  "Agricultural Land",
  "Non-agricultural Land",
] as const;

// Custom Theme-Compliant Select Component
function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled = false,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[] | readonly string[];
  placeholder: string;
  error?: boolean;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full rounded-lg border px-4 py-3 text-sm transition-all focus:outline-none ${
          error
            ? "border-red-500 bg-red-50 ring-2 ring-red-200"
            : isOpen
              ? "border-brand ring-2 ring-brand/20 bg-white"
              : "border-stone-300 bg-white hover:border-stone-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={value ? "text-stone-900 font-medium" : "text-stone-400"}
        >
          {value
            ? (typeof options[0] === "string"
                ? value
                : (options as any[]).find((o) => o.value === value)?.label) ||
              value
            : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Invisible backdrop to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-stone-200 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar transform opacity-100 scale-100 transition-all origin-top">
            {options.map((opt) => {
              const optValue = typeof opt === "string" ? opt : opt.value;
              const optLabel = typeof opt === "string" ? opt : opt.label;
              const isSelected = value === optValue;

              return (
                <button
                  key={optValue}
                  type="button"
                  onClick={() => {
                    onChange(optValue);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-brand/10 text-brand font-bold"
                      : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  {optLabel}
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-brand"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function PropertyForm({
  mode,
  property,
  allProperties = [],
}: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Media State
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImageRow[]>(
    property?.property_images ?? [],
  );

  // Modal State for Related Properties
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategoryFilter, setModalCategoryFilter] = useState<string>("All");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      title: property?.title ?? "",
      description: property?.description ?? "",
      price: property ? String(property.price) : "",
      location: property?.location ?? "",
      city: property?.city ?? "",
      village: property?.village ?? "",
      area_unit: property?.area_unit ?? "sq. mtr",
      area_value: property?.area_value ? String(property.area_value) : "",
      survey_number: property?.survey_number ?? "",
      category: (property?.category ?? "") as any,
      configuration: property?.configuration ?? "",
      floor_number: property?.floor_number ?? "",
      room_size: property?.room_size ?? "",
      plot_size: property?.plot_size ?? "",
      zone_type: property?.zone_type ?? "",
      fencing: property?.fencing ?? "",
      related_properties: property?.related_properties ?? [],
      is_published: property?.is_published ?? false,
    },
  });

  const selectedCategory = watch("category");
  const selectedZoneType = watch("zone_type");
  const selectedFencing = watch("fencing");
  const selectedAreaUnit = watch("area_unit");
  const selectedRelatedProperties = (watch("related_properties" as any) ||
    []) as string[];
  const isRelatedPropertiesMaxed = selectedRelatedProperties.length >= 3;

  // Controlled Checkbox Toggle Function to fix sync bugs
  const handleToggleRelated = (propertyId: string) => {
    let updated: string[];
    if (selectedRelatedProperties.includes(propertyId)) {
      updated = selectedRelatedProperties.filter((id) => id !== propertyId);
    } else {
      if (isRelatedPropertiesMaxed) return;
      updated = [...selectedRelatedProperties, propertyId];
    }
    setValue("related_properties", updated, { shouldDirty: true });
  };

  // Derived Properties for Selection
  const otherProperties = useMemo(
    () => allProperties.filter((p) => p.id !== property?.id),
    [allProperties, property?.id],
  );

  const categoryFilteredProperties = useMemo(
    () => otherProperties.filter((p) => p.category === selectedCategory),
    [otherProperties, selectedCategory],
  );

  const modalFilteredProperties = useMemo(() => {
    let filtered = otherProperties;
    if (modalCategoryFilter !== "All") {
      filtered = filtered.filter((p) => p.category === modalCategoryFilter);
    }
    return filtered.sort((a, b) => a.title.localeCompare(b.title));
  }, [otherProperties, modalCategoryFilter]);

  // Clean, high-contrast styles
  const inputCls = (hasError?: boolean) =>
    `w-full rounded-lg border px-4 py-3 text-sm transition-all focus:outline-none ${
      hasError
        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
        : "border-stone-300 bg-white hover:border-stone-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
    }`;
  const labelCls = "block text-xs font-bold text-stone-700 mb-2";
  const cardCls =
    "bg-white rounded-xl border border-stone-200 shadow-sm p-6 lg:p-8";

  const onSubmit = async (values: PropertyFormValues) => {
    setServerError(null);
    const propertyId = property?.id ?? crypto.randomUUID();

    let newImageUrls: string[] = [];
    if (pendingFiles.length > 0) {
      const { successes, errors } = await uploadPropertyImages(
        pendingFiles,
        propertyId,
      );
      newImageUrls = successes.map((r) => r.url);
      if (errors.length > 0) console.error("Upload errors:", errors);
    }

    const result =
      mode === "create"
        ? await createPropertyAction(values, newImageUrls)
        : await updatePropertyAction(property!.id, values, newImageUrls);

    if ("error" in result) {
      setServerError(result.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/admin/dashboard"), 800);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="min-h-screen bg-stone-50 pb-32 font-sans text-stone-900"
      >
        {/* Header Strip */}
        <div className="bg-white border-b border-stone-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-stone-900 line-clamp-1">
                {mode === "create"
                  ? "Create New Property Listing"
                  : "Edit Property Details"}
              </h1>
              <p className="hidden md:block text-sm text-stone-500 mt-1">
                Fill in the details below to structure your listing accurately.
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 md:px-6 py-2.5 text-xs md:text-sm font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand text-white px-6 md:px-8 py-2.5 rounded-lg font-bold text-xs md:text-sm shadow-sm hover:bg-brand-light transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Listing"}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (Wider) - Core Details & Media */}
          <div className="lg:col-span-8 space-y-8">
            {/* Section: Primary Information */}
            <section className={cardCls}>
              <h2 className="text-lg font-bold text-stone-900 mb-6 pb-4 border-b border-stone-100">
                Primary Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelCls}>Listing Title *</label>
                  <input
                    {...register("title")}
                    className={inputCls(!!errors.title)}
                    placeholder="e.g. Premium 3BHK Apartment in Downtown"
                  />
                  {(errors as any).title && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">
                      {(errors as any).title.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Asset Category *</label>
                    <CustomSelect
                      value={selectedCategory}
                      onChange={(val) =>
                        setValue("category", val as any, {
                          shouldValidate: true,
                        })
                      }
                      options={CATEGORIES}
                      placeholder="Select a category..."
                      error={!!(errors as any).category}
                    />
                    {(errors as any).category && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">
                        {(errors as any).category.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Market Price (INR) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold">
                        ₹
                      </span>
                      <input
                        {...register("price")}
                        type="number"
                        placeholder="0.00"
                        className={`${inputCls(!!errors.price)} pl-9 font-bold text-stone-900`}
                      />
                    </div>
                    {(errors as any).price && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">
                        {(errors as any).price.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Full Description</label>
                  <textarea
                    {...register("description")}
                    rows={6}
                    className={`${inputCls()} resize-none`}
                    placeholder="Detailed property description..."
                  />
                </div>
              </div>
            </section>

            {/* Section: Dynamic Specifications */}
            {selectedCategory && (
              <section className={cardCls}>
                <h2 className="text-lg font-bold text-stone-900 mb-6 pb-4 border-b border-stone-100">
                  {selectedCategory} Specifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {selectedCategory === "Residential" && (
                    <>
                      <div>
                        <label className={labelCls}>Configuration</label>
                        <input
                          {...register("configuration" as any)}
                          className={inputCls()}
                          placeholder="e.g. 3 BHK"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Floor No.</label>
                        <input
                          {...register("floor_number" as any)}
                          className={inputCls()}
                          placeholder="e.g. 5th"
                        />
                      </div>
                    </>
                  )}
                  {(selectedCategory === "Agricultural Land" ||
                    selectedCategory === "Non-agricultural Land") && (
                    <>
                      <div>
                        <label className={labelCls}>Zone Type</label>
                        <CustomSelect
                          value={selectedZoneType || ""}
                          onChange={(val) =>
                            setValue("zone_type", val, { shouldValidate: true })
                          }
                          options={["Green Zone", "Yellow Zone"]}
                          placeholder="Select zone..."
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Fencing</label>
                        <CustomSelect
                          value={selectedFencing || ""}
                          onChange={(val) =>
                            setValue("fencing", val, { shouldValidate: true })
                          }
                          options={["Yes", "No"]}
                          placeholder="Select..."
                        />
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Section: Media Gallery */}
            <section className={cardCls}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                <h2 className="text-lg font-bold text-stone-900">
                  Media Gallery
                </h2>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${existingImages.length + pendingFiles.length >= 5 ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-600"}`}
                >
                  {existingImages.length + pendingFiles.length} / 5 Images
                </span>
              </div>

              <ImageUpload
                files={pendingFiles}
                onFilesChange={(newFiles) =>
                  setPendingFiles(newFiles.slice(0, 5 - existingImages.length))
                }
              />

              {(existingImages.length > 0 || pendingFiles.length > 0) && (
                <div className="mt-8 space-y-6">
                  {/* Cover Image */}
                  {existingImages.length > 0 ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                      <img
                        src={existingImages[0].image_url}
                        className="w-full h-full object-cover"
                        alt="Cover"
                      />
                      <span className="absolute top-4 left-4 bg-white text-stone-900 text-xs font-bold px-3 py-1.5 rounded shadow">
                        Primary Cover
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm("Delete cover image?")) {
                            await deletePropertyImageAction(
                              existingImages[0].id,
                            );
                            await deletePropertyImage(
                              existingImages[0].image_url,
                            );
                            setExistingImages((prev) => prev.slice(1));
                          }
                        }}
                        className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded shadow hover:bg-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ) : pendingFiles.length > 0 ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                      <img
                        src={URL.createObjectURL(pendingFiles[0])}
                        className="w-full h-full object-cover"
                        alt="Cover"
                      />
                      <span className="absolute top-4 left-4 bg-white text-stone-900 text-xs font-bold px-3 py-1.5 rounded shadow">
                        Primary Cover (Pending)
                      </span>
                    </div>
                  ) : null}

                  {/* Gallery Thumbnails */}
                  {(existingImages.length > 1 ||
                    pendingFiles.length >
                      (existingImages.length > 0 ? 0 : 1)) && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {existingImages.slice(1).map((img, idx) => (
                        <div
                          key={img.id}
                          className="group relative aspect-square rounded-lg overflow-hidden border border-stone-200"
                        >
                          <img
                            src={img.image_url}
                            className="w-full h-full object-cover"
                            alt="Gallery"
                          />
                          <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2 p-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newArr = [...existingImages];
                                const selected = newArr.splice(idx + 1, 1)[0];
                                setExistingImages([selected, ...newArr]);
                              }}
                              className="text-[10px] font-bold text-white bg-stone-700 hover:bg-stone-600 px-3 py-1.5 rounded w-full"
                            >
                              Make Cover
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm("Delete this image?")) {
                                  await deletePropertyImageAction(img.id);
                                  await deletePropertyImage(img.image_url);
                                  setExistingImages((prev) =>
                                    prev.filter((i) => i.id !== img.id),
                                  );
                                }
                              }}
                              className="text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded w-full"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      {pendingFiles
                        .slice(existingImages.length > 0 ? 0 : 1)
                        .map((file, idx) => {
                          const originalIdx =
                            existingImages.length > 0 ? idx : idx + 1;
                          return (
                            <div
                              key={originalIdx}
                              className="group relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-stone-300"
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                className="w-full h-full object-cover opacity-70"
                                alt="Pending"
                              />
                              <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newArr = [...pendingFiles];
                                    newArr.splice(originalIdx, 1);
                                    setPendingFiles(newArr);
                                  }}
                                  className="text-[10px] font-bold text-white bg-red-600 px-3 py-1.5 rounded"
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
            </section>
          </div>

          {/* RIGHT COLUMN (Narrower) - Location & Relations */}
          <div className="lg:col-span-4 space-y-8">
            {/* Section: Location */}
            <section className={cardCls}>
              <h2 className="text-lg font-bold text-stone-900 mb-6 pb-4 border-b border-stone-100">
                Location Details
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelCls}>Address *</label>
                  <input
                    {...register("location")}
                    className={inputCls(!!errors.location)}
                    placeholder="Street / Area"
                  />
                  {(errors as any).location && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">
                      {(errors as any).location.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>City *</label>
                    <input
                      {...register("city")}
                      className={inputCls(!!errors.city)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Village</label>
                    <input
                      {...register("village")}
                      className={inputCls(!!errors.village)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Area Size *</label>
                    <input
                      {...register("area_value")}
                      type="number"
                      step="0.01"
                      className={inputCls(!!errors.area_value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Unit *</label>
                    <CustomSelect
                      value={selectedAreaUnit}
                      onChange={(val) =>
                        setValue(
                          "area_unit",
                          val as "sq. mtr" | "sq. ft" | "Acre",
                          { shouldValidate: true },
                        )
                      }
                      options={[
                        { label: "Sq. ft", value: "sq. ft" },
                        { label: "Sq. mtr", value: "sq. mtr" },
                        { label: "Acre", value: "Acre" },
                      ]}
                      placeholder="Unit"
                      error={!!(errors as any).area_unit}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Related Properties */}
            <section className={cardCls}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                <h2 className="text-lg font-bold text-stone-900">
                  Related Listings
                </h2>
                <span className="text-xs font-bold px-2.5 py-1 bg-stone-100 text-stone-600 rounded">
                  {selectedRelatedProperties.length}/3
                </span>
              </div>

              {!selectedCategory ? (
                <div className="text-center py-8 bg-stone-50 rounded-lg border border-stone-200 border-dashed">
                  <p className="text-sm text-stone-500 font-medium">
                    Please select a property category first.
                  </p>
                </div>
              ) : categoryFilteredProperties.length === 0 ? (
                <div className="text-center py-8 bg-stone-50 rounded-lg border border-stone-200 border-dashed">
                  <p className="text-sm text-stone-500 font-medium">
                    No other {selectedCategory} listings found.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-stone-500">
                    Select up to 3 similar properties from the{" "}
                    {selectedCategory} category.
                  </p>

                  <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    {categoryFilteredProperties.map((p) => {
                      const isSelected = selectedRelatedProperties.includes(
                        p.id,
                      );
                      const isDisabled =
                        isRelatedPropertiesMaxed && !isSelected;
                      return (
                        <label
                          key={p.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            isSelected
                              ? "border-brand bg-brand/5"
                              : "border-stone-200 hover:bg-stone-50"
                          } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {/* CONTROLLED CHECKBOX */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRelated(p.id)}
                            disabled={isDisabled}
                            className="mt-0.5 accent-brand w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-stone-800 line-clamp-1">
                              {p.title}
                            </span>
                            <span className="text-xs text-stone-500 mt-0.5">
                              {p.location}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full mt-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold rounded-lg transition-colors border border-stone-200"
                  >
                    Browse All Properties
                  </button>
                </div>
              )}
            </section>

            {/* Section: Publishing */}
            <section className={cardCls}>
              <h2 className="text-lg font-bold text-stone-900 mb-6 pb-4 border-b border-stone-100">
                Visibility
              </h2>
              <label className="flex items-center gap-4 cursor-pointer p-4 border border-stone-200 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    {...register("is_published")}
                    className="peer sr-only"
                  />
                  <div className="w-11 h-6 bg-stone-300 rounded-full peer peer-checked:bg-brand transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </div>
                <div>
                  <span className="text-sm font-bold text-stone-900 block">
                    Publish Live
                  </span>
                  <span className="text-xs text-stone-500">
                    Make this listing visible to the public
                  </span>
                </div>
              </label>
              {serverError && (
                <p className="text-red-600 text-sm font-bold mt-4">
                  Error: {serverError}
                </p>
              )}
              {success && (
                <p className="text-emerald-600 text-sm font-bold mt-4">
                  Property saved successfully!
                </p>
              )}
            </section>
          </div>
        </div>
      </form>

      {/* MODAL: Browse All Properties */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  Select Related Properties
                </h3>
                <p className="text-sm text-stone-500 mt-1">
                  Select up to 3 listings to cross-sell.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Filter Strip */}
            <div className="px-6 py-3 border-b border-stone-100 bg-stone-50 flex flex-wrap gap-2">
              <button
                onClick={() => setModalCategoryFilter("All")}
                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-colors ${
                  modalCategoryFilter === "All"
                    ? "bg-stone-800 text-white border-stone-800"
                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setModalCategoryFilter(cat)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-colors ${
                    modalCategoryFilter === cat
                      ? "bg-stone-800 text-white border-stone-800"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Modal List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {modalFilteredProperties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-stone-500 font-medium">
                    No properties found.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modalFilteredProperties.map((p) => {
                    const isSelected = selectedRelatedProperties.includes(p.id);
                    const isDisabled = isRelatedPropertiesMaxed && !isSelected;
                    return (
                      <label
                        key={`modal-${p.id}`}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "border-brand bg-brand/5 shadow-sm"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {/* CONTROLLED CHECKBOX */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRelated(p.id)}
                          disabled={isDisabled}
                          className="mt-0.5 accent-brand w-5 h-5 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-stone-900 line-clamp-1">
                            {p.title}
                          </span>
                          <span className="text-xs font-bold text-brand mt-1">
                            {p.category}
                          </span>
                          <span className="text-xs text-stone-500 mt-1 truncate">
                            {p.location}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between rounded-b-2xl">
              <span className="text-sm font-bold text-stone-600">
                {selectedRelatedProperties.length} of 3 selected
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-stone-800 hover:bg-stone-900 text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
