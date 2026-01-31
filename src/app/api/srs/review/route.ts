import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { processReview, Quality, CardStatus } from '@/lib/srs';

export const dynamic = 'force-dynamic';

interface ReviewBody {
  cardId: string;
  quality: Quality;
  responseTimeMs: number;
  sessionId?: string;
}

/**
 * POST /api/srs/review
 * Submit a review result and update card scheduling
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
    
    const body: ReviewBody = await request.json();
    const { cardId, quality, responseTimeMs, sessionId } = body;
    
    // Validate quality rating
    if (quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: 'Quality must be between 0 and 5' },
        { status: 400 }
      );
    }
    
    // Get the card
    const card = await prisma.sRSCard.findUnique({
      where: { id: cardId },
    });
    
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    
    if (card.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Store previous state for review record
    const previousState = {
      easeFactor: card.easeFactor,
      interval: card.interval,
      status: card.status,
    };
    
    // Process review using SM-2 algorithm
    const result = processReview(
      {
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        nextReviewDate: card.nextReviewDate,
        lastReviewDate: card.lastReviewDate,
        status: card.status as CardStatus,
        streak: card.streak,
        lapses: card.lapses,
      },
      quality
    );
    
    // Map CardStatus to Prisma enum
    const prismaStatus = result.status.toUpperCase() as any;
    
    // Update card and create review record in transaction
    const [updatedCard, review] = await prisma.$transaction([
      prisma.sRSCard.update({
        where: { id: cardId },
        data: {
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
          nextReviewDate: result.nextReviewDate,
          lastReviewDate: new Date(),
          status: prismaStatus,
          streak: result.streak,
          lapses: result.lapses,
          qualityHistory: { push: quality },
        },
      }),
      prisma.sRSReview.create({
        data: {
          cardId,
          userId: user.id,
          quality,
          responseTimeMs,
          previousEF: previousState.easeFactor,
          previousInterval: previousState.interval,
          previousStatus: previousState.status as any,
          newEF: result.easeFactor,
          newInterval: result.interval,
          newStatus: prismaStatus,
          sessionId,
        },
      }),
    ]);
    
    // Update session if provided
    if (sessionId) {
      const isCorrect = quality >= 3;
      await prisma.sRSSession.update({
        where: { id: sessionId },
        data: {
          cardsReviewed: { increment: 1 },
          correctCount: isCorrect ? { increment: 1 } : undefined,
          incorrectCount: !isCorrect ? { increment: 1 } : undefined,
          totalTimeMs: { increment: responseTimeMs },
        },
      });
    }
    
    // Update user stats
    await updateUserStats(user.id);
    
    return NextResponse.json({
      success: true,
      card: {
        id: updatedCard.id,
        status: updatedCard.status,
        easeFactor: updatedCard.easeFactor,
        interval: updatedCard.interval,
        nextReviewDate: updatedCard.nextReviewDate,
        streak: updatedCard.streak,
      },
      review: {
        id: review.id,
        quality,
        isCorrect: quality >= 3,
      },
    });
  } catch (error) {
    console.error('Error processing review:', error);
    return NextResponse.json(
      { error: 'Failed to process review' },
      { status: 500 }
    );
  }
}

/**
 * Update user SRS statistics
 */
async function updateUserStats(userId: string) {
  try {
    // Get card counts by status
    const cardCounts = await prisma.sRSCard.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true },
    });
    
    const counts = cardCounts.reduce((acc, c) => {
      acc[c.status.toLowerCase()] = c._count.id;
      return acc;
    }, {} as Record<string, number>);
    
    const totalCards = Object.values(counts).reduce((a, b) => a + b, 0);
    
    // Get average ease factor
    const avgEF = await prisma.sRSCard.aggregate({
      where: { userId },
      _avg: { easeFactor: true },
    });
    
    // Get reviews today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reviewsToday = await prisma.sRSReview.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });
    
    // Calculate retention rate (from recent reviews)
    const recentReviews = await prisma.sRSReview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { quality: true },
    });
    
    const retentionRate = recentReviews.length > 0
      ? (recentReviews.filter(r => r.quality >= 3).length / recentReviews.length) * 100
      : 0;
    
    // Upsert user stats
    await prisma.sRSUserStats.upsert({
      where: { userId },
      create: {
        userId,
        totalCards,
        newCards: counts.new || 0,
        learningCards: counts.learning || 0,
        reviewCards: counts.review || 0,
        masteredCards: counts.mastered || 0,
        reviewsToday,
        averageEaseFactor: avgEF._avg.easeFactor || 2.5,
        retentionRate,
        lastReviewDate: new Date(),
      },
      update: {
        totalCards,
        newCards: counts.new || 0,
        learningCards: counts.learning || 0,
        reviewCards: counts.review || 0,
        masteredCards: counts.mastered || 0,
        reviewsToday,
        averageEaseFactor: avgEF._avg.easeFactor || 2.5,
        retentionRate,
        lastReviewDate: new Date(),
        lastStatsUpdate: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    // Don't throw - this is a side effect
  }
}
