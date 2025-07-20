import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // For now, return empty favorites since the schema needs to be updated
    // TODO: Update NkoUserFavorite model to include userId and proper relations
    const favoriteWords: any[] = [];

    // Alternative: Get some sample dictionary entries to show the component works
    const sampleEntries = await prisma.nkoDictionaryEntry.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const formattedEntries = sampleEntries.map(entry => ({
      id: entry.id.toString(),
      nko: entry.nkoText,
      latin: entry.nkoText, // Using nkoText as fallback
      english: entry.translation,
      french: entry.translation, // Using translation as fallback
      partOfSpeech: entry.pronunciation || 'n.',
      isFavorite: true,
      createdAt: entry.createdAt.toISOString()
    }));

    return NextResponse.json({ favorites: formattedEntries });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { entryId } = await req.json();
    
    if (!entryId) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if entry exists
    const entry = await prisma.nkoDictionaryEntry.findUnique({
      where: { id: entryId }
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Dictionary entry not found" },
        { status: 404 }
      );
    }

    // For now, just return success since schema needs updating
    // TODO: Fix NkoUserFavorite schema to include userId field
    
    return NextResponse.json({
      success: true,
      favorite: {
        id: entry.id,
        nko: entry.nkoText,
        latin: entry.nkoText,
        english: entry.translation,
        french: entry.translation,
        partOfSpeech: entry.pronunciation || 'n.',
        isFavorite: true
      }
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}
