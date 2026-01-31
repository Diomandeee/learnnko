import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { startOfDay } from 'date-fns';
import { getIntervalPreviews, CardStatus, Quality } from '@/lib/srs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/srs/queue
 * Get today's due cards for review
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
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const includeNew = searchParams.get('includeNew') !== 'false';
    const newCardLimit = parseInt(searchParams.get('newCardLimit') || '10', 10);
    const cardTypes = searchParams.get('cardTypes')?.split(',') || [];
    
    const today = startOfDay(new Date());
    
    // Build where clause
    const whereClause: any = {
      userId: user.id,
      nextReviewDate: { lte: new Date() },
    };
    
    if (cardTypes.length > 0) {
      whereClause.cardType = { in: cardTypes };
    }
    
    // Get due cards (learning, review, relearning, mastered)
    const dueCards = await prisma.sRSCard.findMany({
      where: {
        ...whereClause,
        status: { not: 'NEW' },
      },
      orderBy: [
        { status: 'asc' }, // Learning/relearning first
        { nextReviewDate: 'asc' }, // Then by due date
      ],
      take: limit,
    });
    
    // Get new cards if requested
    let newCards: any[] = [];
    if (includeNew) {
      newCards = await prisma.sRSCard.findMany({
        where: {
          userId: user.id,
          status: 'NEW',
          ...(cardTypes.length > 0 ? { cardType: { in: cardTypes } } : {}),
        },
        orderBy: { createdAt: 'asc' },
        take: newCardLimit,
      });
    }
    
    // Combine and prepare cards with interval previews
    const allCards = [...dueCards, ...newCards];
    
    const cardsWithPreviews = allCards.map(card => ({
      id: card.id,
      cardType: card.cardType,
      contentId: card.contentId,
      front: card.front,
      back: card.back,
      pronunciation: card.pronunciation,
      example: card.example,
      audioUrl: card.audioUrl,
      status: card.status,
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      streak: card.streak,
      nextReviewDate: card.nextReviewDate,
      intervalPreview: getIntervalPreviews({
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        nextReviewDate: card.nextReviewDate,
        lastReviewDate: card.lastReviewDate,
        status: card.status as CardStatus,
        streak: card.streak,
        lapses: card.lapses,
      }),
    }));
    
    // Get queue statistics
    const stats = await prisma.sRSCard.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: { id: true },
    });
    
    const dueCount = await prisma.sRSCard.count({
      where: {
        userId: user.id,
        nextReviewDate: { lte: new Date() },
        status: { not: 'NEW' },
      },
    });
    
    const newCount = await prisma.sRSCard.count({
      where: {
        userId: user.id,
        status: 'NEW',
      },
    });
    
    return NextResponse.json({
      cards: cardsWithPreviews,
      queue: {
        due: dueCount,
        new: newCount,
        total: allCards.length,
      },
      stats: stats.reduce((acc, s) => {
        acc[s.status.toLowerCase()] = s._count.id;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching SRS queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review queue' },
      { status: 500 }
    );
  }
}
