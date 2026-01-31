import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { startOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

interface CreateCardBody {
  cardType: 'VOCABULARY' | 'LESSON' | 'CHARACTER' | 'PHRASE';
  contentId: string;
  front: string;
  back: string;
  pronunciation?: string;
  example?: string;
  audioUrl?: string;
}

interface BulkCreateBody {
  cards: CreateCardBody[];
}

/**
 * GET /api/srs/cards
 * Get all cards for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const cardType = searchParams.get('cardType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    const where: any = { userId: user.id };
    
    if (cardType) {
      where.cardType = cardType.toUpperCase();
    }
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    const [cards, total] = await Promise.all([
      prisma.sRSCard.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.sRSCard.count({ where }),
    ]);
    
    return NextResponse.json({
      cards,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + cards.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/srs/cards
 * Create a new card or bulk create cards
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const today = startOfDay(new Date());
    
    // Check if bulk create
    if (Array.isArray(body.cards)) {
      const { cards } = body as BulkCreateBody;
      
      // Validate cards
      for (const card of cards) {
        if (!card.cardType || !card.contentId || !card.front || !card.back) {
          return NextResponse.json(
            { error: 'Each card must have cardType, contentId, front, and back' },
            { status: 400 }
          );
        }
      }
      
      // Create cards, skipping duplicates
      const created: any[] = [];
      const skipped: string[] = [];
      
      for (const card of cards) {
        const exists = await prisma.sRSCard.findUnique({
          where: {
            userId_cardType_contentId: {
              userId: user.id,
              cardType: card.cardType,
              contentId: card.contentId,
            },
          },
        });
        
        if (exists) {
          skipped.push(card.contentId);
          continue;
        }
        
        const newCard = await prisma.sRSCard.create({
          data: {
            userId: user.id,
            cardType: card.cardType,
            contentId: card.contentId,
            front: card.front,
            back: card.back,
            pronunciation: card.pronunciation,
            example: card.example,
            audioUrl: card.audioUrl,
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            nextReviewDate: today,
            status: 'NEW',
            streak: 0,
            lapses: 0,
          },
        });
        
        created.push(newCard);
      }
      
      return NextResponse.json({
        success: true,
        created: created.length,
        skipped: skipped.length,
        cards: created,
      });
    }
    
    // Single card creation
    const card = body as CreateCardBody;
    
    if (!card.cardType || !card.contentId || !card.front || !card.back) {
      return NextResponse.json(
        { error: 'cardType, contentId, front, and back are required' },
        { status: 400 }
      );
    }
    
    // Check for duplicate
    const exists = await prisma.sRSCard.findUnique({
      where: {
        userId_cardType_contentId: {
          userId: user.id,
          cardType: card.cardType,
          contentId: card.contentId,
        },
      },
    });
    
    if (exists) {
      return NextResponse.json(
        { error: 'Card already exists for this content' },
        { status: 409 }
      );
    }
    
    const newCard = await prisma.sRSCard.create({
      data: {
        userId: user.id,
        cardType: card.cardType,
        contentId: card.contentId,
        front: card.front,
        back: card.back,
        pronunciation: card.pronunciation,
        example: card.example,
        audioUrl: card.audioUrl,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: today,
        status: 'NEW',
        streak: 0,
        lapses: 0,
      },
    });
    
    return NextResponse.json({
      success: true,
      card: newCard,
    });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/srs/cards
 * Delete a card
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const cardId = searchParams.get('id');
    
    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      );
    }
    
    const card = await prisma.sRSCard.findUnique({
      where: { id: cardId },
    });
    
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    
    if (card.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    await prisma.sRSCard.delete({
      where: { id: cardId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}
