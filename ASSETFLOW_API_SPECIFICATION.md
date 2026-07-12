# AssetFlow API Specification
## Complete Request/Response Examples for Hackathon Implementation

---

## 📡 API Base URL
```
Development: http://localhost:3000/api/v1
Production: https://assetflow-backend.onrender.com/api/v1
```

## 🔐 Authentication Header
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 🔑 AUTH ENDPOINTS

### 1. Signup (Create Employee Account)
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@org.com",
  "password": "SecurePass123!",
  "deptId": "dept-001"
}

RESPONSE (201):
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "id": "emp-001",
    "name": "John Doe",
    "email": "john@org.com",
    "role": "EMPLOYEE",
    "deptId": "dept-001",
    "status": "ACTIVE"
  }
}

ERROR (400):
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {
    "email": "Email already exists",
    "password": "Password must be at least 8 characters"
  }
}
```

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@org.com",
  "password": "SecurePass123!"
}

RESPONSE (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "emp-001",
      "name": "John Doe",
      "email": "john@org.com",
      "role": "EMPLOYEE",
      "deptId": "dept-001"
    }
  }
}

ERROR (401):
{
  "success": false,
  "message": "Invalid email or password",
  "code": "INVALID_CREDENTIALS",
  "statusCode": 401
}
```

### 3. Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

RESPONSE (200):
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 🏢 ORGANIZATION SETUP (ADMIN ONLY)

### 1. Create Department
```http
POST /departments
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "name": "IT Department",
  "parentDeptId": null,
  "status": "ACTIVE"
}

RESPONSE (201):
{
  "success": true,
  "data": {
    "id": "dept-001",
    "name": "IT Department",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Create Asset Category
```http
POST /categories
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "name": "Electronics",
  "customFields": {
    "warrantyPeriod": "24 months",
    "serviceProvider": "TechCare"
  }
}

RESPONSE (201):
{
  "success": true,
  "data": {
    "id": "cat-001",
    "name": "Electronics",
    "customFields": {
      "warrantyPeriod": "24 months",
      "serviceProvider": "TechCare"
    }
  }
}
```

### 3. List Employees + Promote to Asset Manager
```http
GET /employees?deptId=dept-001&status=ACTIVE
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "emp-001",
        "name": "John Doe",
        "email": "john@org.com",
        "role": "EMPLOYEE",
        "status": "ACTIVE"
      },
      {
        "id": "emp-002",
        "name": "Jane Smith",
        "email": "jane@org.com",
        "role": "ASSET_MANAGER",
        "status": "ACTIVE"
      }
    ],
    "total": 2
  }
}

PUT /employees/emp-001/role
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "role": "ASSET_MANAGER"
}

RESPONSE (200):
{
  "success": true,
  "message": "Employee promoted to Asset Manager",
  "data": {
    "id": "emp-001",
    "role": "ASSET_MANAGER"
  }
}
```

---

## 📦 ASSET ENDPOINTS

### 1. Register Asset
```http
POST /assets
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "categoryId": "cat-001",
  "serialNumber": "SN-12345",
  "status": "AVAILABLE",
  "condition": "GOOD",
  "location": "Office-A, Desk 5",
  "isShareable": false,
  "acquiredDate": "2023-01-15",
  "acquiredCost": 1200.00,
  "photoUrl": "https://..."
}

