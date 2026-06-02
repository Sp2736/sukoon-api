"use client";

interface AmenitySelectorProps {
  category: string;
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
}

const AMENITIES_MAP: Record<string, string[]> = {
  Residential: [
    "Gymnasium",
    "Swimming Pool",
    "Clubhouse",
    "Children Park",
    "Power Backup",
    "Security",
    "Parking",
    "Yoga Center",
    "Tennis Court",
    "Jogging Track",
    "Intercom",
    "Maintenance Staff",
  ],
};

export default function AmenitySelector({
  category,
  selectedAmenities,
  onChange,
}: AmenitySelectorProps) {
  const availableAmenities = AMENITIES_MAP[category] || [];

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      onChange(selectedAmenities.filter((a) => a !== amenity));
    } else {
      onChange([...selectedAmenities, amenity]);
    }
  };

  if (category !== "Residential" || availableAmenities.length === 0) {
    return (
      <div className="text-center py-8 bg-stone-50 rounded-lg border border-stone-200 border-dashed">
        <p className="text-sm text-stone-500 font-medium">
          Amenities are currently only available for the Residential category.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[220px] md:max-h-[240px] overflow-y-auto custom-scrollbar pr-2">
      <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {availableAmenities.map((amenity) => {
          const isSelected = selectedAmenities.includes(amenity);

          return (
            <label
              key={amenity}
              className={`flex items-start gap-1.5 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-colors cursor-pointer ${
                isSelected
                  ? "border-brand bg-brand/5"
                  : "border-stone-200 hover:bg-stone-50"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleAmenity(amenity)}
                className="mt-0.5 sm:mt-0 accent-brand w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer shrink-0"
              />
              <span
                className={`text-[10px] sm:text-sm leading-tight ${isSelected ? "font-bold text-stone-800" : "font-medium text-stone-600"}`}
              >
                {amenity}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
