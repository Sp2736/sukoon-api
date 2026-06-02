import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  details: string;
  price: string;
  category?: string; // Added category
  amenities?: string[]; // Added amenities
  isVisible?: boolean;
  index?: number;
}

export default function PropertyCard({
  id,
  image,
  title,
  location,
  details,
  price,
  category,
  amenities = [],
  isVisible = true,
  index = 0,
}: PropertyCardProps) {
  const cardDelay = index * 150 + 150;
  const imageDelay = cardDelay + 150; 
  const contentDelay = cardDelay + 300; 

  // Combine mandatory amenities with admin-selected ones for Residential
  const mandatoryAmenities = ["Prime Location", "Schools Nearby", "Hospitals Nearby"];
  const displayAmenities = category === "Residential" 
    ? [...mandatoryAmenities, ...amenities] 
    : amenities;

  return (
    <div
      style={{ transitionDelay: `${cardDelay}ms` }}
      className={`bg-[#D9F2FF]/50 border border-[#D9F2FF]/30 rounded-[20px] p-[16px] flex flex-col group hover:shadow-lg transition-all duration-700 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      <div
        style={{ transitionDelay: `${imageDelay}ms` }}
        className={`relative w-full h-[220px] md:h-[250px] xl:h-[270px] rounded-[10px] overflow-hidden shrink-0 mb-3 bg-white transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div
        style={{ transitionDelay: `${contentDelay}ms` }}
        className={`flex flex-col flex-grow px-1 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="flex items-center gap-1.5 text-[#919191] mb-1">
          <img
            src="/pin.webp"
            alt="location"
            className="w-[14px] h-[14px] md:w-[15px] md:h-[15px] object-contain shrink-0"
          />
          <span className="font-body text-[11px] md:text-[13px] leading-[1.6]">
            {location}
          </span>
        </div>

        <h3 className="font-heading font-semibold text-[15px] md:text-[18px] text-[#1F1F1F] leading-[1.4] mb-1 line-clamp-1">
          {title}
        </h3>

        <p className="font-heading font-medium text-[14px] md:text-[12px] text-[#1F1F1F]/80 leading-[1.4] mb-3">
          ({details})
        </p>

        {/* Amenities Row - Only shows if there are amenities to display */}
        {displayAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Taking the first 3 or 4 to not break card height, you can adjust slice() */}
            {displayAmenities.slice(0, 3).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-sky-100/50 px-2 py-1 rounded-[6px]">
                {/* // todo: add icon image from public folder for {amenity} here */}
                <div className="w-3 h-3 bg-sky-200 rounded-full shrink-0"></div>
                <span className="text-[10px] font-medium text-sky-800 leading-none">
                  {amenity}
                </span>
              </div>
            ))}
            {displayAmenities.length > 3 && (
              <div className="flex items-center px-2 py-1 text-[10px] font-medium text-sky-600">
                +{displayAmenities.length - 3} more
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-auto pt-2">
          <span className="font-heading font-bold text-[16px] md:text-[18px] xl:text-[20px] text-[#1F1F1F] leading-[1.4]">
            {price}
          </span>

          <Link
            href={`/properties/${id}`}
            className="flex items-center justify-center text-black shrink-0 transition-all duration-300 hover:text-sky-700"
          >
            View Details <ArrowRight/>
          </Link>
        </div>
      </div>
    </div>
  );
}