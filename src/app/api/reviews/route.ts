import { NextResponse, NextRequest } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { reviewService } from "@/services/reviewService";

export const POST = apiHandler(async (req: NextRequest) => {
  const { productId, userId, rating, comment } = await req.json();
  const review = await reviewService.addReview(productId, userId, rating, comment);
  return NextResponse.json({ review }, { status: 201 });
});

export const GET = apiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const reviews = await reviewService.getReviews(productId);
  return NextResponse.json({ reviews });
});
