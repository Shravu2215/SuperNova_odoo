# Backend Implementation Plan: Schema Reconciliation

I have reviewed the backend PRD (`prd.txt`) and compared it against the finalized Prisma schema shared by your DB teammate (`server/prisma/schema.prisma`). 
I've also run `npx prisma generate` in the server directory as requested.

Here is the breakdown of what exists, the schema differences, and the proposed build order.

## 1. What's Scaffolded vs. What's Missing

**What already exists in the repo (`server` folder):**
- **Core Server Setup:** `app.ts`, `server.ts`, environment config (`env.ts`), Prisma client (`prisma.ts`), and Socket.IO init (`socket.ts`).
- **Middlewares:** `auth.middleware.ts`, `rbac.middleware.ts`, `validate.middleware.ts`, `rateLimit.middleware.ts`, and `error.middleware.ts`.
- **Utils:** `apiResponse.ts`, `asyncHandler.ts`, `logger.ts`.
- **Sockets:** `events.ts`.
- **Scaffolded Module:** The `auth` module skeleton exists (controller, routes, schema, service, types).

**What is missing (to be built):**
- **Modules:** `departments`, `categories`, `employees`, `assets`, `allocation`, `bookings`, `maintenance`, `audits`, `reports`, `notifications`, `activityLogs`.
- **Utils:** `assetTag.ts` (for atomic ID generation) and `activityLogger.ts`.

## 2. Model & Field Differences (PRD vs. Actual Schema)

> [!WARNING] 
> The DB teammate's schema has significantly diverged from the PRD assumptions in several key areas.

*   **User is now Employee:**
    *   Renamed from `User` to `Employee`.
    *   `passwordHash` is `password`, `departmentId` is `deptId`.
    *   `isActive` boolean replaced by a `status` Enum (`UserStatus`).
*   **Asset simplified and modified:**
    *   Dropped: `name`, `currentHolderId` (moved to `AssetAllocation`), `customFields`, and `isDeleted` (soft deletes might need to be handled via `status = DISPOSED/RETIRED`).
    *   Renamed: `purchaseDate` -> `acquiredDate`, `purchaseCost` -> `acquiredCost`.
    *   Added: `location`, `isShareable`, `photoUrl`.
*   **MeetingRoom removed entirely:**
    *   The `MeetingRoom` model doesn't exist. Instead, `ResourceBooking` books directly against an `Asset` (where `isShareable = true`).
    *   Fields updated: `roomId` -> `resourceId`, `bookedById` -> `bookedByEmployeeId`.
*   **AllocationRequest is now AssetAllocation:**
    *   Dropped: `type` (ALLOCATION/TRANSFER/RETURN), `requesterId`, `reason`, `approverId`.
    *   Added: `allocatedToEmployeeId`, `allocatedToDeptId`, `expectedReturnDate`, `actualReturnDate`, `returnConditionNotes`.
*   **AssetHistory removed:**
    *   There is no `AssetHistory` table. We will need to use `ActivityLog` or the new `AuditLog` model to track asset history timelines.
*   **Maintenance & Audits restructured:**
    *   `MaintenanceTicket` is now `MaintenanceRequest` (added `priority`, `photoUrl`, `technician`).
    *   `AuditRecord` is now `AuditCycle` with an associated `AuditAssignment` join table.

## 3. Enum Mismatches

The exact enum values in the current `schema.prisma` are:

*   **Roles (`UserRole` instead of `Role`):** `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD`, `EMPLOYEE`.
*   **Status Booleans Replaced by Enums:** `UserStatus` (`ACTIVE`, `INACTIVE`, `DEACTIVATED`) and `DepartmentStatus` (`ACTIVE`, `INACTIVE`).
*   **Asset Status (`AssetStatus`):** `AVAILABLE`, `ALLOCATED`, `RESERVED`, `UNDER_MAINTENANCE`, `LOST`, `RETIRED`, `DISPOSED`.
*   **Asset Condition (`AssetCondition`):** `EXCELLENT`, `GOOD`, `FAIR`, `POOR`, `DAMAGED`.
*   **Allocations (`AllocationStatus` instead of `RequestStatus`/`RequestType`):** `PENDING_APPROVAL`, `ALLOCATED`, `RETURNED`, `TRANSFER_REQUESTED`.
*   **Maintenance (`MaintenanceStatus`):** `PENDING`, `APPROVED`, `REJECTED`, `IN_PROGRESS`, `RESOLVED`.
*   **Bookings (`BookingStatus`):** `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`.
*   **Audits:** `AuditStatus` (`OPEN`, `CLOSED`), `AuditItemStatus` (`VERIFIED`, `MISSING`, `DAMAGED`).
*   **Notifications (`NotificationType`):** Fully populated with `ASSET_ASSIGNED`, `MAINTENANCE_APPROVED`, etc.

## 4. Changes Needed for Already Built Code

The scaffolded **Auth Module** and related middlewares currently assume the PRD's schema. They need to be updated:
1.  Change all references from `User` to `Employee`.
2.  Update the Auth middleware to query `Employee` and check `UserStatus.ACTIVE` instead of `isActive`.
3.  Update the RBAC middleware to use the `UserRole` enum.
4.  Update Auth validation schemas to use `deptId` instead of `departmentId`.

## 5. Proposed Build Order (Adjusted for Scaffold & Schema)

1.  **Phase 1: Refactor Auth & Scaffolding:** Update `auth` module, `rbac` and `auth` middlewares to use `Employee` and `UserRole`. Ensure Postman tests pass for Auth.
2.  **Phase 2: Org Foundation:** Build `departments`, `categories`, and `employees` modules (CRUD and role promotion).
3.  **Phase 3: Assets & Allocations (Core):** Build `assets` module (registration, tag generation). Build `allocation` module adapted to the new `AssetAllocation` model, tracking history via `ActivityLog` instead of `AssetHistory`.
4.  **Phase 4: Resource Bookings:** Build `bookings` module logic against shareable `Asset`s (instead of meeting rooms), including overlap detection.
5.  **Phase 5: Maintenance & Audits:** Build `maintenance` (tickets, approvals) and `audits` (cycles, assignments, item verification).
6.  **Phase 6: Observability & Real-time:** Build `notifications`, `activityLogs`, `reports` (aggregations), `dashboard` (summary), and finalize Socket.IO events.
7.  **Phase 7: Wrap-up:** Finalize Postman collection, write database seed script, and deploy.

## Open Questions

> [!IMPORTANT]
> Please review and clarify these points based on the new DB schema before I start coding:

1. **Asset History:** Since `AssetHistory` was removed by the DB teammate, I plan to use `ActivityLog` to serve timeline queries (like `GET /assets/:id/history`). Is this acceptable?
2. **Asset Name:** `Asset` no longer has a `name` field. Should the frontend display the `AssetCategory.name` + `assetTag`, or did the DB teammate forget to include the asset name?
3. **Allocation Types:** `AssetAllocation` lacks a `type` field (ALLOCATION vs TRANSFER) and a `requesterId`. I can infer the workflow purely based on the `status` enum (e.g., `TRANSFER_REQUESTED`) and by tracking the logged-in user in the controller. Does this align with your expectations?
