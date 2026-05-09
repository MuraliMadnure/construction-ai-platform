-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'PLANNED';
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'ASSIGNED';
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'READY_TO_START';
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'VERIFIED';
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'CLOSED';
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'ON_HOLD';
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'REOPENED';

-- CreateEnum
CREATE TYPE "PhaseStatus" AS ENUM ('PLANNING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('DIRECT', 'TEAM', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "AcceptanceStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'CONDITIONAL_APPROVAL', 'REVISION_REQUIRED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUIRED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'PARTIAL', 'RESERVED', 'ISSUED');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL', 'URGENT');

-- CreateTable
CREATE TABLE "phases" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "phase_order" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "actual_start_date" DATE,
    "actual_end_date" DATE,
    "status" "PhaseStatus" NOT NULL DEFAULT 'PLANNING',
    "progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "budget_allocated" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "actual_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "responsible_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subphases" (
    "id" TEXT NOT NULL,
    "phase_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subphase_order" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "actual_start_date" DATE,
    "actual_end_date" DATE,
    "progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "budget_allocated" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "actual_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subphases_pkey" PRIMARY KEY ("id")
);

-- AlterTable tasks
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "phase_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "subphase_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "duration" INTEGER DEFAULT 0;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "estimated_cost" DECIMAL(15,2) DEFAULT 0;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "approved_budget" DECIMAL(15,2);
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "actual_cost" DECIMAL(15,2) DEFAULT 0;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "is_critical_path" BOOLEAN DEFAULT false;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "risk_level" "RiskLevel" DEFAULT 'LOW';
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "delay_reason" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "assigned_to" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "contractor_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "available_for_assignment" BOOLEAN DEFAULT false;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "requires_approval" BOOLEAN DEFAULT true;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "approval_workflow_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3);
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "approved_by" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "site_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10,8);
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(11,8);
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "completion_type" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "verified_by" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "verified_at" TIMESTAMP(3);

-- Alter description column to TEXT
ALTER TABLE "tasks" ALTER COLUMN "description" TYPE TEXT;

-- AlterTable task_assignments
ALTER TABLE "task_assignments" ADD COLUMN IF NOT EXISTS "assignment_type" "AssignmentType" DEFAULT 'DIRECT';
ALTER TABLE "task_assignments" ADD COLUMN IF NOT EXISTS "allocation_percent" INTEGER DEFAULT 100;
ALTER TABLE "task_assignments" ADD COLUMN IF NOT EXISTS "instructions" TEXT;
ALTER TABLE "task_assignments" ADD COLUMN IF NOT EXISTS "acceptance_required" BOOLEAN DEFAULT false;
ALTER TABLE "task_assignments" ADD COLUMN IF NOT EXISTS "acceptance_status" "AcceptanceStatus" DEFAULT 'PENDING';
ALTER TABLE "task_assignments" ADD COLUMN IF NOT EXISTS "accepted_at" TIMESTAMP(3);
ALTER TABLE "task_assignments" ADD COLUMN IF NOT EXISTS "acceptance_comments" TEXT;
ALTER TABLE "task_assignments" ADD COLUMN IF NOT EXISTS "decline_reason" TEXT;
ALTER TABLE "task_assignments" ADD COLUMN IF NOT EXISTS "can_delegate" BOOLEAN DEFAULT false;
ALTER TABLE "task_assignments" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active';

