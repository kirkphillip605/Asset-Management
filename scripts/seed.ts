import { PrismaClient, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.Admin,
      passwordHash: adminPassword,
    },
  })

  // Create manager user
  const managerPassword = await hash('manager123', 12)
  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      name: 'Manager User',
      role: UserRole.Manager,
      passwordHash: managerPassword,
    },
  })

  // Create regular user
  const userPassword = await hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      role: UserRole.User,
      passwordHash: userPassword,
    },
  })

  // Create brands
  const brand1 = await prisma.brand.create({
    data: {
      name: 'Shure',
      description: 'Professional audio equipment',
      website: 'https://www.shure.com',
    },
  })

  const brand2 = await prisma.brand.create({
    data: {
      name: 'QSC',
      description: 'Audio, video and control solutions',
      website: 'https://www.qsc.com',
    },
  })

  // Create product types
  const micType = await prisma.productType.create({
    data: {
      name: 'Microphone',
      description: 'Audio input devices',
    },
  })

  const speakerType = await prisma.productType.create({
    data: {
      name: 'Speaker',
      description: 'Audio output devices',
    },
  })

  // Create vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'Audio Solutions Inc',
      description: 'Professional audio equipment supplier',
      contactEmail: 'orders@audiosolutions.com',
      contactPhone: '555-0123',
    },
  })

  // Create products
  const product1 = await prisma.product.create({
    data: {
      name: 'SM58 Dynamic Microphone',
      brandId: brand1.id,
      typeId: micType.id,
      description: 'Industry standard dynamic vocal microphone',
      modelNumber: 'SM58',
      defaultPrice: 99.99,
    },
  })

  const product2 = await prisma.product.create({
    data: {
      name: 'K12.2 Active Speaker',
      brandId: brand2.id,
      typeId: speakerType.id,
      description: '2-way powered loudspeaker',
      modelNumber: 'K12.2',
      defaultPrice: 699.99,
    },
  })

  // Create warehouse
  const warehouse1 = await prisma.warehouse.create({
    data: {
      name: 'Main Warehouse',
      description: 'Primary storage facility',
      address1: '123 Storage St',
      city: 'Equipment City',
      state: 'CA',
      zip: '90210',
      createdById: admin.id,
    },
  })

  // Create assets
  const asset1 = await prisma.asset.create({
    data: {
      productId: product1.id,
      assetTag: 'MIC001',
      serialNumber: 'SM58-123456',
      purchaseDate: new Date('2023-01-15'),
      purchasePrice: 99.99,
      vendorId: vendor1.id,
      barcode: '123456789012',
      notes: 'Primary vocal microphone',
      location: 'Rack A1',
      condition: 'excellent',
      status: 'available',
      warehouseId: warehouse1.id,
    },
  })

  const asset2 = await prisma.asset.create({
    data: {
      productId: product2.id,
      assetTag: 'SPK001',
      serialNumber: 'K12-789012',
      purchaseDate: new Date('2023-02-01'),
      purchasePrice: 699.99,
      vendorId: vendor1.id,
      barcode: '123456789013',
      notes: 'Main PA speaker',
      location: 'Floor B2',
      condition: 'good',
      status: 'available',
      warehouseId: warehouse1.id,
    },
  })

  // Create venue
  const venue1 = await prisma.venue.create({
    data: {
      name: 'Grand Concert Hall',
      address1: '456 Music Ave',
      city: 'Performance City',
      state: 'CA',
      zip: '90211',
      phone: '555-0456',
      createdById: admin.id,
    },
  })

  // Create contact
  const contact1 = await prisma.contact.create({
    data: {
      name: 'John Smith',
      phone: '555-0789',
      email: 'john@venue.com',
      notes: 'Venue manager',
      createdById: admin.id,
    },
  })

  // Create sample gig
  const gig1 = await prisma.gig.create({
    data: {
      name: 'Rock Concert 2024',
      startTime: new Date('2024-03-15T19:00:00Z'),
      endTime: new Date('2024-03-15T23:00:00Z'),
      venueId: venue1.id,
      contactId: contact1.id,
      notes: 'Main stage setup required',
      createdById: admin.id,
    },
  })

  // Assign staff to gig
  await prisma.gigStaff.create({
    data: {
      gigId: gig1.id,
      userId: user.id,
    },
  })

  // Assign assets to gig
  await prisma.gigAsset.create({
    data: {
      gigId: gig1.id,
      assetId: asset1.id,
      assignedById: admin.id,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Users created:')
  console.log('  - admin@example.com (password: admin123)')
  console.log('  - manager@example.com (password: manager123)')
  console.log('  - user@example.com (password: user123)')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })