import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const categorySlug = params.slug;

    // Get dictionary entries for this category globally
    const entries = await prisma.nkoDictionaryEntry.findMany({
      where: { 
        category: categorySlug 
      },
      orderBy: { nkoWord: 'asc' },
      take: 50
    });

    return NextResponse.json({
      category: categorySlug,
      entries: entries.map(entry => ({
        id: entry.id,
        nkoWord: entry.nkoWord,
        definition: entry.definition,
        pronunciation: entry.pronunciation,
        examples: entry.examples,
        tags: entry.tags
      }))
    });
  } catch (error) {
    console.error("Error fetching dictionary category:", error);
    return NextResponse.json(
      { error: "Failed to fetch dictionary entries" },
      { status: 500 }
    );
  }
}