-- CreateTable
CREATE TABLE "task_approval_workflows" (
    "id" TEXT NOT NULL,
    "workflow_type" TEXT NOT NULL,
    "current_sequence" INTEGER NOT NULL DEFAULT 1,
    "overall_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "initiated_by" TEXT NOT NULL,
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "sla_hours" INTEGER NOT NULL DEFAULT 48,
    "escalation_enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "task_approval_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_approval_steps" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "approver_id" TEXT NOT NULL,
    "approver_name" TEXT NOT NULL,
    "approval_type" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "required" BOOLEAN NOT NULL DEFAULT true,
    "can_override" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "comments" TEXT,
    "attachments" JSONB,
    "conditions" JSONB,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "escalated_to" TEXT,
    "escalated_at" TIMESTAMP(3),

    CONSTRAINT "task_approval_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_progress_reports" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "site_id" TEXT,
    "report_date" DATE NOT NULL,
    "work_start_time" TIME,
    "work_end_time" TIME,
    "total_hours" DECIMAL(5,2),
    "break_time_hours" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "productive_hours" DECIMAL(5,2),
    "progress_today" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "cumulative_progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "previous_progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "progress_description" TEXT,
    "work_completed" JSONB,
    "work_in_progress" JSONB,
    "work_pending" JSONB,
    "labor_attendance" JSONB,
    "total_labor_count" INTEGER NOT NULL DEFAULT 0,
    "total_labor_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "equipment_usage" JSONB,
    "total_equipment_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "materials_consumed" JSONB,
    "total_material_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "daily_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "quality_checks" JSONB,
    "safety_observations" JSONB,
    "safety_incidents" JSONB,
    "issues" JSONB,
    "delays" JSONB,
    "total_delay_hours" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "weather_conditions" JSONB,
    "photos" JSONB,
    "engineer_remarks" TEXT,
    "supervisor_remarks" TEXT,
    "review_status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_comments" TEXT,
    "reported_by" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submission_status" TEXT NOT NULL DEFAULT 'submitted',
    "submission_latitude" DECIMAL(10,8),
    "submission_longitude" DECIMAL(11,8),
    "location_verified" BOOLEAN NOT NULL DEFAULT false,
    "ai_insights" TEXT,
    "ai_generated_at" TIMESTAMP(3),

    CONSTRAINT "daily_progress_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_materials" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimated_quantity" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "estimated_unit_rate" DECIMAL(12,2) NOT NULL,
    "estimated_total" DECIMAL(15,2) NOT NULL,
    "reservation_status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "reserved_quantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "warehouse_location" TEXT,
    "reservation_date" TIMESTAMP(3),
    "required_by_date" DATE NOT NULL,
    "actual_quantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actual_rate" DECIMAL(12,2),
    "actual_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "consumption_date" TIMESTAMP(3),
    "wastage_quantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "wastage_reason" TEXT,
    "inventory_available" BOOLEAN NOT NULL DEFAULT false,
    "purchase_request_id" TEXT,
    "purchase_order_id" TEXT,
    "expected_delivery_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_resources" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "resource_type" "ResourceType" NOT NULL,
    "resource_id" TEXT NOT NULL,
    "resource_name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "allocation_percent" INTEGER NOT NULL DEFAULT 100,
    "hours_per_day" DECIMAL(5,2),
    "rate_per_hour" DECIMAL(10,2),
    "rate_per_day" DECIMAL(10,2),
    "estimated_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "actual_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_checklists" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_by" TEXT,
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "parent_id" TEXT,
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_attachments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_alerts" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "details" JSONB,
    "action_taken" BOOLEAN NOT NULL DEFAULT false,
    "dismissed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_cost_entries" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT,
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_cost_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "phases_project_id_idx" ON "phases"("project_id");
CREATE INDEX "phases_status_idx" ON "phases"("status");
CREATE INDEX "phases_phase_order_idx" ON "phases"("phase_order");

-- CreateIndex
CREATE INDEX "subphases_phase_id_idx" ON "subphases"("phase_id");
CREATE INDEX "subphases_subphase_order_idx" ON "subphases"("subphase_order");

-- CreateIndex
CREATE INDEX "tasks_phase_id_idx" ON "tasks"("phase_id");
CREATE INDEX "tasks_subphase_id_idx" ON "tasks"("subphase_id");
CREATE INDEX "tasks_assigned_to_idx" ON "tasks"("assigned_to");
CREATE INDEX "tasks_is_critical_path_idx" ON "tasks"("is_critical_path");

-- CreateIndex
CREATE INDEX "task_assignments_acceptance_status_idx" ON "task_assignments"("acceptance_status");

-- CreateIndex
CREATE INDEX "task_approval_workflows_overall_status_idx" ON "task_approval_workflows"("overall_status");
CREATE INDEX "task_approval_workflows_initiated_at_idx" ON "task_approval_workflows"("initiated_at");

-- CreateIndex
CREATE INDEX "task_approval_steps_workflow_id_idx" ON "task_approval_steps"("workflow_id");
CREATE INDEX "task_approval_steps_approver_id_idx" ON "task_approval_steps"("approver_id");
CREATE INDEX "task_approval_steps_status_idx" ON "task_approval_steps"("status");
CREATE INDEX "task_approval_steps_sequence_idx" ON "task_approval_steps"("sequence");

-- CreateIndex
CREATE INDEX "daily_progress_reports_task_id_idx" ON "daily_progress_reports"("task_id");
CREATE INDEX "daily_progress_reports_project_id_idx" ON "daily_progress_reports"("project_id");
CREATE INDEX "daily_progress_reports_report_date_idx" ON "daily_progress_reports"("report_date");
CREATE INDEX "daily_progress_reports_review_status_idx" ON "daily_progress_reports"("review_status");

-- CreateIndex
CREATE INDEX "task_materials_task_id_idx" ON "task_materials"("task_id");
CREATE INDEX "task_materials_material_id_idx" ON "task_materials"("material_id");
CREATE INDEX "task_materials_reservation_status_idx" ON "task_materials"("reservation_status");

-- CreateIndex
CREATE INDEX "task_resources_task_id_idx" ON "task_resources"("task_id");
CREATE INDEX "task_resources_resource_type_resource_id_idx" ON "task_resources"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "task_checklists_task_id_idx" ON "task_checklists"("task_id");
CREATE INDEX "task_checklists_completed_idx" ON "task_checklists"("completed");

-- CreateIndex
CREATE INDEX "task_comments_task_id_idx" ON "task_comments"("task_id");
CREATE INDEX "task_comments_user_id_idx" ON "task_comments"("user_id");
CREATE INDEX "task_comments_created_at_idx" ON "task_comments"("created_at");

-- CreateIndex
CREATE INDEX "task_attachments_task_id_idx" ON "task_attachments"("task_id");
CREATE INDEX "task_attachments_uploaded_by_idx" ON "task_attachments"("uploaded_by");

-- CreateIndex
CREATE INDEX "task_alerts_task_id_idx" ON "task_alerts"("task_id");
CREATE INDEX "task_alerts_type_idx" ON "task_alerts"("type");
CREATE INDEX "task_alerts_severity_idx" ON "task_alerts"("severity");
CREATE INDEX "task_alerts_created_at_idx" ON "task_alerts"("created_at");

-- CreateIndex
CREATE INDEX "task_cost_entries_task_id_idx" ON "task_cost_entries"("task_id");
CREATE INDEX "task_cost_entries_type_idx" ON "task_cost_entries"("type");
CREATE INDEX "task_cost_entries_date_idx" ON "task_cost_entries"("date");

-- AddForeignKey
ALTER TABLE "phases" ADD CONSTRAINT "phases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subphases" ADD CONSTRAINT "subphases_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_subphase_id_fkey" FOREIGN KEY ("subphase_id") REFERENCES "subphases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_approval_workflow_id_fkey" FOREIGN KEY ("approval_workflow_id") REFERENCES "task_approval_workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_approval_steps" ADD CONSTRAINT "task_approval_steps_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "task_approval_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_progress_reports" ADD CONSTRAINT "daily_progress_reports_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_materials" ADD CONSTRAINT "task_materials_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_resources" ADD CONSTRAINT "task_resources_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_checklists" ADD CONSTRAINT "task_checklists_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_alerts" ADD CONSTRAINT "task_alerts_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_cost_entries" ADD CONSTRAINT "task_cost_entries_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
