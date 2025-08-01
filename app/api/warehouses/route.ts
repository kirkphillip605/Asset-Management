import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createWarehouseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: {
          select: { assets: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(warehouses)
  } catch (error) {
    console.error('Warehouses GET error:', error)
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
    const validatedData = createWarehouseSchema.parse(body)

    // Check for duplicate names
    const existing = await prisma.warehouse.findFirst({
      where: { name: validatedData.name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A warehouse with this name already exists' },
        { status: 400 }
      )
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        ...validatedData,
        createdById: session.user.id,
      },
      include: {
        _count: {
          select: { assets: true }
        }
      }
    })

    return NextResponse.json(warehouse, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Warehouses POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}