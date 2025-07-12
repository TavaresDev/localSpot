"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Plus, Clock, Globe, Phone } from 'lucide-react';
import Image from "next/image";
import { usePlacesSearchMutation } from '@/lib/hooks/queries/usePlacesSearch';
import { Business } from '@/lib/types/business';

interface PlacesToSpotsSearchProps {
  onCreateSpot: (business: Business) => void;
  className?: string;
}

export function PlacesToSpotsSearch({ onCreateSpot, className = "" }: PlacesToSpotsSearchProps) {
  const [query, setQuery] = useState('');
  const { search, results, loading, error, clearResults } = usePlacesSearchMutation();

  const handleSearch = () => {
    if (query.trim()) {
      search({ query: query.trim() });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
    clearResults();
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-4 ${className}`}>
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Places to Create Spots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for pump tracks, skate spots, hills..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-10"
                disabled={loading}
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Search'
              )}
            </Button>

            {(results.length > 0 || error) && (
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading Message */}
      {loading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-blue-700">🔍 Searching for {query}...</p>
          </CardContent>
        </Card>
      )}

      {/* Results with Create Spot buttons */}
      {results.length > 0 && !loading && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4 text-green-700">
              ✅ Found {results.length} places for &quot;{query}&quot;
            </h3>
            <div className="space-y-4">
              {results.map((business) => (
                <BusinessCardWithCreateSpot
                  key={business.id}
                  business={business}
                  onCreateSpot={() => onCreateSpot(business)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {!loading && query && results.length === 0 && !error && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4 text-center">
            <p className="text-gray-600">
              🔍 No places found for <strong>&quot;{query}&quot;</strong>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface BusinessCardWithCreateSpotProps {
  business: Business;
  onCreateSpot: () => void;
}

function BusinessCardWithCreateSpot({ business, onCreateSpot }: BusinessCardWithCreateSpotProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          {business.photos?.[0] && (
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 relative">
                <Image
                  src={`/api/places/photo/${encodeURIComponent(business.photos[0])}?w=80&h=80`}
                  alt={business.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Create Button */}
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-lg leading-tight truncate pr-2">
                {business.name}
              </h4>
              <Button
                onClick={onCreateSpot}
                size="sm"
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-3 w-3" />
                Create Spot
              </Button>
            </div>

            {/* Address */}
            {business.address && (
              <div className="flex items-start gap-1 mb-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{business.address}</span>
              </div>
            )}

            {/* Business Type */}
            {business.businessType && (
              <Badge variant="secondary" className="mb-2 mr-2">
                {business.businessType}
              </Badge>
            )}

            {/* Rating and Status */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {business.rating && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {business.rating}
                  {business.ratingCount && ` (${business.ratingCount})`}
                </Badge>
              )}

              {business.isOpen !== undefined && (
                <Badge
                  variant="secondary"
                  className={business.isOpen
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                  }
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {business.isOpen ? 'Open' : 'Closed'}
                </Badge>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex items-center gap-4 text-sm">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span className="hover:underline">{business.phone}</span>
                </a>
              )}

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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}