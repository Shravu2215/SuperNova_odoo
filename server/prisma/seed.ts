import { PrismaClient, UserRole, UserStatus, AssetStatus, AssetCondition } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // Departments
  const deptIT = await prisma.department.create({
    data: { name: "Information Technology" }
  });
  const deptHR = await prisma.department.create({
    data: { name: "Human Resources" }
  });

  // Employees
  const admin = await prisma.employee.upsert({
    where: { email: "admin@assetflow.com" },
    update: {},
    create: {
      email: "admin@assetflow.com",
      name: "System Admin",
      password: passwordHash,
      role: UserRole.ADMIN,
      deptId: deptIT.id,
      status: UserStatus.ACTIVE
    }
  });

  const manager = await prisma.employee.upsert({
    where: { email: "manager@assetflow.com" },
    update: {},
    create: {
      email: "manager@assetflow.com",
      name: "Asset Manager",
      password: passwordHash,
      role: UserRole.ASSET_MANAGER,
      deptId: deptIT.id,
      status: UserStatus.ACTIVE
    }
  });

  const deptHead = await prisma.employee.upsert({
    where: { email: "head@assetflow.com" },
    update: {},
    create: {
      email: "head@assetflow.com",
      name: "IT Head",
      password: passwordHash,
      role: UserRole.DEPARTMENT_HEAD,
      deptId: deptIT.id,
      status: UserStatus.ACTIVE
    }
  });

  const emp1 = await prisma.employee.upsert({
    where: { email: "employee1@assetflow.com" },
    update: {},
    create: {
      email: "employee1@assetflow.com",
      name: "John Doe",
      password: passwordHash,
      role: UserRole.EMPLOYEE,
      deptId: deptIT.id,
      status: UserStatus.ACTIVE
    }
  });

  // Categories
  const catLaptop = await prisma.assetCategory.create({
    data: {
      name: "Laptops",
      customFields: [{ key: "ram", label: "RAM", type: "string" }, { key: "cpu", label: "CPU", type: "string" }]
    }
  });

  const catProjector = await prisma.assetCategory.create({
    data: {
      name: "Projectors"
    }
  });

  // Assets
  await prisma.asset.create({
    data: {
      assetTag: "AF-0001",
      serialNumber: "SN12345",
      categoryId: catLaptop.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.EXCELLENT,
      isShareable: false
    }
  });

  await prisma.asset.create({
    data: {
      assetTag: "AF-0002",
      serialNumber: "SN98765",
      categoryId: catProjector.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isShareable: true
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
