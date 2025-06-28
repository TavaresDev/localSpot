import { uploadImageAssets } from "@/lib/upload-image";
import { NextRequest, NextResponse } from "next/server";
import { APIException, withErrorHandling } from "@/lib/api-error";

export const config = {
  api: { bodyParser: false }, // Disable default body parsing
};

export const POST = withErrorHandling(async (req: Request) => {
  // Parse the form data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    throw APIException.badRequest("No file provided");
  }

  // Validate MIME type - only allow image files
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    throw APIException.badRequest(
      "Invalid file type. Only image files are allowed.",
      { receivedType: file.type, allowedTypes: allowedMimeTypes }
    );
  }

  // Validate file size - limit to 10MB
  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeInBytes) {
    throw APIException.badRequest(
      "File too large. Maximum size allowed is 10MB.",
      { fileSize: file.size, maxSize: maxSizeInBytes }
    );
  }

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Generate a unique filename with original extension
  const fileExt = file.name.split(".").pop() || "";
  const timestamp = Date.now();
  const filename = `upload-${timestamp}.${fileExt || "png"}`;

  // Upload the file
  const url = await uploadImageAssets(buffer, filename);

  return NextResponse.json({ url });
});
