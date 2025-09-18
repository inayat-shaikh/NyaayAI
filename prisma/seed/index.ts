import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@legalplatform.com' },
    update: {},
    create: {
      email: 'admin@legalplatform.com',
      username: 'admin',
      password: adminPassword,
      name: 'System Administrator',
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
    },
  })

  // Create admin profile
  await prisma.userProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      designation: 'System Administrator',
    },
  })

  // Create citizen user
  const citizenPassword = await bcrypt.hash('Citizen@123', 12)
  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@legalplatform.com' },
    update: {},
    create: {
      email: 'citizen@legalplatform.com',
      username: 'citizen',
      password: citizenPassword,
      name: 'John Citizen',
      role: UserRole.CITIZEN,
      isVerified: true,
      isActive: true,
    },
  })

  // Create citizen profile
  await prisma.userProfile.upsert({
    where: { userId: citizen.id },
    update: {},
    create: {
      userId: citizen.id,
      address: '123 Main Street, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    },
  })

  // Create police user
  const policePassword = await bcrypt.hash('Police@123', 12)
  const police = await prisma.user.upsert({
    where: { email: 'police@legalplatform.com' },
    update: {},
    create: {
      email: 'police@legalplatform.com',
      username: 'police',
      password: policePassword,
      name: 'Rajesh Kumar',
      role: UserRole.POLICE,
      isVerified: true,
      isActive: true,
    },
  })

  // Create police profile
  await prisma.userProfile.upsert({
    where: { userId: police.id },
    update: {},
    create: {
      userId: police.id,
      badgeNumber: 'POL001',
      rank: 'Inspector',
      address: 'Police Station, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002',
    },
  })

  // Create judge user
  const judgePassword = await bcrypt.hash('Judge@123', 12)
  const judge = await prisma.user.upsert({
    where: { email: 'judge@legalplatform.com' },
    update: {},
    create: {
      email: 'judge@legalplatform.com',
      username: 'judge',
      password: judgePassword,
      name: 'Justice Sharma',
      role: UserRole.JUDGE,
      isVerified: true,
      isActive: true,
    },
  })

  // Create judge profile
  await prisma.userProfile.upsert({
    where: { userId: judge.id },
    update: {},
    create: {
      userId: judge.id,
      designation: 'District Judge',
      courtId: 'temp-court-id', // Will be updated after court creation
    },
  })

  // Create court staff user
  const courtStaffPassword = await bcrypt.hash('Staff@123', 12)
  const courtStaff = await prisma.user.upsert({
    where: { email: 'staff@legalplatform.com' },
    update: {},
    create: {
      email: 'staff@legalplatform.com',
      username: 'staff',
      password: courtStaffPassword,
      name: 'Priya Singh',
      role: UserRole.COURT_STAFF,
      isVerified: true,
      isActive: true,
    },
  })

  // Create court staff profile
  await prisma.userProfile.upsert({
    where: { userId: courtStaff.id },
    update: {},
    create: {
      userId: courtStaff.id,
      designation: 'Court Clerk',
      courtId: 'temp-court-id', // Will be updated after court creation
    },
  })

  // Create lawyer user
  const lawyerPassword = await bcrypt.hash('Lawyer@123', 12)
  const lawyer = await prisma.user.upsert({
    where: { email: 'lawyer@legalplatform.com' },
    update: {},
    create: {
      email: 'lawyer@legalplatform.com',
      username: 'lawyer',
      password: lawyerPassword,
      name: 'Advocate Mehta',
      role: UserRole.LAWYER,
      isVerified: true,
      isActive: true,
    },
  })

  // Create lawyer profile
  await prisma.userProfile.upsert({
    where: { userId: lawyer.id },
    update: {},
    create: {
      userId: lawyer.id,
      barCouncilId: 'BAR001',
      specialization: 'Criminal Law',
      address: 'Chamber No. 5, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400003',
    },
  })

  // Create real-world courts for the system to function
  const supremeCourt = await prisma.court.create({
    data: {
      name: 'Supreme Court of India',
      type: 'SUPREME_COURT',
      jurisdiction: 'NATIONAL',
      address: 'Supreme Court Building, Tilak Marg, New Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91-11-23116520',
      email: 'sci@nic.in',
    },
  })

  const delhiHighCourt = await prisma.court.create({
    data: {
      name: 'Delhi High Court',
      type: 'HIGH_COURT',
      jurisdiction: 'STATE',
      address: 'Sher Shah Road, New Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110503',
      phone: '+91-11-23382336',
      email: 'delhi.hc@nic.in',
    },
  })

  // Create a few more major high courts for real-world functionality
  const mumbaiHighCourt = await prisma.court.create({
    data: {
      name: 'Bombay High Court',
      type: 'HIGH_COURT',
      jurisdiction: 'STATE',
      address: 'High Court Building, Fort, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400032',
      phone: '+91-22-22616611',
      email: 'bombay.hc@nic.in',
    },
  })

  const kolkataHighCourt = await prisma.court.create({
    data: {
      name: 'Calcutta High Court',
      type: 'HIGH_COURT',
      jurisdiction: 'STATE',
      address: 'High Court Building, Esplanade Row West, Kolkata',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700001',
      phone: '+91-33-22483501',
      email: 'calcutta.hc@nic.in',
    },
  })

  const chennaiHighCourt = await prisma.court.create({
    data: {
      name: 'Madras High Court',
      type: 'HIGH_COURT',
      jurisdiction: 'STATE',
      address: 'High Court Building, Chennai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600104',
      phone: '+91-44-25334000',
      email: 'madras.hc@nic.in',
    },
  })

  // Update judge and court staff with proper court ID
  await prisma.user.update({
    where: { id: judge.id },
    data: { courtId: delhiHighCourt.id },
  })

  await prisma.user.update({
    where: { id: courtStaff.id },
    data: { courtId: delhiHighCourt.id },
  })

  await prisma.userProfile.update({
    where: { userId: judge.id },
    data: { courtId: delhiHighCourt.id },
  })

  await prisma.userProfile.update({
    where: { userId: courtStaff.id },
    data: { courtId: delhiHighCourt.id },
  })

  console.log('Database seeded successfully!')
  console.log('User credentials:')
  console.log('Admin: admin@legalplatform.com / Admin@123')
  console.log('Citizen: citizen@legalplatform.com / Citizen@123')
  console.log('Police: police@legalplatform.com / Police@123')
  console.log('Judge: judge@legalplatform.com / Judge@123')
  console.log('Court Staff: staff@legalplatform.com / Staff@123')
  console.log('Lawyer: lawyer@legalplatform.com / Lawyer@123')
  console.log('Real-world courts have been added for system functionality')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })