import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createAssetSchema = z.object({
  assetTag: z.string().min(1, 'Asset tag is required'),
  productId: z.string().min(1, 'Product is required'),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  vendorId: z.string().optional(),
  barcode: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  condition: z.string().min(1, 'Condition is required'),
  status: z.string().min(1, 'Status is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const assets = await prisma.asset.findMany({
      where: status ? { status } : undefined,
      include: {
        product: {
          include: {
            brand: true,
            type: true
          }
        },
        warehouse: true,
        vendor: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error('Assets GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !['Admin', 'Manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAssetSchema.parse(body)

    // Check for duplicate asset tag
    const existing = await prisma.asset.findUnique({
      where: { assetTag: validatedData.assetTag }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An asset with this tag already exists' },
        { status: 400 }
      )
    }

    const asset = await prisma.asset.create({
      data: {
        ...validatedData,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
      },
      include: {
        product: {
          include: {
            brand: true,
            type: true
          }
        },
        warehouse: true,
        vendor: true
      }
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Assets POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}