import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
      include: {
        product: {
          include: {
            brand: true,
            type: true
          }
        },
        warehouse: true,
        vendor: true,
        gigAssets: {
          include: {
            gig: {
              select: {
                name: true,
                startTime: true,
                endTime: true
              }
            }
          },
          orderBy: {
            gig: {
              startTime: 'desc'
            }
          }
        }
      }
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Asset GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || !['Admin', 'Manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if asset is currently assigned to any active gigs
    const activeAssignments = await prisma.gigAsset.findMany({
      where: {
        assetId: params.id,
        gig: {
          endTime: { gte: new Date() }
        }
      }
    })

    if (activeAssignments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete asset that is currently assigned to active gigs' },
        { status: 400 }
      )
    }

    await prisma.asset.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Asset deleted successfully' })
  } catch (error) {
    console.error('Asset DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}