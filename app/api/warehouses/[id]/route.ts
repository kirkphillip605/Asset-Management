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

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: params.id },
      include: {
        assets: {
          include: {
            product: {
              include: {
                brand: true,
                type: true
              }
            }
          }
        },
        _count: {
          select: { assets: true }
        }
      }
    })

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 })
    }

    return NextResponse.json(warehouse)
  } catch (error) {
    console.error('Warehouse GET error:', error)
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

    // Check if warehouse has assets
    const assetCount = await prisma.asset.count({
      where: { warehouseId: params.id }
    })

    if (assetCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete warehouse that contains assets' },
        { status: 400 }
      )
    }

    await prisma.warehouse.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Warehouse deleted successfully' })
  } catch (error) {
    console.error('Warehouse DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}