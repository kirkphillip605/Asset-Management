import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createGigSchema = z.object({
  name: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  venueId: z.string().optional(),
  contactId: z.string().optional(),
  notes: z.string().optional(),
  staffIds: z.array(z.string()),
  assetIds: z.array(z.string()),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gigs = await prisma.gig.findMany({
      include: {
        venue: { select: { name: true } },
        contact: { select: { name: true } },
        _count: {
          select: { staff: true, assets: true }
        }
      },
      orderBy: { startTime: 'desc' }
    })

    return NextResponse.json(gigs)
  } catch (error) {
    console.error('Gigs GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['Admin', 'Manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createGigSchema.parse(body)

    // Check for conflicts
    const startTime = new Date(validatedData.startTime)
    const endTime = new Date(validatedData.endTime)

    // Check staff conflicts
    if (validatedData.staffIds.length > 0) {
      const conflicts = await prisma.gigStaff.findMany({
        where: {
          userId: { in: validatedData.staffIds },
          gig: {
            OR: [
              {
                startTime: { lt: endTime },
                endTime: { gt: startTime }
              }
            ]
          }
        },
        include: {
          user: { select: { name: true } },
          gig: { select: { name: true, startTime: true, endTime: true } }
        }
      })

      if (conflicts.length > 0) {
        return NextResponse.json(
          { 
            error: `Staff conflict detected: ${conflicts[0].user?.name} is already assigned to "${conflicts[0].gig.name}"` 
          },
          { status: 400 }
        )
      }
    }

    // Check asset conflicts
    if (validatedData.assetIds.length > 0) {
      const assetConflicts = await prisma.gigAsset.findMany({
        where: {
          assetId: { in: validatedData.assetIds },
          gig: {
            OR: [
              {
                startTime: { lt: endTime },
                endTime: { gt: startTime }
              }
            ]
          }
        },
        include: {
          asset: { select: { assetTag: true } },
          gig: { select: { name: true, startTime: true, endTime: true } }
        }
      })

      if (assetConflicts.length > 0) {
        return NextResponse.json(
          { 
            error: `Asset conflict detected: Asset ${assetConflicts[0].asset.assetTag} is already assigned to "${assetConflicts[0].gig.name}"` 
          },
          { status: 400 }
        )
      }
    }

    // Create the gig with staff and asset assignments
    const gig = await prisma.gig.create({
      data: {
        name: validatedData.name,
        startTime,
        endTime,
        venueId: validatedData.venueId || null,
        contactId: validatedData.contactId || null,
        notes: validatedData.notes,
        createdById: session.user.id,
        staff: {
          create: validatedData.staffIds.map(userId => ({ userId }))
        },
        assets: {
          create: validatedData.assetIds.map(assetId => ({ 
            assetId,
            assignedById: session.user.id 
          }))
        }
      },
      include: {
        venue: true,
        contact: true,
        staff: { include: { user: true } },
        assets: { include: { asset: true } }
      }
    })

    return NextResponse.json(gig, { status: 201 })
  } catch (error) {
    console.error('Gigs POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}