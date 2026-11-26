import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdminSession } from "@/lib/auth-checks";

export async function POST() {
  try {
    // 1. Strict server authorization guard
    await requireAdminSession();

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
    const apiKey = process.env.CLOUDINARY_API_KEY || "";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

    // If Cloudinary keys are placeholders, notify client to use local fallback
    if (!cloudName || !apiKey || !apiSecret || cloudName.includes("placeholder")) {
      return NextResponse.json({
        isPlaceholder: true,
        message: "Cloudinary keys not configured in .env. You can use image URLs directly.",
      });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "rore_products";

    // Generate cryptographic signature with api_secret server-side
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret
    );

    return NextResponse.json({
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json(
      { error: "Unauthorized or failed to generate upload signature" },
      { status: 401 }
    );
  }
}