RESPONSE (201):
{
  "success": true,
  "message": "Asset registered successfully",
  "data": {
    "id": "asset-001",
    "assetTag": "AF-0001",
    "categoryId": "cat-001",
    "serialNumber": "SN-12345",
    "status": "AVAILABLE",
    "condition": "GOOD",
    "location": "Office-A, Desk 5",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. List Assets (with filters)
```http
GET /assets?status=AVAILABLE&categoryId=cat-001&location=Office-A&page=1&limit=20
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "asset-001",
        "assetTag": "AF-0001",
        "serialNumber": "SN-12345",
        "categoryId": "cat-001",
        "status": "AVAILABLE",
        "condition": "GOOD",
        "location": "Office-A, Desk 5",
        "isShareable": false,
        "acquiredCost": 1200.00,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
```

### 3. Get Asset Detail + History
```http
GET /assets/asset-001
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "asset": {
      "id": "asset-001",
      "assetTag": "AF-0001",
      "serialNumber": "SN-12345",
      "status": "ALLOCATED",
      "condition": "GOOD",
      "location": "Office-A, Desk 5",
      "isShareable": false,
      "acquiredDate": "2023-01-15",
      "acquiredCost": 1200.00
    },
    "allocationHistory": [
      {
        "id": "alloc-001",
        "allocatedToEmployee": "John Doe (emp-001)",
        "expectedReturnDate": "2024-02-15",
        "status": "ALLOCATED",
        "allocatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "maintenanceHistory": [
      {
        "id": "maint-001",
        "description": "Screen replacement",
        "status": "RESOLVED",
        "requestedAt": "2024-01-10",
        "resolvedAt": "2024-01-12"
      }
    ]
  }
}
```

### 4. Search Assets by QR Code / Asset Tag
```http
GET /assets/search?query=AF-0001
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "asset": {
      "id": "asset-001",
      "assetTag": "AF-0001",
      "status": "AVAILABLE"
    }
  }
}
```

---

## 🤝 ALLOCATION ENDPOINTS

### 1. Allocate Asset to Employee
```http
POST /allocations
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "assetId": "asset-001",
  "allocatedToEmployeeId": "emp-001",
  "expectedReturnDate": "2024-02-15"
}

RESPONSE (201):
{
  "success": true,
  "message": "Asset allocated successfully",
  "data": {
    "id": "alloc-001",
    "assetId": "asset-001",
    "allocatedToEmployeeId": "emp-001",
    "expectedReturnDate": "2024-02-15",
    "status": "ALLOCATED",
    "allocatedAt": "2024-01-15T10:30:00Z"
  }
}

ERROR (409 - CONFLICT):
{
  "success": false,
  "message": "Asset already allocated",
  "code": "ASSET_ALREADY_ALLOCATED",
  "statusCode": 409,
  "details": {
    "assetId": "asset-001",
    "assetTag": "AF-0001",
    "currentHolder": "John Doe",
    "currentHolderEmail": "john@org.com",
    "suggestion": "Use Transfer Request instead"
  }
}
```

### 2. Request Asset Transfer
```http
POST /allocations/asset-001/transfer
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "assetId": "asset-001",
  "newEmployeeId": "emp-002"
}

RESPONSE (201):
{
  "success": true,
  "message": "Transfer request created",
  "data": {
    "id": "transfer-001",
    "assetId": "asset-001",
    "currentHolder": "emp-001",
    "requestedTransferTo": "emp-002",
    "status": "TRANSFER_REQUESTED",
    "createdAt": "2024-01-15T10:30:00Z",
    "notificationSent": {
      "to": "Asset Manager",
      "message": "Transfer request for AF-0001 from John Doe to Jane Smith"
    }
  }
}
```

### 3. Approve Transfer (Asset Manager)
```http
PUT /allocations/transfer-001/approve
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "approverRole": "ASSET_MANAGER"
}

RESPONSE (200):
{
  "success": true,
  "message": "Transfer approved",
  "data": {
    "assetId": "asset-001",
    "previousHolder": "emp-001",
    "newHolder": "emp-002",
    "status": "ALLOCATED",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### 4. Return Asset
```http
PUT /allocations/alloc-001/return
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "actualReturnDate": "2024-01-20",
  "returnConditionNotes": "Minor scratch on corner, otherwise good"
}

RESPONSE (200):
{
  "success": true,
  "message": "Asset returned successfully",
  "data": {
    "id": "alloc-001",
    "assetId": "asset-001",
    "status": "RETURNED",
    "assetStatusUpdated": "AVAILABLE",
    "returnedAt": "2024-01-20T10:30:00Z"
  }
}
```

### 5. List My Allocations
```http
GET /allocations/my?status=ALLOCATED
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "allocations": [
      {
        "id": "alloc-001",
        "assetTag": "AF-0001",
        "assetName": "HP Laptop",
        "allocatedAt": "2024-01-15",
        "expectedReturnDate": "2024-02-15",
        "daysOverdue": 0,
        "status": "ALLOCATED"
      }
    ],
    "summary": {
      "total": 3,
      "overdue": 1
    }
  }
}
```

---

## 📅 BOOKING ENDPOINTS

### 1. Check Resource Availability
```http
GET /resources/asset-001/availability?startTime=2024-01-20T09:00:00&endTime=2024-01-20T10:00:00
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "resourceId": "asset-001",
    "resourceName": "Conference Room B2",
    "requestedSlot": {
      "startTime": "2024-01-20T09:00:00",
      "endTime": "2024-01-20T10:00:00"
    },
    "isAvailable": true,
    "conflicts": []
  }
}

