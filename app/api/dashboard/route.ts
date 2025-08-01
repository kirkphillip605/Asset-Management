import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get dashboard statistics
    const [
      totalAssets,
      availableAssets,
      activeGigs,
      totalUsers,
      upcomingGigs,
      recentActivity
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'available' } }),
      prisma.gig.count({
        where: {
          startTime: { lte: new Date() },
          endTime: { gte: new Date() }
        }
      }),
      session.user.role === 'Admin' ? prisma.user.count() : 0,
      prisma.gig.findMany({
        where: {
          startTime: { gt: new Date() }
        },
        include: {
          venue: { select: { name: true } },
          _count: {
            select: { staff: true, assets: true }
          }
        },
        orderBy: { startTime: 'asc' },
        take: 5
      }),
      prisma.assetConditionLog.findMany({
        include: {
          asset: {
            include: {
              product: { select: { name: true } }
            }
          },
          user: { select: { name: true } }
        },
        orderBy: { recordedAt: 'desc' },
        take: 10
      })
    ])

    // Format recent activity
    const formattedActivity = recentActivity.map(log => ({
      type: 'asset',
      description: `${log.user?.name || 'Unknown'} updated ${log.asset.product.name} condition to ${log.condition}`,
      timestamp: log.recordedAt
    }))

    return NextResponse.json({
      totalAssets,
      availableAssets,
      activeGigs,
      totalUsers,
      upcomingGigs,
      recentActivity: formattedActivity
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}