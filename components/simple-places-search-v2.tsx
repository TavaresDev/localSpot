"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { BusinessCard } from '@/components/business-card';

// Two different approaches:
import { usePlacesSearch, usePlacesSearchMutation } from '@/lib/hooks/queries/usePlacesSearch';
import { Business } from '@/lib/types/business';


interface Props {
  mode: 'manual' | 'auto'; // Choose implementation mode
}

export function SimplePlacesSearchV2({ mode = 'manual' }: Props) {
  const [query, setQuery] = useState('');

  if (mode === 'auto') {
    return <AutoSearchImplementation query={query} setQuery={setQuery} />;
  } else {
    return <ManualSearchImplementation query={query} setQuery={setQuery} />;
  }
}

// OPTION A: Manual trigger with TanStack Query caching
function ManualSearchImplementation({
  query,
  setQuery
}: {
  query: string;
  setQuery: (q: string) => void;
}) {
  // Using mutation hook for manual trigger (like current implementation)
  const { search, results, loading, error, clearResults } = usePlacesSearchMutation();

  const handleSearch = () => {
    search({ query });
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

  return <SearchUI
    query={query}
    setQuery={setQuery}
    onSearch={handleSearch}
    onKeyPress={handleKeyPress}
    onClear={handleClear}
    results={results}
    loading={loading}
    error={error}
    showSearchButton={true}
  />;
}

// OPTION B: Auto-search with debouncing (like spots search)
function AutoSearchImplementation({
  query,
  setQuery
}: {
  query: string;
  setQuery: (q: string) => void;
}) {
  // Using query hook for auto-search with debouncing
  const { data, isLoading, error } = usePlacesSearch(
    { query },
    { autoSearch: true, enabled: query.trim().length > 2 }
  );

  const results = data?.businesses || [];

  const handleClear = () => {
    setQuery('');
  };

  return <SearchUI
    query={query}
    setQuery={setQuery}
    onClear={handleClear}
    results={results}
    loading={isLoading}
    error={error?.message || null}
    showSearchButton={false} // No search button needed
  />;
}

// Shared UI component
function SearchUI({
  query,
  setQuery,
  onSearch,
  onKeyPress,
  onClear,
  results,
  loading,
  error,
  showSearchButton
}: {
  query: string;
  setQuery: (q: string) => void;
  onSearch?: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  onClear: () => void;
  results: Business[]; // Changed from any[]
  loading: boolean;
  error: string | null;
  showSearchButton: boolean;
}) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={showSearchButton
                  ? "Search for restaurants, cafes, stores..."
                  : "Type to search... (auto-search enabled)"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyPress}
                className="pl-10"
                disabled={loading}
              />
            </div>

            {showSearchButton && (
              <Button
                onClick={onSearch}
                disabled={loading || !query.trim()}
                className="px-6"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Search'
                )}
              </Button>
            )}

            {(results.length > 0 || error) && (
              <Button
                variant="outline"
                onClick={onClear}
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-blue-700">🔍 Searching for {query}...</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4 text-green-700">
              ✅ Found {results.length} results for &quot;{query}&quot;
              {showSearchButton ? '' : ' (cached results load instantly!)'}
            </h3>
            <div className="space-y-3">
              {results.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  showImage={true}
                  compact={false}
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
              🔍 No businesses found for <strong>&quot;{query}&quot;</strong>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}