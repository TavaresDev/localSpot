import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, DollarSign, Phone, Globe, Clock, ImageIcon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Business } from "@/lib/types/business";

interface BusinessCardProps {
  business: Business;
  className?: string;
  showImage?: boolean;
  compact?: boolean;
}

export function BusinessCard({
  business,
  className = "",
  showImage = true,
  compact = false
}: BusinessCardProps) {


  console.log("Rendering BusinessCard for:", { business });
  return (
    <Card className={`hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${className}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          {showImage && (business.photoUrl || business.photos?.[0]) && (
            <BusinessImage
              src={`/api/places/photo/${encodeURIComponent(business.photos?.[0] || '')}?w=80&h=80`}
              alt={business.name}
            />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="font-semibold text-lg leading-tight mb-2 truncate">
              {business.name}
            </h4>

            {/* Address */}
            {business.address && (
              <div className="flex items-start gap-1 mb-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{business.address}</span>
              </div>
            )}

            {/* so */}
            {business.businessType && (
              <div className="flex items-start gap-1 mb-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{business.businessType}</span>
              </div>
            )}

            {/* Badges Row */}
            {!compact && (
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {/* Rating */}
                {business.rating && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {business.rating}
                    {business.ratingCount && ` (${business.ratingCount})`}
                  </Badge>
                )}

                {/* Price Level */}
                {business.priceLevel && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {business.priceLevel.replace('_', ' ')}
                  </Badge>
                )}

                {/* Open/Closed Status */}
                {business.isOpen !== undefined && (
                  <Badge
                    variant="secondary"
                    className={business.isOpen
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {business.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                )}
              </div>
            )}

            {/* Contact Info */}
            {!compact && (
              <div className="flex items-center gap-4 text-sm">
                {/* Phone */}
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span className="hover:underline">{business.phone}</span>
                  </a>
                )}

                {/* Website */}
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    <span className="hover:underline">Website</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Safe image component that handles invalid URLs
function BusinessImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);


  // Validate URL before rendering (handle both relative and absolute URLs)
  const isValidUrl = (url: string) => {
    if (!url || url.trim() === '') return false;

    try {
      // For relative URLs, we can use window.location.origin as base
      if (url.startsWith('/')) {
        // Relative URL - assume it's valid if it starts with /
        return true;
      }
      // For absolute URLs, validate with new URL()
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // If URL is invalid or image failed to load, show placeholder
  if (!isValidUrl(src) || imageError) {
    return (
      <div className="flex-shrink-0">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0">
      <div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-100 relative">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
        {/* Using Next.js Image for optimization */}
        <Image
          src={src}
          alt={alt}
          width={80}
          height={80}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      </div>
    </div>
  );
}