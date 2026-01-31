import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { startOfDay, subDays, startOfWeek, startOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

/**
 * GET /api/srs/stats
 * Get user's SRS statistics
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
    const includeHistory = searchParams.get('history') === 'true';
    const historyDays = parseInt(searchParams.get('historyDays') || '30', 10);
    
    // Get or create user stats
    let stats = await prisma.sRSUserStats.findUnique({
      where: { userId: user.id },
    });
    
    if (!stats) {
      // Calculate stats if not exists
      stats = await calculateAndCreateStats(user.id);
    }
    
    // Get due card counts
    const now = new Date();
    const today = startOfDay(now);
    const weekEnd = startOfDay(subDays(now, -7));
    
    const dueToday = await prisma.sRSCard.count({
      where: {
        userId: user.id,
        nextReviewDate: { lte: now },
        status: { not: 'NEW' },
      },
    });
    
    const dueThisWeek = await prisma.sRSCard.count({
      where: {
        userId: user.id,
        nextReviewDate: { lte: weekEnd },
        status: { not: 'NEW' },
      },
    });
    
    const overdue = await prisma.sRSCard.count({
      where: {
        userId: user.id,
        nextReviewDate: { lt: today },
        status: { not: 'NEW' },
      },
    });
    
    // Calculate streak
    const streak = await calculateStreak(user.id);
    
    // Build response
    const response: any = {
      cardCounts: {
        total: stats.totalCards,
        new: stats.newCards,
        learning: stats.learningCards,
        review: stats.reviewCards,
        mastered: stats.masteredCards,
      },
      dueCounts: {
        today: dueToday,
        thisWeek: dueThisWeek,
        overdue,
      },
      performance: {
        averageEaseFactor: stats.averageEaseFactor,
        retentionRate: stats.retentionRate,
      },
      streak: {
        current: streak.current,
        longest: Math.max(streak.longest, stats.longestStreak),
      },
      activity: {
        reviewsToday: stats.reviewsToday,
        reviewsThisWeek: stats.reviewsThisWeek,
        reviewsThisMonth: stats.reviewsThisMonth,
        totalReviews: stats.totalReviews,
        totalStudyTimeMinutes: stats.totalStudyTimeMinutes,
      },
      lastReviewDate: stats.lastReviewDate,
    };
    
    // Include history if requested
    if (includeHistory) {
      response.history = await getDailyHistory(user.id, historyDays);
      response.forecast = await getReviewForecast(user.id, 7);
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching SRS stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

/**
 * Calculate and create initial stats for a user
 */
async function calculateAndCreateStats(userId: string) {
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
  
  const avgEF = await prisma.sRSCard.aggregate({
    where: { userId },
    _avg: { easeFactor: true },
  });
  
  const totalReviews = await prisma.sRSReview.count({
    where: { userId },
  });
  
  return await prisma.sRSUserStats.create({
    data: {
      userId,
      totalCards,
      newCards: counts.new || 0,
      learningCards: counts.learning || 0,
      reviewCards: counts.review || 0,
      masteredCards: counts.mastered || 0,
      totalReviews,
      averageEaseFactor: avgEF._avg.easeFactor || 2.5,
    },
  });
}

/**
 * Calculate current and longest streak
 */
async function calculateStreak(userId: string): Promise<{ current: number; longest: number }> {
  const reviews = await prisma.sRSReview.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
    distinct: ['createdAt'],
  });
  
  if (reviews.length === 0) {
    return { current: 0, longest: 0 };
  }
  
  // Get unique review days
  const reviewDays = new Set<string>();
  reviews.forEach(r => {
    reviewDays.add(startOfDay(r.createdAt).toISOString().split('T')[0]);
  });
  
  const sortedDays = Array.from(reviewDays).sort().reverse();
  
  const today = startOfDay(new Date()).toISOString().split('T')[0];
  const yesterday = startOfDay(subDays(new Date(), 1)).toISOString().split('T')[0];
  
  // Check if streak is active
  const isStreakActive = sortedDays[0] === today || sortedDays[0] === yesterday;
  
  if (!isStreakActive) {
    return { current: 0, longest: calculateLongestStreak(sortedDays) };
  }
  
  // Calculate current streak
  let currentStreak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const currentDate = new Date(sortedDays[i - 1]);
    const prevDate = new Date(sortedDays[i]);
    const diff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diff === 1) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  return {
    current: currentStreak,
    longest: Math.max(currentStreak, calculateLongestStreak(sortedDays)),
  };
}

/**
 * Calculate longest streak from sorted days
 */
function calculateLongestStreak(sortedDays: string[]): number {
  if (sortedDays.length === 0) return 0;
  
  let longest = 1;
  let current = 1;
  
  for (let i = 1; i < sortedDays.length; i++) {
    const currentDate = new Date(sortedDays[i - 1]);
    const prevDate = new Date(sortedDays[i]);
    const diff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  
  return longest;
}

/**
 * Get daily history for charts
 */
async function getDailyHistory(userId: string, days: number) {
  const history: { date: string; reviewed: number; correct: number; newLearned: number }[] = [];
  const today = startOfDay(new Date());
  
  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    const nextDate = subDays(today, i - 1);
    const dateStr = date.toISOString().split('T')[0];
    
    const reviews = await prisma.sRSReview.findMany({
      where: {
        userId,
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      },
      select: { quality: true, previousStatus: true },
    });
    
    history.push({
      date: dateStr,
      reviewed: reviews.length,
      correct: reviews.filter(r => r.quality >= 3).length,
      newLearned: reviews.filter(r => r.previousStatus === 'NEW').length,
    });
  }
  
  return history.reverse();
}

/**
 * Get review forecast for upcoming days
 */
async function getReviewForecast(userId: string, days: number) {
  const forecast: { date: string; count: number }[] = [];
  const today = startOfDay(new Date());
  
  for (let i = 0; i < days; i++) {
    const date = subDays(today, -i);
    const nextDate = subDays(today, -(i + 1));
    const dateStr = date.toISOString().split('T')[0];
    
    const count = await prisma.sRSCard.count({
      where: {
        userId,
        nextReviewDate: {
          gte: date,
          lt: nextDate,
        },
        status: { not: 'NEW' },
      },
    });
    
    forecast.push({ date: dateStr, count });
  }
  
  return forecast;
}