ERROR (409):
{
  "success": false,
  "message": "Time slot not available",
  "code": "BOOKING_CONFLICT",
  "statusCode": 409,
  "conflicts": [
    {
      "startTime": "2024-01-20T09:30:00",
      "endTime": "2024-01-20T10:30:00",
      "bookedBy": "John Doe",
      "status": "UPCOMING"
    }
  ],
  "suggestedAlternatives": [
    {
      "startTime": "2024-01-20T08:00:00",
      "endTime": "2024-01-20T09:00:00"
    },
    {
      "startTime": "2024-01-20T10:30:00",
      "endTime": "2024-01-20T11:30:00"
    }
  ]
}
```

### 2. Create Booking
```http
POST /bookings
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "resourceId": "asset-001",
  "startTime": "2024-01-20T09:00:00",
  "endTime": "2024-01-20T10:00:00",
  "notes": "Team standup meeting"
}

RESPONSE (201):
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking-001",
    "resourceId": "asset-001",
    "resourceName": "Conference Room B2",
    "bookedByEmployee": "emp-002",
    "startTime": "2024-01-20T09:00:00",
    "endTime": "2024-01-20T10:00:00",
    "status": "UPCOMING",
    "createdAt": "2024-01-15T10:30:00Z",
    "reminderScheduled": true,
    "reminderTime": "2024-01-20T08:45:00Z"
  }
}
```

### 3. List My Bookings
```http
GET /bookings/my?status=UPCOMING&limit=10
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking-001",
        "resourceName": "Conference Room B2",
        "startTime": "2024-01-20T09:00:00",
        "endTime": "2024-01-20T10:00:00",
        "status": "UPCOMING",
        "notes": "Team standup meeting"
      }
    ],
    "total": 5
  }
}
```

### 4. Cancel Booking
```http
DELETE /bookings/booking-001
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "message": "Booking cancelled",
  "data": {
    "id": "booking-001",
    "status": "CANCELLED",
    "cancelledAt": "2024-01-15T11:00:00Z",
    "notificationSent": "Cancellation confirmed to all attendees"
  }
}
```

---

## 🔧 MAINTENANCE ENDPOINTS

### 1. Raise Maintenance Request
```http
POST /maintenance
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "assetId": "asset-001",
  "description": "Screen flickering intermittently",
  "priority": "HIGH",
  "photoUrl": "https://..."
}

