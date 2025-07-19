import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    // Get all dictionary categories globally
    const categories = await prisma.nkoDictionaryCategory.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        entryCount: 0 // Could add count if needed
      }))
    });
  } catch (error) {
    console.error("Error fetching dictionary categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
