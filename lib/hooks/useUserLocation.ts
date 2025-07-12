"use client";

import { useState, useEffect, useCallback } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

interface UseUserLocationReturn {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  refetchLocation: () => Promise<UserLocation>;
}

const STORAGE_KEY = 'user-location';
const DEFAULT_LOCATION: UserLocation = { lat: 37.7749, lng: -122.4194 }; // San Francisco fallback

export function useUserLocation(): UseUserLocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback((): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported';
        setError(error);
        console.warn('Geolocation is not supported by this browser');
        setLocation(DEFAULT_LOCATION);
        resolve(DEFAULT_LOCATION);
        return;
      }

      setIsLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };
          console.log('User location fetched:', newLocation);
          setLocation(newLocation);
          setIsLoading(false);

          // Persist to localStorage
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
          } catch (error) {
            console.warn('Failed to save location:', error);
          }

          resolve(newLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError(error.message || 'Failed to get location');
          setLocation(DEFAULT_LOCATION);
          setIsLoading(false);
          resolve(DEFAULT_LOCATION); // Resolve with fallback instead of rejecting
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000, // Accept 5-minute old position
        }
      );
    });
  }, []);

  // Load persisted location on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as UserLocation;
        // Use saved location if it's recent (within 24 hours)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setLocation(parsed);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load saved location:', error);
    }

    // Auto-fetch location on first load if no recent saved location
    getCurrentLocation().catch(console.error);
  }, [getCurrentLocation]);

  return {
    location,
    isLoading,
    error,
    refetchLocation: getCurrentLocation,
  };
}