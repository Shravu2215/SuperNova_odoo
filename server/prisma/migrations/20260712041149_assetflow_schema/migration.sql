/*
  Warnings:

  - You are about to drop the `ExampleTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "DepartmentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "AllocationStatus" AS ENUM ('PENDING_APPROVAL', 'ALLOCATED', 'RETURNED', 'TRANSFER_REQUESTED');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "AuditItemStatus" AS ENUM ('VERIFIED', 'MISSING', 'DAMAGED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ASSET_ASSIGNED', 'MAINTENANCE_APPROVED', 'MAINTENANCE_REJECTED', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'BOOKING_REMINDER', 'TRANSFER_APPROVED', 'TRANSFER_REJECTED', 'OVERDUE_RETURN', 'AUDIT_DISCREPANCY');

-- DropForeignKey
ALTER TABLE "ExampleTask" DROP CONSTRAINT "ExampleTask_userId_fkey";

-- DropTable
DROP TABLE "ExampleTask";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "TaskStatus";

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentDeptId" TEXT,
    "status" "DepartmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "deptId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "assetTag" TEXT NOT NULL,
    "serialNumber" TEXT,
    "categoryId" TEXT NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
    "location" TEXT,
    "isShareable" BOOLEAN NOT NULL DEFAULT false,
    "acquiredDate" TIMESTAMP(3),
    "acquiredCost" DOUBLE PRECISION,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAllocation" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "allocatedToEmployeeId" TEXT,
    "allocatedToDeptId" TEXT,
    "expectedReturnDate" TIMESTAMP(3),
    "actualReturnDate" TIMESTAMP(3),
    "status" "AllocationStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "returnConditionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "raisedByEmployeeId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "photoUrl" TEXT,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "technician" TEXT,
    "completedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceBooking" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "bookedByEmployeeId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'UPCOMING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSchedule" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "nextMaintenanceDate" TIMESTAMP(3) NOT NULL,
    "frequency" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditCycle" (
    "id" TEXT NOT NULL,
    "scopeDeptId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditAssignment" (
    "id" TEXT NOT NULL,
    "auditCycleId" TEXT NOT NULL,
    "auditorId" TEXT NOT NULL,
    "assignedDeptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditItem" (
    "id" TEXT NOT NULL,
    "auditCycleId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "status" "AuditItemStatus" NOT NULL DEFAULT 'VERIFIED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "table" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "userId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Department_status_idx" ON "Department"("status");

-- CreateIndex
CREATE INDEX "Department_parentDeptId_idx" ON "Department"("parentDeptId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_email_idx" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_deptId_idx" ON "Employee"("deptId");

-- CreateIndex
CREATE INDEX "Employee_role_idx" ON "Employee"("role");

-- CreateIndex
CREATE INDEX "Employee_status_idx" ON "Employee"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCategory_name_key" ON "AssetCategory"("name");

-- CreateIndex
CREATE INDEX "AssetCategory_name_idx" ON "AssetCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");

-- CreateIndex
CREATE INDEX "Asset_assetTag_idx" ON "Asset"("assetTag");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "Asset_categoryId_idx" ON "Asset"("categoryId");

-- CreateIndex
CREATE INDEX "Asset_isShareable_idx" ON "Asset"("isShareable");

-- CreateIndex
CREATE INDEX "AssetAllocation_allocatedToEmployeeId_idx" ON "AssetAllocation"("allocatedToEmployeeId");

-- CreateIndex
CREATE INDEX "AssetAllocation_allocatedToDeptId_idx" ON "AssetAllocation"("allocatedToDeptId");

-- CreateIndex
CREATE INDEX "AssetAllocation_status_idx" ON "AssetAllocation"("status");

-- CreateIndex
CREATE INDEX "AssetAllocation_expectedReturnDate_idx" ON "AssetAllocation"("expectedReturnDate");

-- CreateIndex
CREATE UNIQUE INDEX "AssetAllocation_assetId_status_key" ON "AssetAllocation"("assetId", "status");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_assetId_idx" ON "MaintenanceRequest"("assetId");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_status_idx" ON "MaintenanceRequest"("status");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_priority_idx" ON "MaintenanceRequest"("priority");

-- CreateIndex
CREATE INDEX "ResourceBooking_resourceId_idx" ON "ResourceBooking"("resourceId");

-- CreateIndex
CREATE INDEX "ResourceBooking_bookedByEmployeeId_idx" ON "ResourceBooking"("bookedByEmployeeId");

-- CreateIndex
CREATE INDEX "ResourceBooking_startTime_endTime_idx" ON "ResourceBooking"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "ResourceBooking_status_idx" ON "ResourceBooking"("status");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_assetId_idx" ON "MaintenanceSchedule"("assetId");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_nextMaintenanceDate_idx" ON "MaintenanceSchedule"("nextMaintenanceDate");

-- CreateIndex
CREATE INDEX "AuditCycle_status_idx" ON "AuditCycle"("status");

-- CreateIndex
CREATE INDEX "AuditCycle_startDate_idx" ON "AuditCycle"("startDate");

-- CreateIndex
CREATE INDEX "AuditAssignment_auditorId_idx" ON "AuditAssignment"("auditorId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditAssignment_auditCycleId_auditorId_key" ON "AuditAssignment"("auditCycleId", "auditorId");

-- CreateIndex
CREATE INDEX "AuditItem_auditCycleId_idx" ON "AuditItem"("auditCycleId");

-- CreateIndex
CREATE INDEX "AuditItem_status_idx" ON "AuditItem"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AuditItem_auditCycleId_assetId_key" ON "AuditItem"("auditCycleId", "assetId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_employeeId_idx" ON "ActivityLog"("employeeId");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_idx" ON "ActivityLog"("entityType");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_table_idx" ON "AuditLog"("table");

-- CreateIndex
CREATE INDEX "AuditLog_recordId_idx" ON "AuditLog"("recordId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_parentDeptId_fkey" FOREIGN KEY ("parentDeptId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssetCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAllocation" ADD CONSTRAINT "AssetAllocation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAllocation" ADD CONSTRAINT "AssetAllocation_allocatedToEmployeeId_fkey" FOREIGN KEY ("allocatedToEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAllocation" ADD CONSTRAINT "AssetAllocation_allocatedToDeptId_fkey" FOREIGN KEY ("allocatedToDeptId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_raisedByEmployeeId_fkey" FOREIGN KEY ("raisedByEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceBooking" ADD CONSTRAINT "ResourceBooking_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceBooking" ADD CONSTRAINT "ResourceBooking_bookedByEmployeeId_fkey" FOREIGN KEY ("bookedByEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSchedule" ADD CONSTRAINT "MaintenanceSchedule_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAssignment" ADD CONSTRAINT "AuditAssignment_auditCycleId_fkey" FOREIGN KEY ("auditCycleId") REFERENCES "AuditCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAssignment" ADD CONSTRAINT "AuditAssignment_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAssignment" ADD CONSTRAINT "AuditAssignment_assignedDeptId_fkey" FOREIGN KEY ("assignedDeptId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditItem" ADD CONSTRAINT "AuditItem_auditCycleId_fkey" FOREIGN KEY ("auditCycleId") REFERENCES "AuditCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditItem" ADD CONSTRAINT "AuditItem_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
