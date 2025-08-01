import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !['Admin', 'Manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get overview statistics
    const [
      totalAssets,
      availableAssets,
      assetsInUse,
      totalGigs,
      activeGigs,
      totalUsers
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'available' } }),
      prisma.asset.count({ where: { status: 'in-use' } }),
      prisma.gig.count(),
      prisma.gig.count({
        where: {
          startTime: { lte: new Date() },
          endTime: { gte: new Date() }
        }
      }),
      session.user.role === 'Admin' ? prisma.user.count() : 0
    ])

    // Get asset statistics
    const [assetsByStatus, assetsByCondition] = await Promise.all([
      prisma.asset.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.asset.groupBy({
        by: ['condition'],
        _count: { condition: true }
      })
    ])

    // Convert to objects
    const statusStats = assetsByStatus.reduce((acc, item) => {
      acc[item.status || 'unknown'] = item._count.status
      return acc
    }, {} as { [key: string]: number })

    const conditionStats = assetsByCondition.reduce((acc, item) => {
      acc[item.condition || 'unknown'] = item._count.condition
      return acc
    }, {} as { [key: string]: number })

    // Get gigs by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const gigsByMonth = await prisma.gig.groupBy({
      by: ['startTime'],
      where: {
        startTime: { gte: sixMonthsAgo }
      },
      _count: { id: true }
    })

    // Group by month
    const monthlyGigs = gigsByMonth.reduce((acc, gig) => {
      const month = gig.startTime.toISOString().substring(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + gig._count.id
      return acc
    }, {} as { [key: string]: number })

    const gigsByMonthArray = Object.entries(monthlyGigs).map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      count
    }))

    // Get top assets by usage
    const topAssets = await prisma.gigAsset.groupBy({
      by: ['assetId'],
      _count: { assetId: true },
      orderBy: { _count: { assetId: 'desc' } },
      take: 10
    })

    const topAssetsWithNames = await Promise.all(
      topAssets.map(async (item) => {
        const asset = await prisma.asset.findUnique({
          where: { id: item.assetId },
          include: { product: true }
        })
        return {
          name: asset?.product.name || 'Unknown Asset',
          usageCount: item._count.assetId
        }
      })
    )

    // Get user activity (Admin only)
    let userActivity: any[] = []
    if (session.user.role === 'Admin') {
      const usersWithStats = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          lastLogin: true,
          _count: {
            select: { gigStaff: true }
          }
        },
        orderBy: { lastLogin: 'desc' },
        take: 10
      })

      userActivity = usersWithStats.map(user => ({
        name: user.name,
        lastLogin: user.lastLogin?.toISOString() || '',
        gigCount: user._count.gigStaff
      }))
    }

    // Get recent activity
    const recentActivity = await prisma.assetConditionLog.findMany({
      include: {
        asset: { include: { product: true } },
        user: { select: { name: true } }
      },
      orderBy: { recordedAt: 'desc' },
      take: 10
    })

    const formattedActivity = recentActivity.map(log => ({
      type: 'asset',
      description: `${log.user?.name || 'Unknown'} updated ${log.asset.product.name} condition to ${log.condition}`,
      timestamp: log.recordedAt.toISOString()
    }))

    const reportData = {
      overview: {
        totalAssets,
        availableAssets,
        assetsInUse,
        totalGigs,
        activeGigs,
        totalUsers
      },
      assetsByCondition: conditionStats,
      assetsByStatus: statusStats,
      gigsByMonth: gigsByMonthArray,
      topAssets: topAssetsWithNames,
      userActivity,
      recentActivity: formattedActivity
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}