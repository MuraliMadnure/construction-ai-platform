# Prisma Schema Continuation

Add these models to complete the schema.prisma file after line 623:

```prisma
// ============================================
// MATERIAL & PURCHASE MANAGEMENT
// ============================================

model Material {
  id            String         @id @default(uuid())
  name          String
  description   String?
  category      String
  unit          String
  currentStock  Decimal        @default(0) @map("current_stock") @db.Decimal(12, 2)
  minStockLevel Decimal        @default(0) @map("min_stock_level") @db.Decimal(12, 2)
  maxStockLevel Decimal?       @map("max_stock_level") @db.Decimal(12, 2)
  unitCost      Decimal?       @map("unit_cost") @db.Decimal(12, 2)
  status        MaterialStatus @default(ACTIVE)
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  // Relations
  inventory          Inventory[]
  purchaseOrderItems PurchaseOrderItem[]

  @@map("materials")
  @@index([category])
  @@index([status])
}

enum MaterialStatus {
  ACTIVE
  INACTIVE
}

model Inventory {
  id            String   @id @default(uuid())
  projectId     String   @map("project_id")
  materialId    String   @map("material_id")
  quantity      Decimal  @default(0) @db.Decimal(12, 2)
  location      String?
  lastUpdatedAt DateTime @default(now()) @map("last_updated_at")

  // Relations
  project  Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  material Material @relation(fields: [materialId], references: [id], onDelete: Cascade)

  @@unique([projectId, materialId])
  @@map("inventory")
  @@index([projectId])
  @@index([materialId])
}

model StockMovement {
  id            String   @id @default(uuid())
  projectId     String   @map("project_id")
  materialId    String   @map("material_id")
  movementType  String   @map("movement_type")
  quantity      Decimal  @db.Decimal(12, 2)
  referenceType String?  @map("reference_type")
  referenceId   String?  @map("reference_id")
  notes         String?
  movedBy       String   @map("moved_by")
  movedAt       DateTime @default(now()) @map("moved_at")

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  mover   User    @relation(fields: [movedBy], references: [id])

  @@map("stock_movements")
  @@index([projectId])
  @@index([movedAt])
}

model Vendor {
  id            String       @id @default(uuid())
  name          String
  contactPerson String?      @map("contact_person")
  phone         String?
  email         String?
  address       String?
  gstin         String?
  rating        Decimal?     @db.Decimal(3, 2)
  status        VendorStatus @default(ACTIVE)
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  // Relations
  purchaseOrders PurchaseOrder[]

  @@map("vendors")
  @@index([status])
  @@index([name])
}

enum VendorStatus {
  ACTIVE
  INACTIVE
  BLACKLISTED
}

model PurchaseRequest {
  id              String                @id @default(uuid())
  projectId       String                @map("project_id")
  requestNumber   String                @unique @map("request_number")
  description     String?
  priority        PurchaseRequestPriority @default(MEDIUM)
  status          PurchaseRequestStatus @default(PENDING)
  requiredBy      DateTime              @map("required_by") @db.Date
  requestedBy     String                @map("requested_by")
  approvedBy      String?               @map("approved_by")
  approvedAt      DateTime?             @map("approved_at")
  rejectionReason String?               @map("rejection_reason")
  createdAt       DateTime              @default(now()) @map("created_at")
  updatedAt       DateTime              @updatedAt @map("updated_at")

  // Relations
  project     Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  requester   User             @relation("PRRequester", fields: [requestedBy], references: [id])
  approver    User?            @relation("PRApprover", fields: [approvedBy], references: [id])
  purchaseOrders PurchaseOrder[]

  @@map("purchase_requests")
  @@index([projectId])
  @@index([status])
  @@index([requestNumber])
}

enum PurchaseRequestPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum PurchaseRequestStatus {
  PENDING
  APPROVED
  REJECTED
  ORDERED
}

model PurchaseOrder {
  id                   String              @id @default(uuid())
  purchaseRequestId    String?             @map("purchase_request_id")
  projectId            String              @map("project_id")
  vendorId             String              @map("vendor_id")
  orderNumber          String              @unique @map("order_number")
  orderDate            DateTime            @map("order_date") @db.Date
  expectedDeliveryDate DateTime?           @map("expected_delivery_date") @db.Date
  actualDeliveryDate   DateTime?           @map("actual_delivery_date") @db.Date
  totalAmount          Decimal             @map("total_amount") @db.Decimal(15, 2)
  taxAmount            Decimal             @default(0) @map("tax_amount") @db.Decimal(15, 2)
  status               PurchaseOrderStatus @default(PENDING)
  paymentTerms         String?             @map("payment_terms")
  notes                String?
  createdBy            String              @map("created_by")
  createdAt            DateTime            @default(now()) @map("created_at")
  updatedAt            DateTime            @updatedAt @map("updated_at")

  // Relations
  purchaseRequest PurchaseRequest?    @relation(fields: [purchaseRequestId], references: [id], onDelete: SetNull)
  project         Project             @relation(fields: [projectId], references: [id], onDelete: Cascade)
  vendor          Vendor              @relation(fields: [vendorId], references: [id])
  creator         User                @relation(fields: [createdBy], references: [id])
  items           PurchaseOrderItem[]

  @@map("purchase_orders")
  @@index([projectId])
  @@index([vendorId])
  @@index([status])
  @@index([orderNumber])
}

enum PurchaseOrderStatus {
  PENDING
  CONFIRMED
  PARTIAL_DELIVERY
  DELIVERED
  CANCELLED
}

model PurchaseOrderItem {
  id               String   @id @default(uuid())
  purchaseOrderId  String   @map("purchase_order_id")
  materialId       String   @map("material_id")
  description      String?
  quantity         Decimal  @db.Decimal(12, 2)
  unitPrice        Decimal  @map("unit_price") @db.Decimal(12, 2)
  receivedQuantity Decimal  @default(0) @map("received_quantity") @db.Decimal(12, 2)
  createdAt        DateTime @default(now()) @map("created_at")

  // Relations
  purchaseOrder PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)
  material      Material      @relation(fields: [materialId], references: [id])

  @@map("purchase_order_items")
  @@index([purchaseOrderId])
  @@index([materialId])
}

// ============================================
// SITE EXECUTION
// ============================================

model DailyReport {
  id                String   @id @default(uuid())
  projectId         String   @map("project_id")
  reportDate        DateTime @map("report_date") @db.Date
  weather           String?
  temperature       String?
  workersPresent    Int      @default(0) @map("workers_present")
  workersAbsent     Int      @default(0) @map("workers_absent")
  workSummary       String   @map("work_summary")
  challengesFaced   String?  @map("challenges_faced")
  materialsConsumed String?  @map("materials_consumed")
  equipmentUsed     String?  @map("equipment_used")
  safetyIncidents   String?  @map("safety_incidents")
  visitors          String?
  submittedBy       String   @map("submitted_by")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // Relations
  project Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
  submitter User         @relation(fields: [submittedBy], references: [id])
  images  ReportImage[]

  @@unique([projectId, reportDate])
  @@map("daily_reports")
  @@index([projectId])
  @@index([reportDate])
  @@index([submittedBy])
}

model ReportImage {
  id             String   @id @default(uuid())
  dailyReportId  String   @map("daily_report_id")
  imageUrl       String   @map("image_url")
  caption        String?
  uploadedAt     DateTime @default(now()) @map("uploaded_at")

  // Relations
  dailyReport DailyReport @relation(fields: [dailyReportId], references: [id], onDelete: Cascade)

  @@map("report_images")
  @@index([dailyReportId])
}

model SafetyChecklist {
  id                    String   @id @default(uuid())
  projectId             String   @map("project_id")
  checklistDate         DateTime @map("checklist_date") @db.Date
  ppeAvailable          Boolean  @default(false) @map("ppe_available")
  fireExtinguisherCheck Boolean  @default(false) @map("fire_extinguisher_check")
  firstAidKitCheck      Boolean  @default(false) @map("first_aid_kit_check")
  scaffoldingSafe       Boolean  @default(false) @map("scaffolding_safe")
  electricalSafetyCheck Boolean  @default(false) @map("electrical_safety_check")
  housekeepingStatus    String?  @map("housekeeping_status")
  incidentsReported     Int      @default(0) @map("incidents_reported")
  notes                 String?
  checkedBy             String   @map("checked_by")
  createdAt             DateTime @default(now()) @map("created_at")

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  checker User    @relation(fields: [checkedBy], references: [id])

  @@map("safety_checklists")
  @@index([projectId])
  @@index([checklistDate])
}

model SiteIssue {
  id              String           @id @default(uuid())
  projectId       String           @map("project_id")
  taskId          String?          @map("task_id")
  issueType       String           @map("issue_type")
  severity        IssueSeverity    @default(MEDIUM)
  title           String
  description     String
  status          SiteIssueStatus  @default(OPEN)
  reportedBy      String           @map("reported_by")
  assignedTo      String?          @map("assigned_to")
  resolvedBy      String?          @map("resolved_by")
  resolvedAt      DateTime?        @map("resolved_at")
  resolutionNotes String?          @map("resolution_notes")
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  // Relations
  project  Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  task     Task?   @relation(fields: [taskId], references: [id], onDelete: SetNull)
  reporter User    @relation("IssueReporter", fields: [reportedBy], references: [id])
  assignee User?   @relation("IssueAssignee", fields: [assignedTo], references: [id])
  resolver User?   @relation("IssueResolver", fields: [resolvedBy], references: [id])

  @@map("site_issues")
  @@index([projectId])
  @@index([status])
  @@index([severity])
  @@index([issueType])
}

enum IssueSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum SiteIssueStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

// ============================================
// AI & ANALYTICS
// ============================================

model AIInsight {
  id              String    @id @default(uuid())
  projectId       String    @map("project_id")
  insightType     String    @map("insight_type")
  title           String
  description     String
  severity        String?
  confidenceScore Decimal?  @map("confidence_score") @db.Decimal(5, 2)
  data            Json?
  actionTaken     Boolean   @default(false) @map("action_taken")
  createdAt       DateTime  @default(now()) @map("created_at")
  expiresAt       DateTime? @map("expires_at")

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("ai_insights")
  @@index([projectId])
  @@index([insightType])
  @@index([severity])
  @@index([createdAt])
}

model AIPrediction {
  id             String    @id @default(uuid())
  projectId      String    @map("project_id")
  taskId         String?   @map("task_id")
  predictionType String    @map("prediction_type")
  predictedValue Json      @map("predicted_value")
  actualValue    Json?     @map("actual_value")
  accuracy       Decimal?  @db.Decimal(5, 2)
  modelVersion   String?   @map("model_version")
  createdAt      DateTime  @default(now()) @map("created_at")
  verifiedAt     DateTime? @map("verified_at")

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  task    Task?   @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@map("ai_predictions")
  @@index([projectId])
  @@index([taskId])
  @@index([predictionType])
}

// ============================================
// SYSTEM TABLES
// ============================================

model Notification {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  type      String
  title     String
  message   String
  priority  String    @default("normal")
  read      Boolean   @default(false)
  readAt    DateTime? @map("read_at")
  actionUrl String?   @map("action_url")
  metadata  Json?
  createdAt DateTime  @default(now()) @map("created_at")
  expiresAt DateTime? @map("expires_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
  @@index([userId])
  @@index([read])
  @@index([createdAt])
  @@index([type])
}

model AuditLog {
  id         String    @id @default(uuid())
  userId     String?   @map("user_id")
  action     String
  entityType String    @map("entity_type")
  entityId   String?   @map("entity_id")
  oldValues  Json?     @map("old_values")
  newValues  Json?     @map("new_values")
  ipAddress  String?   @map("ip_address")
  userAgent  String?   @map("user_agent")
  createdAt  DateTime  @default(now()) @map("created_at")

  // Relations
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("audit_logs")
  @@index([userId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])
}

model FileUpload {
  id         String   @id @default(uuid())
  entityType String   @map("entity_type")
  entityId   String   @map("entity_id")
  fileName   String   @map("file_name")
  filePath   String   @map("file_path")
  fileType   String   @map("file_type")
  fileSize   BigInt   @map("file_size")
  mimeType   String?  @map("mime_type")
  uploadedBy String   @map("uploaded_by")
  createdAt  DateTime @default(now()) @map("created_at")

  // Relations
  uploader User @relation(fields: [uploadedBy], references: [id])

  @@map("file_uploads")
  @@index([entityType, entityId])
  @@index([uploadedBy])
  @@index([createdAt])
}

model Setting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       Json
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("settings")
  @@index([key])
}
```

To apply this schema:
1. Copy the above models and append to `prisma/schema.prisma`
2. Run `npx prisma generate`
3. Run `npx prisma migrate dev --name init`
