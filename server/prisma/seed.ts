// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Create Departments
  console.log('📁 Creating departments...')
  const itDept = await prisma.department.create({
    data: {
      name: 'IT Department',
      status: 'ACTIVE',
    },
  })

  const hrDept = await prisma.department.create({
    data: {
      name: 'HR Department',
      status: 'ACTIVE',
    },
  })

  const financeDept = await prisma.department.create({
    data: {
      name: 'Finance Department',
      status: 'ACTIVE',
      parentDeptId: itDept.id,
    },
  })

  console.log(`✓ Created ${3} departments`)

  // 2. Create Asset Categories
  console.log('🏷️ Creating asset categories...')
  const electronicsCategory = await prisma.assetCategory.create({
    data: {
      name: 'Electronics',
      description: 'Computers, monitors, peripherals',
      customFields: {
        warrantyPeriod: '24 months',
        serviceProvider: 'TechCare',
      },
    },
  })

  const furnitureCategory = await prisma.assetCategory.create({
    data: {
      name: 'Furniture',
      description: 'Desks, chairs, cabinets',
    },
  })

  const vehicleCategory = await prisma.assetCategory.create({
    data: {
      name: 'Vehicles',
      description: 'Cars, bikes, vans',
      customFields: {
        insuranceProvider: 'ABC Insurance',
        registrationRequired: true,
      },
    },
  })

  console.log(`✓ Created ${3} asset categories`)

  // 3. Create Employees
  console.log('👥 Creating employees...')
  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const userPassword = await bcrypt.hash('User123!', 10)

  const admin = await prisma.employee.create({
    data: {
      name: 'Admin User',
      email: 'admin@assetflow.com',
      password: adminPassword,
      deptId: itDept.id,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  const assetManager = await prisma.employee.create({
    data: {
      name: 'John Manager',
      email: 'john.manager@assetflow.com',
      password: userPassword,
      deptId: itDept.id,
      role: 'ASSET_MANAGER',
      status: 'ACTIVE',
    },
  })

  const deptHead = await prisma.employee.create({
    data: {
      name: 'Sarah Head',
      email: 'sarah.head@assetflow.com',
      password: userPassword,
      deptId: hrDept.id,
      role: 'DEPARTMENT_HEAD',
      status: 'ACTIVE',
    },
  })

  const employee1 = await prisma.employee.create({
    data: {
      name: 'Alice Employee',
      email: 'alice.employee@assetflow.com',
      password: userPassword,
      deptId: itDept.id,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    },
  })

  const employee2 = await prisma.employee.create({
    data: {
      name: 'Bob Employee',
      email: 'bob.employee@assetflow.com',
      password: userPassword,
      deptId: hrDept.id,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    },
  })

  const employee3 = await prisma.employee.create({
    data: {
      name: 'Charlie Employee',
      email: 'charlie.employee@assetflow.com',
      password: userPassword,
      deptId: financeDept.id,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    },
  })

  console.log(`✓ Created ${6} employees`)

  // 4. Create Assets
  console.log('📦 Creating assets...')
  
  // Generate asset tags
  const generateAssetTag = (index: number) => `AF-${String(index).padStart(4, '0')}`

  const laptop1 = await prisma.asset.create({
    data: {
      assetTag: generateAssetTag(1),
      serialNumber: 'SN-LAPTOP-001',
      categoryId: electronicsCategory.id,
      status: 'AVAILABLE',
      condition: 'EXCELLENT',
      location: 'Office-A, Desk 1',
      isShareable: false,
      acquiredDate: new Date('2023-01-15'),
      acquiredCost: 1200.0,
      description: 'HP EliteBook 14 inch',
      photoUrl: 'https://example.com/laptop1.jpg',
    },
  })

  const laptop2 = await prisma.asset.create({
    data: {
      assetTag: generateAssetTag(2),
      serialNumber: 'SN-LAPTOP-002',
      categoryId: electronicsCategory.id,
      status: 'AVAILABLE',
      condition: 'GOOD',
      location: 'Office-B, Desk 2',
      isShareable: false,
      acquiredDate: new Date('2023-02-20'),
      acquiredCost: 1100.0,
      description: 'Dell Inspiron 15',
    },
  })

  const monitor1 = await prisma.asset.create({
    data: {
      assetTag: generateAssetTag(3),
      serialNumber: 'SN-MONITOR-001',
      categoryId: electronicsCategory.id,
      status: 'AVAILABLE',
      condition: 'EXCELLENT',
      location: 'Office-A, Desk 1',
      isShareable: false,
      acquiredDate: new Date('2023-03-10'),
      acquiredCost: 350.0,
      description: '24 inch LG Monitor',
    },
  })

  const chair1 = await prisma.asset.create({
    data: {
      assetTag: generateAssetTag(4),
      serialNumber: 'SN-CHAIR-001',
      categoryId: furnitureCategory.id,
      status: 'AVAILABLE',
      condition: 'GOOD',
      location: 'Office-A',
      isShareable: false,
      acquiredDate: new Date('2022-06-01'),
      acquiredCost: 450.0,
      description: 'Ergonomic Office Chair',
    },
  })

  const van1 = await prisma.asset.create({
    data: {
      assetTag: generateAssetTag(5),
      serialNumber: 'VEH-VAN-001',
      categoryId: vehicleCategory.id,
      status: 'AVAILABLE',
      condition: 'EXCELLENT',
      location: 'Parking-A',
      isShareable: true,  // Shared resource
      acquiredDate: new Date('2022-01-01'),
      acquiredCost: 45000.0,
      description: 'Ford Transit Van',
    },
  })

  const conferenceRoom = await prisma.asset.create({
    data: {
      assetTag: generateAssetTag(6),
      serialNumber: 'ROOM-CONF-001',
      categoryId: furnitureCategory.id,
      status: 'AVAILABLE',
      condition: 'EXCELLENT',
      location: 'Building-A, 3rd Floor',
      isShareable: true,  // Shared resource for bookings
      description: 'Conference Room A (seats 10)',
    },
  })

  console.log(`✓ Created ${6} assets`)

  // 5. Create Allocations
  console.log('📋 Creating allocations...')

  const allocation1 = await prisma.assetAllocation.create({
    data: {
      assetId: laptop1.id,
      allocatedToEmployeeId: employee1.id,
      expectedReturnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'ALLOCATED',
    },
  })

  // Update asset status to ALLOCATED
  await prisma.asset.update({
    where: { id: laptop1.id },
    data: { status: 'ALLOCATED' },
  })

  const allocation2 = await prisma.assetAllocation.create({
    data: {
      assetId: monitor1.id,
      allocatedToEmployeeId: employee1.id,
      expectedReturnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ALLOCATED',
    },
  })

  await prisma.asset.update({
    where: { id: monitor1.id },
    data: { status: 'ALLOCATED' },
  })

  console.log(`✓ Created ${2} allocations`)

  // 6. Create Resource Bookings
  console.log('📅 Creating bookings...')

  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const booking1 = await prisma.resourceBooking.create({
    data: {
      resourceId: conferenceRoom.id,
      bookedByEmployeeId: employee1.id,
      startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
      status: 'UPCOMING',
      notes: 'Team standup meeting',
    },
  })

  const booking2 = await prisma.resourceBooking.create({
    data: {
      resourceId: van1.id,
      bookedByEmployeeId: employee2.id,
      startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(17, 0, 0, 0)),
      status: 'UPCOMING',
      notes: 'Delivery trip',
    },
  })

  console.log(`✓ Created ${2} bookings`)

  // 7. Create Maintenance Request
  console.log('🔧 Creating maintenance requests...')

  const maintenance1 = await prisma.maintenanceRequest.create({
    data: {
      assetId: laptop2.id,
      raisedByEmployeeId: employee2.id,
      description: 'Screen flickering intermittently',
      priority: 'HIGH',
      status: 'PENDING',
    },
  })

  console.log(`✓ Created ${1} maintenance request`)

  // 8. Create Notifications
  console.log('🔔 Creating notifications...')

  const notification1 = await prisma.notification.create({
    data: {
      recipientId: employee1.id,
      type: 'ASSET_ASSIGNED',
      message: 'Laptop AF-0001 has been assigned to you',
      metadata: {
        assetId: laptop1.id,
        assetTag: laptop1.assetTag,
      },
    },
  })

  const notification2 = await prisma.notification.create({
    data: {
      recipientId: assetManager.id,
      type: 'MAINTENANCE_APPROVED',
      message: 'New maintenance request requires approval',
      metadata: {
        maintenanceId: maintenance1.id,
        assetTag: laptop2.assetTag,
      },
    },
  })

  console.log(`✓ Created ${2} notifications`)

  console.log('✅ Database seeding completed!')
  console.log('\n📊 Summary:')
  console.log('  ✓ 3 Departments')
  console.log('  ✓ 3 Asset Categories')
  console.log('  ✓ 6 Employees')
  console.log('  ✓ 6 Assets')
  console.log('  ✓ 2 Allocations')
  console.log('  ✓ 2 Bookings')
  console.log('  ✓ 1 Maintenance Request')
  console.log('  ✓ 2 Notifications')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })