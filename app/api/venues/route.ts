import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createVenueSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const venues = await prisma.venue.findMany({
      include: {
        _count: {
          select: { gigs: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(venues)
  } catch (error) {
    console.error('Venues GET error:', error)
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
    const validatedData = createVenueSchema.parse(body)

    // Check for duplicate names
    const existing = await prisma.venue.findFirst({
      where: { name: validatedData.name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A venue with this name already exists' },
        { status: 400 }
      )
    }

    const venue = await prisma.venue.create({
      data: {
        ...validatedData,
        createdById: session.user.id,
      },
      include: {
        _count: {
          select: { gigs: true }
        }
      }
    })

    return NextResponse.json(venue, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Venues POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}