RESPONSE (201):
{
  "success": true,
  "message": "Maintenance request created",
  "data": {
    "id": "maint-001",
    "assetId": "asset-001",
    "assetTag": "AF-0001",
    "raisedByEmployee": "emp-001",
    "description": "Screen flickering intermittently",
    "priority": "HIGH",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z",
    "notificationSent": {
      "to": "Asset Manager",
      "message": "New maintenance request for AF-0001"
    }
  }
}
```

### 2. List Maintenance Requests
```http
GET /maintenance?status=PENDING&priority=HIGH
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "maint-001",
        "assetTag": "AF-0001",
        "assetName": "HP Laptop",
        "description": "Screen flickering intermittently",
        "priority": "HIGH",
        "status": "PENDING",
        "requestedAt": "2024-01-15T10:30:00Z",
        "raisedByEmployee": "John Doe"
      }
    ],
    "summary": {
      "total": 12,
      "pending": 8,
      "approved": 2,
      "inProgress": 2
    }
  }
}
```

### 3. Approve Maintenance Request (Asset Manager)
```http
PUT /maintenance/maint-001/approve
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "technician": "Bob's Tech Repair"
}

RESPONSE (200):
{
  "success": true,
  "message": "Maintenance request approved",
  "data": {
    "id": "maint-001",
    "status": "APPROVED",
    "assetStatusUpdated": "UNDER_MAINTENANCE",
    "technician": "Bob's Tech Repair",
    "approvedAt": "2024-01-15T11:00:00Z",
    "notificationSent": {
      "to": "emp-001",
      "message": "Your maintenance request for AF-0001 has been approved"
    }
  }
}
```

### 4. Reject Maintenance Request
```http
PUT /maintenance/maint-001/reject
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "rejectionReason": "Asset is due for retirement"
}

RESPONSE (200):
{
  "success": true,
  "message": "Maintenance request rejected",
  "data": {
    "id": "maint-001",
    "status": "REJECTED",
    "rejectionReason": "Asset is due for retirement",
    "rejectedAt": "2024-01-15T11:00:00Z"
  }
}
```

### 5. Resolve Maintenance Request
```http
PUT /maintenance/maint-001/resolve
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "resolutionNotes": "Screen cable was loose, reseated successfully"
}

RESPONSE (200):
{
  "success": true,
  "message": "Maintenance resolved",
  "data": {
    "id": "maint-001",
    "status": "RESOLVED",
    "assetStatusUpdated": "AVAILABLE",
    "resolutionNotes": "Screen cable was loose, reseated successfully",
    "resolvedAt": "2024-01-15T15:30:00Z"
  }
}
```

---

## 🔍 AUDIT ENDPOINTS

### 1. Create Audit Cycle
```http
POST /audits/cycles
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "scopeDeptId": "dept-001",
  "startDate": "2024-01-20",
  "endDate": "2024-01-27"
}

