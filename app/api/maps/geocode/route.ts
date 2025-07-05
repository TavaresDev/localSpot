import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateSession } from "@/lib/auth-server";
import { withErrorHandling, APIException } from "@/lib/api-error";

const geocodeSchema = z.object({
  address: z.string().min(1).max(500),
});

const reverseGeocodeSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await validateSession();
  
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw APIException.internal("Google Maps API key not configured");
  }

  const body = await request.json();
  const { address } = geocodeSchema.parse(body);

  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  const response = await fetch(geocodeUrl);
  
  if (!response.ok) {
    throw APIException.internal("Failed to geocode address");
  }

  const data = await response.json();

  if (data.status !== "OK") {
    throw APIException.badRequest(`Geocoding failed: ${data.status}`);
  }

  const results = data.results.map((result: any) => ({
    address: result.formatted_address,
    location: {
      lat: result.geometry?.location?.lat,
      lng: result.geometry?.location?.lng,
    },
    placeId: result.place_id,
    types: result.types,
  }));

  return NextResponse.json({ results });
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  await validateSession();
  
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    throw APIException.badRequest("lat and lng query parameters are required");
  }

  const { lat: latitude, lng: longitude } = reverseGeocodeSchema.parse({
    lat: parseFloat(lat),
    lng: parseFloat(lng),
  });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw APIException.internal("Google Maps API key not configured");
  }

  const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

  const response = await fetch(reverseGeocodeUrl);
  
  if (!response.ok) {
    throw APIException.internal("Failed to reverse geocode coordinates");
  }

  const data = await response.json();

  if (data.status !== "OK") {
    throw APIException.badRequest(`Reverse geocoding failed: ${data.status}`);
  }

  const results = data.results.map((result: any) => ({
    address: result.formatted_address,
    location: {
      lat: result.geometry?.location?.lat,
      lng: result.geometry?.location?.lng,
    },
    placeId: result.place_id,
    types: result.types,
  }));

  return NextResponse.json({ results });
});