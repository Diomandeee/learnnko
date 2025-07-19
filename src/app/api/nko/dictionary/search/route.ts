import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const lang = searchParams.get('lang') || 'nko';

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Search dictionary entries globally
    const entries = await prisma.nkoDictionaryEntry.findMany({
      where: {
        OR: [
          { nkoWord: { contains: query, mode: 'insensitive' } },
          { definition: { contains: query, mode: 'insensitive' } },
          { pronunciation: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 20,
      orderBy: { nkoWord: 'asc' }
    });

    return NextResponse.json({
      query,
      results: entries.map(entry => ({
        id: entry.id,
        nkoWord: entry.nkoWord,
        definition: entry.definition,
        pronunciation: entry.pronunciation,
        examples: entry.examples,
        category: entry.category
      }))
    });
  } catch (error) {
    console.error("Error searching dictionary:", error);
    return NextResponse.json(
      { error: "Failed to search dictionary" },
      { status: 500 }
    );
  }
}
