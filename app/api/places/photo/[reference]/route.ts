import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      console.error("❌ Google Places API key not configured");
      return NextResponse.json(
        { error: "Google Places API key not configured" },
        { status: 500 }
      );
    }

    // Get query parameters for image size
    const { searchParams } = new URL(request.url);
    const maxWidth = searchParams.get('w') || '400';
    const maxHeight = searchParams.get('h') || '400';

    // Await the params object (required in Next.js 15)
    const resolvedParams = await params;
    const decodedReference = decodeURIComponent(resolvedParams.reference);
    
    // Construct Google Places Photo API URL
    const photoUrl = `https://places.googleapis.com/v1/${decodedReference}/media?key=${apiKey}&maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}`;

    // Fetch the image from Google Places API
    const response = await fetch(photoUrl);

    if (!response.ok) {
      console.error("❌ Google Photos API error:", {
        status: response.status,
        statusText: response.statusText
      });
      return NextResponse.json(
        { error: "Failed to fetch photo" },
        { status: response.status }
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();

    // Return the image with proper headers
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Photo proxy error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}