RESPONSE (201):
{
  "success": true,
  "message": "Audit cycle created",
  "data": {
    "id": "audit-001",
    "scopeDeptId": "dept-001",
    "scopeDeptName": "IT Department",
    "startDate": "2024-01-20",
    "endDate": "2024-01-27",
    "status": "OPEN",
    "totalAssetsToAudit": 45,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Assign Auditors
```http
POST /audits/cycles/audit-001/assign-auditors
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "auditorIds": ["emp-003", "emp-004"]
}

RESPONSE (200):
{
  "success": true,
  "message": "Auditors assigned",
  "data": {
    "auditCycleId": "audit-001",
    "auditors": [
      {
        "id": "emp-003",
        "name": "Alice Johnson",
        "email": "alice@org.com"
      },
      {
        "id": "emp-004",
        "name": "Bob Wilson",
        "email": "bob@org.com"
      }
    ]
  }
}
```

### 3. Mark Asset as Verified/Missing/Damaged
```http
PUT /audits/cycles/audit-001/items
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "items": [
    {
      "assetId": "asset-001",
      "status": "VERIFIED",
      "notes": "Laptop in good condition, screen clean"
    },
    {
      "assetId": "asset-002",
      "status": "MISSING",
      "notes": "Monitor not found in Office-A"
    },
    {
      "assetId": "asset-003",
      "status": "DAMAGED",
      "notes": "Keyboard has broken keys"
    }
  ]
}

RESPONSE (200):
{
  "success": true,
  "message": "Audit items updated",
  "data": {
    "auditCycleId": "audit-001",
    "itemsProcessed": 3,
    "verified": 1,
    "missing": 1,
    "damaged": 1
  }
}
```

### 4. Close Audit Cycle & Generate Report
```http
PUT /audits/cycles/audit-001/close
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "message": "Audit cycle closed",
  "data": {
    "auditCycleId": "audit-001",
    "status": "CLOSED",
    "closedAt": "2024-01-27T17:00:00Z",
    "discrepancyReport": {
      "totalAssetsAudited": 45,
      "verified": 40,
      "missing": 3,
      "damaged": 2,
      "missingAssets": [
        {
          "assetTag": "AF-0010",
          "assetName": "Monitor",
          "lastAllocatedTo": "emp-005",
          "lastLocation": "Office-A",
          "actionTaken": "Status changed to LOST"
        }
      ],
      "damagedAssets": [
        {
          "assetTag": "AF-0015",
          "assetName": "Keyboard",
          "condition": "DAMAGED",
          "actionTaken": "Status changed to DAMAGED"
        }
      ]
    },
    "notificationSent": {
      "to": "ADMIN",
      "message": "Audit cycle complete with 5 discrepancies found"
    }
  }
}
```

### 5. Get Discrepancy Report
```http
GET /audits/cycles/audit-001/report
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "auditCycleId": "audit-001",
    "status": "CLOSED",
    "summary": {
      "totalAudited": 45,
      "verified": 40,
      "missing": 3,
      "damaged": 2
    },
    "discrepancies": [
      {
        "type": "MISSING",
        "assetTag": "AF-0010",
        "assetName": "Monitor",
        "severity": "HIGH",
        "reportedAt": "2024-01-27T16:00:00Z"
      }
    ]
  }
}
```

---

## 📊 DASHBOARD & REPORTS

### 1. Get KPI Cards
```http
GET /dashboard/kpis
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "kpis": {
      "availableAssets": 45,
      "availableTrend": "+5%",
      "allocatedAssets": 38,
      "allocatedTrend": "-2%",
      "maintenanceToday": 3,
      "activeBookings": 12,
      "pendingTransfers": 2,
      "upcomingReturns": 7
    }
  }
}
```

### 2. Get Overdue Alerts
```http
GET /dashboard/overdue
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "overdueReturns": [
      {
        "assetTag": "AF-0001",
        "assetName": "HP Laptop",
        "allocatedTo": "John Doe",
        "expectedReturnDate": "2024-01-10",
        "daysOverdue": 5
      }
    ],
    "overdueBookings": [],
    "totalOverdue": 1
  }
}
```

### 3. Asset Utilization Report
```http
GET /reports/utilization?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "period": "2024-01-01 to 2024-01-31",
    "topUtilizedAssets": [
      {
        "assetTag": "AF-0001",
        "assetName": "HP Laptop",
        "utilizationRate": "92%",
        "allocatedDays": 28,
        "currentHolder": "emp-001"
      }
    ],
    "idleAssets": [
      {
        "assetTag": "AF-0020",
        "assetName": "Old Monitor",
        "utilizationRate": "0%",
        "lastUsed": "2023-11-15"
      }
    ]
  }
}
```

### 4. Maintenance Trends
```http
GET /reports/maintenance?startDate=2024-01-01&groupBy=category
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "trendsByCategory": [
      {
        "category": "Electronics",
        "totalRequests": 12,
        "averageResolutionDays": 2.5,
        "topIssues": ["Screen issues", "Battery problems", "Keyboard malfunction"]
      }
    ],
    "trendsByAsset": [
      {
        "assetTag": "AF-0001",
        "assetName": "HP Laptop",
        "maintenanceCount": 3,
        "lastMaintenanceDate": "2024-01-10"
      }
    ]
  }
}
```

---

## 🔔 NOTIFICATIONS

### 1. List Notifications
```http
GET /notifications?unreadOnly=false&limit=20&page=1
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-001",
        "type": "ASSET_ASSIGNED",
        "message": "Laptop AF-0001 has been assigned to you",
        "metadata": {
          "assetId": "asset-001",
          "assetTag": "AF-0001"
        },
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "notif-002",
        "type": "MAINTENANCE_APPROVED",
        "message": "Your maintenance request for AF-0001 has been approved",
        "isRead": true,
        "createdAt": "2024-01-14T15:20:00Z"
      },
      {
        "id": "notif-003",
        "type": "BOOKING_REMINDER",
        "message": "Reminder: Conference Room B2 booking in 30 minutes",
        "isRead": false,
        "createdAt": "2024-01-15T08:30:00Z"
      },
      {
        "id": "notif-004",
        "type": "OVERDUE_RETURN",
        "message": "Asset AF-0005 return is 3 days overdue",
        "metadata": {
          "assetTag": "AF-0005",
          "daysOverdue": 3
        },
        "isRead": false,
        "createdAt": "2024-01-13T09:00:00Z"
      }
    ],
    "total": 4,
    "unreadCount": 3
  }
}
```

### 2. Mark Notification as Read
```http
PUT /notifications/notif-001/read
Authorization: Bearer <jwt>

RESPONSE (200):
{
  "success": true,
  "data": {
    "id": "notif-001",
    "isRead": true
  }
}
```

---

## 📊 ERROR CODE REFERENCE

| Code | HTTP Status | Meaning | Action |
|------|-------------|---------|--------|
| VALIDATION_ERROR | 400 | Input validation failed | Check error.errors for details |
| INVALID_CREDENTIALS | 401 | Wrong email/password | Retry with correct credentials |
| UNAUTHORIZED | 401 | Missing/invalid JWT | Login again |
| FORBIDDEN | 403 | Insufficient permissions | Contact admin for access |
| ASSET_NOT_FOUND | 404 | Asset doesn't exist | Check assetId |
| ASSET_ALREADY_ALLOCATED | 409 | Cannot allocate (already held) | Use Transfer Request |
| BOOKING_CONFLICT | 409 | Time slot overlaps | Check availability |
| EMPLOYEE_ALREADY_EXISTS | 409 | Email already registered | Use different email |
| INTERNAL_ERROR | 500 | Server error | Retry or contact support |

---

## 🎯 TESTING CHECKLIST

### User Flows to Test in Postman

1. **Complete Signup → Login → Allocation Flow**
   - [ ] POST /auth/signup
   - [ ] POST /auth/login
   - [ ] GET /assets
   - [ ] POST /allocations (succeeds)
   - [ ] POST /allocations (same asset, fails with 409)

2. **Booking Overlap Prevention**
   - [ ] GET /resources/id/availability (returns available)
   - [ ] POST /bookings (overlapping, fails with 409)
   - [ ] POST /bookings (non-overlapping, succeeds)

3. **Maintenance Workflow**
   - [ ] POST /maintenance (creates PENDING)
   - [ ] PUT /maintenance/id/approve (becomes APPROVED, asset → UNDER_MAINTENANCE)
   - [ ] PUT /maintenance/id/resolve (becomes RESOLVED, asset → AVAILABLE)

4. **Audit Cycle**
   - [ ] POST /audits/cycles (creates OPEN cycle)
   - [ ] PUT /audits/cycles/id/items (mark items)
   - [ ] PUT /audits/cycles/id/close (generates report)

5. **Role-Based Access**
   - [ ] Employee cannot access /departments (403)
   - [ ] Asset Manager can POST /allocations (200)
   - [ ] Admin can POST /audits/cycles (200)

---

## 📈 Performance Tips

1. **Pagination:** Always paginate list endpoints (`?page=1&limit=20`)
2. **Filtering:** Use filters to reduce data transfer
3. **Indexes:** Queries on status, createdAt, employeeId are indexed
4. **Transactions:** Critical operations (allocate, book) use DB transactions
5. **Caching:** Dashboard KPIs can be cached (5-minute TTL)

---

*Last Updated: Hackathon 2024*
*For comprehensive API testing, import this file into Postman*
