import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  details: string;
  price: string | number;
  category?: string;
  amenities?: string[];
  isVisible?: boolean;
  index?: number;
}

// Map dynamic amenity names to their respective icons
const AMENITY_ICONS: Record<string, string> = {
  "Prime Location": "/amenities-prime.png",
  "Schools Nearby": "/amenities-school.png",
  "Hospitals Nearby": "/amenities-hospital.png",
  "Gymnasium": "/amenities-gym.webp",
  "Swimming Pool": "/amenities-pool.webp",
  "Clubhouse": "/amenities-clubhouse.webp",
  "Children Park": "/amenities-park.webp",
  "Living Room": "/amenities-living.webp",
  "Power Backup": "/amenities-power.webp",
  "Dining Area": "/amenities-dining.webp",
  "Security": "/amenities-security.webp",
  "Parking": "/amenities-parking.webp",
  "Intercom": "/amenities-intercom.webp",
  "Maintenance Staff": "/amenities-staff.webp",
};

// Fallback icon for any newly added amenities that don't have a specific icon yet
const getAmenityIcon = (name: string) =>
  AMENITY_ICONS[name] || "/verified-check.webp";

export default function PropertyCard({
  id,
  image,
  title,
  location,
  details,
  price,
  category = "",
  amenities = [],
  isVisible = true,
  index = 0,
}: PropertyCardProps) {
  const cardDelay = index * 100;

  // Syncing the mandatory amenities with your frontend icons
  const MANDATORY_AMENITIES = [
    { label: "Prime Location", icon: "/amenities-prime.png" },
    { label: "Schools Nearby", icon: "/amenities-school.png" },
    { label: "Hospitals Nearby", icon: "/amenities-hospital.png" },
  ];

  const isResidential = category === "Residential";

  return (
    <div
      style={{ transitionDelay: `${cardDelay}ms` }}
      className={`bg-white border border-gray-200 rounded-xl p-4 flex flex-col group hover:shadow-lg transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="relative w-full h-48 md:h-56 rounded-lg overflow-hidden shrink-0 mb-4 bg-gray-100">
        <img
          src={image || "/placeholder.jpg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
            {category}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-grow">
        <div className="flex items-center gap-1.5 text-gray-500 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">{location}</span>
        </div>

        <h3 className="font-bold text-lg text-gray-900 leading-snug mb-1 line-clamp-1">
          {title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {details}
        </p>

        {/* Amenities Section - Renders ONLY for Residential */}
        {isResidential && (
          <div className="flex flex-wrap gap-2 mb-4">
            
            {/* Render the 3 Mandatory Amenities first */}
            {MANDATORY_AMENITIES.map((amenity, idx) => (
              <div key={`mandatory-${idx}`} className="flex items-center gap-1.5 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-md">
                <img 
                  src={amenity.icon} 
                  alt={amenity.label} 
                  className="w-3.5 h-3.5 object-contain"
                />
                <span className="text-xs font-medium text-sky-800 whitespace-nowrap">
                  {amenity.label}
                </span>
              </div>
            ))}

            {/* Render Admin-selected Amenities next (Now mapped to Images) */}
            {amenities.slice(0, 2).map((amenity, idx) => (
              <div key={`admin-${idx}`} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md">
                <img 
                  src={getAmenityIcon(amenity)} 
                  alt={amenity} 
                  className="w-3.5 h-3.5 object-contain opacity-70"
                />
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                  {amenity}
                </span>
              </div>
            ))}

            {/* Show a counter if there are many admin amenities */}
            {amenities.length > 2 && (
              <div className="flex items-center px-2 py-1 text-xs font-medium text-gray-500">
                +{amenities.length - 2} more
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
          <span className="font-bold text-lg text-blue-600">
            {typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price}
          </span>

          <Link
            href={`/admin/properties/${id}/edit`} 
            className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            Edit Details <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}