import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  BusinessSearchResponse,
  GooglePlacesResponse,
  GooglePlace,
  Business
} from "@/lib/types/business";

// Validation schema for search parameters
const searchParamsSchema = z.object({
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  radius: z.number().min(1).max(50000),
  types: z.array(z.string()).optional(),
  maxResults: z.number().min(1).max(20).optional().default(20),
  query: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  openNow: z.boolean().optional(),
});

// Transform Google Place to our Business interface
function transformGooglePlaceToBusiness(place: GooglePlace): Business {
  return {
    id: place.id,
    name: place.displayName.text,
    address: place.formattedAddress,
    location: {
      lat: place.location.latitude,
      lng: place.location.longitude,
    },
    rating: place.rating,
    ratingCount: place.userRatingCount,
    priceLevel: place.priceLevel?.replace("PRICE_LEVEL_", ""),
    phone: place.internationalPhoneNumber || place.nationalPhoneNumber,
    website: place.websiteUri,
    isOpen: place.regularOpeningHours?.openNow,
    openingHours: place.regularOpeningHours?.weekdayDescriptions,
    photos: place.photos?.map(photo => photo.name) || [],
    businessType: place.primaryType,
    businessStatus: place.businessStatus,
  };
}


export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Places API key not configured" },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    const validatedParams = searchParamsSchema.parse(body);


    // Prepare the Google Places API request
    const placesApiUrl = "https://places.googleapis.com/v1/places:searchText";

    // Build the request payload for Text Search API
    const requestPayload = {
      textQuery: validatedParams.query || "restaurant", // Use query for text search
      locationBias: {
        circle: {
          center: {
            latitude: validatedParams.location.lat,
            longitude: validatedParams.location.lng,
          },
          radius: validatedParams.radius,
        },
      },
      maxResultCount: validatedParams.maxResults,
      ...(validatedParams.types && validatedParams.types.length > 0 && {
        includedTypes: validatedParams.types,
      }),
      rankPreference: "RELEVANCE",
    };

    // Define which fields we want from the API to optimize costs
    const fieldMask = [
      "places.id",
      "places.displayName",
      "places.formattedAddress",
      "places.location",
      "places.rating",
      "places.userRatingCount",
      "places.priceLevel",
      "places.priceRange",
      "places.photos",
      "places.regularOpeningHours",
      "places.internationalPhoneNumber",
      "places.nationalPhoneNumber",
      "places.websiteUri",
      "places.businessStatus",
      "places.primaryType",
      "places.types",
    ].join(",");

    // console.log("📤 [API] Sending to Google Places:", { requestPayload, fieldMask });

    // Make the request to Google Places API
    const response = await fetch(placesApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Places API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      return NextResponse.json(
        {
          error: "Failed to fetch places from Google Places API",
          message: response.statusText,
          code: response.status,
        },
        { status: response.status }
      );
    }

    const placesData: GooglePlacesResponse = await response.json();
    // Transform Google Places data to our Business format
    let businesses = placesData.places?.map(transformGooglePlaceToBusiness) || [];

    // Apply client-side filters
    if (validatedParams.minRating) {
      businesses = businesses.filter(
        business => business.rating && business.rating >= validatedParams.minRating!
      );
    }

    if (validatedParams.openNow) {
      businesses = businesses.filter(business => business.isOpen === true);
    }

    // No need to filter by query since Google Text Search API handles this

    const searchResponse: BusinessSearchResponse = {
      businesses,
      totalResults: businesses.length,
      searchParams: validatedParams,
    };


    return NextResponse.json(searchResponse);

  } catch (error) {
    console.error("Places search API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request parameters",
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", "),
          code: 400,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while searching for places",
        code: 500,
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for basic health check
export async function GET() {
  return NextResponse.json({
    message: "Places search API is running",
    endpoints: {
      search: "POST /api/places/search",
    },
    requiredParams: {
      location: { lat: "number", lng: "number" },
      radius: "number (1-50000 meters)",
    },
    optionalParams: {
      types: "string[] (business types)",
      maxResults: "number (1-20, default: 10)",
      query: "string (search query)",
      minRating: "number (0-5)",
      openNow: "boolean",
    },
  });
}