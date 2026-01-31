import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/srs/session
 * Start a new review session
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
    
    // Create new session
    const newSession = await prisma.sRSSession.create({
      data: {
        userId: user.id,
        startedAt: new Date(),
        cardsReviewed: 0,
        correctCount: 0,
        incorrectCount: 0,
        averageQuality: 0,
        totalTimeMs: 0,
      },
    });
    
    return NextResponse.json({
      success: true,
      session: newSession,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/srs/session
 * End a review session
 */
export async function PATCH(request: NextRequest) {
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
    const { sessionId } = body;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    const reviewSession = await prisma.sRSSession.findUnique({
      where: { id: sessionId },
      include: { reviews: true },
    });
    
    if (!reviewSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    if (reviewSession.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Calculate average quality
    const avgQuality = reviewSession.reviews.length > 0
      ? reviewSession.reviews.reduce((sum, r) => sum + r.quality, 0) / reviewSession.reviews.length
      : 0;
    
    // Update session with end time and stats
    const updatedSession = await prisma.sRSSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        averageQuality: avgQuality,
      },
    });
    
    // Update user's total study time
    const studyTimeMinutes = Math.round(updatedSession.totalTimeMs / 60000);
    
    await prisma.sRSUserStats.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totalStudyTimeMinutes: studyTimeMinutes,
        totalReviews: reviewSession.cardsReviewed,
      },
      update: {
        totalStudyTimeMinutes: { increment: studyTimeMinutes },
        totalReviews: { increment: reviewSession.cardsReviewed },
      },
    });
    
    return NextResponse.json({
      success: true,
      session: {
        ...updatedSession,
        averageQuality: avgQuality,
        studyTimeMinutes,
      },
      summary: {
        cardsReviewed: reviewSession.cardsReviewed,
        correctCount: reviewSession.correctCount,
        incorrectCount: reviewSession.incorrectCount,
        accuracy: reviewSession.cardsReviewed > 0
          ? Math.round((reviewSession.correctCount / reviewSession.cardsReviewed) * 100)
          : 0,
        averageQuality: Math.round(avgQuality * 10) / 10,
        duration: studyTimeMinutes,
      },
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/srs/session
 * Get session history
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
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sessionId = searchParams.get('id');
    
    if (sessionId) {
      const reviewSession = await prisma.sRSSession.findUnique({
        where: { id: sessionId },
        include: {
          reviews: {
            orderBy: { createdAt: 'asc' },
            include: {
              card: {
                select: {
                  front: true,
                  back: true,
                  cardType: true,
                },
              },
            },
          },
        },
      });
      
      if (!reviewSession || reviewSession.userId !== user.id) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      
      return NextResponse.json({ session: reviewSession });
    }
    
    const sessions = await prisma.sRSSession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
