import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
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

    const { 
      term,
      translation,
      partOfSpeech,
      latin,
      french,
      definition,
      example,
      exampleEnglish,
      exampleFrench,
      source 
    } = await req.json();
    
    // Default source to 'claude' if not provided
    const entrySource = source || 'claude';
    
    // Create dictionary entry
    const entry = await prisma.nkoDictionaryEntry.create({
      data: {
        nko: translation,
        latin: latin || translation,
        english: term,
        french: french || term,
        partOfSpeech: partOfSpeech || "n.",
        exampleNko: example,
        exampleEnglish: exampleEnglish,
        exampleFrench: exampleFrench,
        // Add a tag to indicate this is from an external source
        categories: {
          create: [
            {
              category: {
                connectOrCreate: {
                  where: { slug: 'claude' },
                  create: {
                    name: 'Claude AI',
                    slug: 'claude',
                    description: 'Terms generated or retrieved using Claude AI',
                    wordCount: 1
                  }
                }
              }
            }
          ]
        },
        // Add to user favorites automatically
        userFavorites: {
          create: {
            userId: user.id
          }
        }
      }
    });

    // Update category word count
    await prisma.nkoDictionaryCategory.update({
      where: { slug: 'claude' },
      data: {
        wordCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        nko: entry.nko,
        latin: entry.latin,
        english: entry.english,
        french: entry.french,
        partOfSpeech: entry.partOfSpeech,
        example: entry.exampleNko ? {
          nko: entry.exampleNko,
          english: entry.exampleEnglish,
          french: entry.exampleFrench
        } : undefined
      }
    });
  } catch (error) {
    console.error("Error saving external term:", error);
    return NextResponse.json(
      { error: "Failed to save external term" },
      { status: 500 }
    );
  }
}
