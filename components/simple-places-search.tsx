"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useSimplePlacesSearch } from '@/lib/hooks/useSimplePlacesSearch';

export function SimplePlacesSearch() {
  const [query, setQuery] = useState('');
  const { results, loading, error, search, clearResults } = useSimplePlacesSearch();

  const handleSearch = () => {
    search(query);
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
    <div className="w-full max-w-4xl mx-auto space-y-4">

      {/* Search Input + Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for restaurants, cafes, stores..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
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
            <p className="text-blue-700">🔍 Searching for "{query}"...</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4 text-green-700">
              ✅ Found {results.length} results for "{query}"
            </h3>
            <div className="space-y-3">
              {results.map((business) => (
                <div
                  key={business.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{business.name}</h4>

                      {business.address && (
                        <p className="text-gray-600 mt-1">📍 {business.address}</p>
                      )}

                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        {business.rating && (
                          <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            ⭐ {business.rating}
                            {business.ratingCount && ` (${business.ratingCount} reviews)`}
                          </span>
                        )}

                        {business.priceLevel && (
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                            💰 {business.priceLevel.replace('_', ' ')}
                          </span>
                        )}

                        {business.isOpen !== undefined && (
                          <span className={`text-sm px-2 py-1 rounded ${business.isOpen
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {business.isOpen ? '🟢 Open' : '🔴 Closed'}
                          </span>
                        )}

                        {business.phone && (
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            📞 {business.phone}
                          </span>
                        )}
                      </div>

                      {business.website && (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                        >
                          🌐 Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
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
              🔍 No businesses found for "<strong>{query}</strong>"
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Try a different search term or check your location permissions
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}