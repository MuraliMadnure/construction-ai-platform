# Database Schema Design

## Overview
This document describes the complete database schema for the Construction AI Platform using PostgreSQL.

---

## Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         USER MANAGEMENT                               │
└──────────────────────────────────────────────────────────────────────┘

users ←→ user_roles ←→ roles ←→ role_permissions ←→ permissions

┌──────────────────────────────────────────────────────────────────────┐
│                      PROJECT MANAGEMENT                               │
└──────────────────────────────────────────────────────────────────────┘

projects ←→ project_members ←→ users
    ↓
    ├─→ milestones
    ├─→ tasks ←→ task_dependencies
    │     ↓
    │     └─→ task_assignments ←→ users
    │     └─→ work_logs ←→ users
    │
    ├─→ boq
    │     └─→ boq_items
    │           └─→ boq_line_items
    │
    ├─→ budgets
    │     └─→ expenses
    │
    ├─→ daily_reports
    │     └─→ report_images
    │
    └─→ site_issues

┌──────────────────────────────────────────────────────────────────────┐
│                     RESOURCE MANAGEMENT                               │
└──────────────────────────────────────────────────────────────────────┘

projects
    └─→ resource_allocations
          ├─→ workers
          ├─→ equipment
          └─→ vehicles

┌──────────────────────────────────────────────────────────────────────┐
│                    MATERIAL MANAGEMENT                                │
└──────────────────────────────────────────────────────────────────────┘

materials
    └─→ inventory
          └─→ stock_movements

projects
    └─→ purchase_requests
          └─→ purchase_orders ←→ vendors
                └─→ purchase_order_items

┌──────────────────────────────────────────────────────────────────────┐
│                      SYSTEM TABLES                                    │
└──────────────────────────────────────────────────────────────────────┘

notifications ←→ users
audit_logs ←→ users
file_uploads ←→ projects/tasks
ai_insights ←→ projects
```

---

## Detailed Table Schemas

### 1. User Management

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    last_login_at TIMESTAMP,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT check_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

#### roles
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- admin, project_manager, site_engineer, etc.
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_name ON roles(name);
```

#### user_roles
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
```

#### permissions
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- project:read, project:write, etc.
    resource VARCHAR(50) NOT NULL, -- project, task, resource, etc.
    action VARCHAR(50) NOT NULL, -- read, write, delete, etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_name ON permissions(name);
```

#### role_permissions
```sql
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
```

#### refresh_tokens
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

---

### 2. Project Management

#### projects
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50) NOT NULL, -- temple, eco_village, infrastructure
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    actual_start_date DATE,
    actual_end_date DATE,
    status VARCHAR(50) DEFAULT 'planning', -- planning, active, on_hold, completed, cancelled
    progress DECIMAL(5, 2) DEFAULT 0.00, -- percentage
    budget DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0.00,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT check_status CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    CONSTRAINT check_progress CHECK (progress >= 0 AND progress <= 100),
    CONSTRAINT check_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
```

#### project_members
```sql
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- manager, engineer, contractor, viewer
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,

    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);
```

#### milestones
```sql
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    actual_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, delayed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_milestone_status CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed'))
);

CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_target_date ON milestones(target_date);
```

---

### 3. Task Management

#### tasks
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) NOT NULL, -- construction, procurement, inspection, etc.
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, delayed, blocked
    progress DECIMAL(5, 2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    actual_start_date DATE,
    actual_end_date DATE,
    estimated_hours DECIMAL(8, 2),
    actual_hours DECIMAL(8, 2),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT check_task_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT check_task_status CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'blocked', 'cancelled')),
    CONSTRAINT check_task_progress CHECK (progress >= 0 AND progress <= 100),
    CONSTRAINT check_task_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_dates ON tasks(start_date, end_date);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);
```

#### task_dependencies
```sql
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, etc.
    lag_days INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(task_id, depends_on_task_id),
    CONSTRAINT check_not_self_dependent CHECK (task_id != depends_on_task_id),
    CONSTRAINT check_dependency_type CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'))
);

CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);
```

#### task_assignments
```sql
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(task_id, user_id)
);

CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id);
```

#### work_logs
```sql
CREATE TABLE work_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    hours_worked DECIMAL(5, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_hours_worked CHECK (hours_worked >= 0 AND hours_worked <= 24)
);

CREATE INDEX idx_work_logs_task_id ON work_logs(task_id);
CREATE INDEX idx_work_logs_user_id ON work_logs(user_id);
CREATE INDEX idx_work_logs_date ON work_logs(date);
```

---

### 4. BOQ & Budget Management

#### boq (Bill of Quantities)
```sql
CREATE TABLE boq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, approved, rejected
    total_estimated_cost DECIMAL(15, 2) DEFAULT 0.00,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_boq_status CHECK (status IN ('draft', 'submitted', 'approved', 'rejected'))
);

CREATE INDEX idx_boq_project_id ON boq(project_id);
CREATE INDEX idx_boq_status ON boq(status);
```

#### boq_items (Categories)
```sql
CREATE TABLE boq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boq_id UUID NOT NULL REFERENCES boq(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- civil_work, electrical, plumbing, etc.
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_boq_items_boq_id ON boq_items(boq_id);
CREATE INDEX idx_boq_items_category ON boq_items(category);
```

#### boq_line_items
```sql
CREATE TABLE boq_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boq_item_id UUID NOT NULL REFERENCES boq_items(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    unit VARCHAR(50) NOT NULL, -- sqft, cubic_meter, kg, nos, etc.
    quantity DECIMAL(12, 2) NOT NULL,
    rate DECIMAL(12, 2) NOT NULL,
    amount DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * rate) STORED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_quantity CHECK (quantity > 0),
    CONSTRAINT check_rate CHECK (rate >= 0)
);

CREATE INDEX idx_boq_line_items_boq_item_id ON boq_line_items(boq_item_id);
```

#### budgets
```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    allocated_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0.00,
    remaining_amount DECIMAL(15, 2) GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED,
    fiscal_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_allocated_amount CHECK (allocated_amount >= 0)
);

CREATE INDEX idx_budgets_project_id ON budgets(project_id);
CREATE INDEX idx_budgets_category ON budgets(category);
```

#### expenses
```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    expense_date DATE NOT NULL,
    vendor_name VARCHAR(255),
    invoice_number VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, cancelled
    payment_date DATE,
    receipt_url TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_expense_amount CHECK (amount > 0),
    CONSTRAINT check_payment_status CHECK (payment_status IN ('pending', 'paid', 'cancelled'))
);

CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_budget_id ON expenses(budget_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_payment_status ON expenses(payment_status);
```

---

### 5. Resource Management

#### workers
```sql
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(255),
    skill_type VARCHAR(100) NOT NULL, -- mason, carpenter, electrician, etc.
    experience_years INTEGER,
    daily_wage DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, on_leave
    joined_date DATE,
    left_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_worker_status CHECK (status IN ('active', 'inactive', 'on_leave'))
);

CREATE INDEX idx_workers_skill_type ON workers(skill_type);
CREATE INDEX idx_workers_status ON workers(status);
```

#### equipment
```sql
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    equipment_type VARCHAR(100) NOT NULL, -- excavator, crane, mixer, etc.
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_cost DECIMAL(15, 2),
    daily_rental_cost DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'available', -- available, in_use, maintenance, broken
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_equipment_status CHECK (status IN ('available', 'in_use', 'maintenance', 'broken'))
);

CREATE INDEX idx_equipment_type ON equipment(equipment_type);
CREATE INDEX idx_equipment_status ON equipment(status);
```

#### vehicles
```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL, -- truck, pickup, car, etc.
    model VARCHAR(100),
    capacity VARCHAR(50),
    fuel_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'available', -- available, in_use, maintenance
    last_service_date DATE,
    next_service_date DATE,
    insurance_expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_vehicle_status CHECK (status IN ('available', 'in_use', 'maintenance'))
);

CREATE INDEX idx_vehicles_vehicle_number ON vehicles(vehicle_number);
CREATE INDEX idx_vehicles_status ON vehicles(status);
```

#### resource_allocations
```sql
CREATE TABLE resource_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL, -- worker, equipment, vehicle
    resource_id UUID NOT NULL,
    allocated_from DATE NOT NULL,
    allocated_to DATE NOT NULL,
    shift VARCHAR(20), -- morning, evening, night, full_day
    notes TEXT,
    allocated_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_resource_type CHECK (resource_type IN ('worker', 'equipment', 'vehicle')),
    CONSTRAINT check_allocation_dates CHECK (allocated_to >= allocated_from)
);

CREATE INDEX idx_resource_allocations_project_id ON resource_allocations(project_id);
CREATE INDEX idx_resource_allocations_resource ON resource_allocations(resource_type, resource_id);
CREATE INDEX idx_resource_allocations_dates ON resource_allocations(allocated_from, allocated_to);
```

---

### 6. Material & Purchase Management

#### materials
```sql
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- cement, steel, sand, bricks, etc.
    unit VARCHAR(50) NOT NULL, -- kg, ton, bag, nos, etc.
    current_stock DECIMAL(12, 2) DEFAULT 0.00,
    min_stock_level DECIMAL(12, 2) DEFAULT 0.00,
    max_stock_level DECIMAL(12, 2),
    unit_cost DECIMAL(12, 2),
    status VARCHAR(20) DEFAULT 'active', -- active, inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_material_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_stock_level ON materials(current_stock);
```

#### inventory
```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    location VARCHAR(255),
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(project_id, material_id)
);

CREATE INDEX idx_inventory_project_id ON inventory(project_id);
CREATE INDEX idx_inventory_material_id ON inventory(material_id);
```

#### stock_movements
```sql
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL, -- in, out, adjustment
    quantity DECIMAL(12, 2) NOT NULL,
    reference_type VARCHAR(50), -- purchase_order, task, adjustment
    reference_id UUID,
    notes TEXT,
    moved_by UUID NOT NULL REFERENCES users(id),
    moved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_movement_type CHECK (movement_type IN ('in', 'out', 'adjustment'))
);

CREATE INDEX idx_stock_movements_project_id ON stock_movements(project_id);
CREATE INDEX idx_stock_movements_material_id ON stock_movements(material_id);
CREATE INDEX idx_stock_movements_moved_at ON stock_movements(moved_at);
```

#### vendors
```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    gstin VARCHAR(50),
    rating DECIMAL(3, 2), -- 0.00 to 5.00
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, blacklisted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_vendor_status CHECK (status IN ('active', 'inactive', 'blacklisted')),
    CONSTRAINT check_rating CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_name ON vendors(name);
```

#### purchase_requests
```sql
CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, ordered
    required_by DATE NOT NULL,
    requested_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_pr_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT check_pr_status CHECK (status IN ('pending', 'approved', 'rejected', 'ordered'))
);

CREATE INDEX idx_purchase_requests_project_id ON purchase_requests(project_id);
CREATE INDEX idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX idx_purchase_requests_request_number ON purchase_requests(request_number);
```

#### purchase_orders
```sql
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_id UUID REFERENCES purchase_requests(id) ON DELETE SET NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    total_amount DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    grand_total DECIMAL(15, 2) GENERATED ALWAYS AS (total_amount + tax_amount) STORED,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, delivered, cancelled
    payment_terms TEXT,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_po_status CHECK (status IN ('pending', 'confirmed', 'partial_delivery', 'delivered', 'cancelled'))
);

CREATE INDEX idx_purchase_orders_project_id ON purchase_orders(project_id);
CREATE INDEX idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_order_number ON purchase_orders(order_number);
```

#### purchase_order_items
```sql
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    description TEXT,
    quantity DECIMAL(12, 2) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    received_quantity DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_poi_quantity CHECK (quantity > 0),
    CONSTRAINT check_poi_unit_price CHECK (unit_price >= 0),
    CONSTRAINT check_poi_received CHECK (received_quantity >= 0 AND received_quantity <= quantity)
);

CREATE INDEX idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_material_id ON purchase_order_items(material_id);
```

---

### 7. Site Execution

#### daily_reports
```sql
CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    weather VARCHAR(50),
    temperature VARCHAR(20),
    workers_present INTEGER DEFAULT 0,
    workers_absent INTEGER DEFAULT 0,
    work_summary TEXT NOT NULL,
    challenges_faced TEXT,
    materials_consumed TEXT,
    equipment_used TEXT,
    safety_incidents TEXT,
    visitors TEXT,
    submitted_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(project_id, report_date),
    CONSTRAINT check_workers CHECK (workers_present >= 0 AND workers_absent >= 0)
);

CREATE INDEX idx_daily_reports_project_id ON daily_reports(project_id);
CREATE INDEX idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX idx_daily_reports_submitted_by ON daily_reports(submitted_by);
```

#### report_images
```sql
CREATE TABLE report_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_images_daily_report_id ON report_images(daily_report_id);
```

#### safety_checklists
```sql
CREATE TABLE safety_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    checklist_date DATE NOT NULL,
    ppe_available BOOLEAN DEFAULT false,
    fire_extinguisher_check BOOLEAN DEFAULT false,
    first_aid_kit_check BOOLEAN DEFAULT false,
    scaffolding_safe BOOLEAN DEFAULT false,
    electrical_safety_check BOOLEAN DEFAULT false,
    housekeeping_status VARCHAR(20), -- good, average, poor
    incidents_reported INTEGER DEFAULT 0,
    notes TEXT,
    checked_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_housekeeping CHECK (housekeeping_status IN ('good', 'average', 'poor') OR housekeeping_status IS NULL)
);

CREATE INDEX idx_safety_checklists_project_id ON safety_checklists(project_id);
CREATE INDEX idx_safety_checklists_date ON safety_checklists(checklist_date);
```

#### site_issues
```sql
CREATE TABLE site_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    issue_type VARCHAR(50) NOT NULL, -- safety, quality, delay, resource, other
    severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
    reported_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_issue_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT check_issue_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'))
);

CREATE INDEX idx_site_issues_project_id ON site_issues(project_id);
CREATE INDEX idx_site_issues_status ON site_issues(status);
CREATE INDEX idx_site_issues_severity ON site_issues(severity);
CREATE INDEX idx_site_issues_issue_type ON site_issues(issue_type);
```

---

### 8. AI & Analytics

#### ai_insights
```sql
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- delay_prediction, budget_alert, resource_optimization, etc.
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20), -- info, warning, critical
    confidence_score DECIMAL(5, 2), -- 0.00 to 100.00
    data JSONB, -- Store AI model output
    action_taken BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,

    CONSTRAINT check_insight_severity CHECK (severity IN ('info', 'warning', 'critical') OR severity IS NULL),
    CONSTRAINT check_confidence CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

CREATE INDEX idx_ai_insights_project_id ON ai_insights(project_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_ai_insights_severity ON ai_insights(severity);
CREATE INDEX idx_ai_insights_created_at ON ai_insights(created_at);
```

#### ai_predictions
```sql
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL, -- completion_date, budget_overrun, resource_need
    predicted_value JSONB NOT NULL,
    actual_value JSONB,
    accuracy DECIMAL(5, 2), -- Calculated after actual value is known
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

CREATE INDEX idx_ai_predictions_project_id ON ai_predictions(project_id);
CREATE INDEX idx_ai_predictions_task_id ON ai_predictions(task_id);
CREATE INDEX idx_ai_predictions_type ON ai_predictions(prediction_type);
```

---

### 9. System Tables

#### notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- task_assigned, deadline_approaching, budget_alert, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,

    CONSTRAINT check_notif_priority CHECK (priority IN ('low', 'normal', 'high'))
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, etc.
    entity_type VARCHAR(100) NOT NULL, -- user, project, task, etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

#### file_uploads
```sql
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL, -- project, task, report, expense, etc.
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL, -- in bytes
    mime_type VARCHAR(100),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_file_size CHECK (file_size > 0)
);

CREATE INDEX idx_file_uploads_entity ON file_uploads(entity_type, entity_id);
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX idx_file_uploads_created_at ON file_uploads(created_at);
```

#### settings
```sql
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON settings(key);
```

---

## Database Optimization Strategies

### 1. Indexing Strategy
- Primary keys on all tables (UUID)
- Foreign key indexes for joins
- Composite indexes for common query patterns
- Partial indexes for filtered queries
- GiST indexes for geospatial data (latitude, longitude)

### 2. Partitioning Strategy
For large tables, implement partitioning:
- `audit_logs`: Partition by month
- `notifications`: Partition by month
- `work_logs`: Partition by year
- `stock_movements`: Partition by year

### 3. Performance Optimization
- Use connection pooling
- Implement query result caching (Redis)
- Use materialized views for complex analytics
- Regular VACUUM and ANALYZE
- Query optimization using EXPLAIN ANALYZE

### 4. Backup Strategy
- Daily automated backups
- Point-in-time recovery enabled
- Backup retention: 30 days
- Test restore procedures monthly

### 5. Security Measures
- Row-level security (RLS) for multi-tenancy
- Encrypted connections (SSL)
- Separate read-only user for reporting
- Regular security audits
- Principle of least privilege

---

## Sample Queries

### Get Project Dashboard Data
```sql
SELECT
    p.id,
    p.name,
    p.status,
    p.progress,
    p.budget,
    p.spent_amount,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT pm.user_id) as team_members
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id AND t.deleted_at IS NULL
LEFT JOIN project_members pm ON pm.project_id = p.id
WHERE p.id = $1 AND p.deleted_at IS NULL
GROUP BY p.id;
```

### Get Delayed Tasks
```sql
SELECT
    t.id,
    t.name,
    t.end_date,
    t.status,
    CURRENT_DATE - t.end_date as days_delayed,
    p.name as project_name
FROM tasks t
JOIN projects p ON p.id = t.project_id
WHERE t.status != 'completed'
AND t.end_date < CURRENT_DATE
AND t.deleted_at IS NULL
ORDER BY days_delayed DESC;
```

### Get Material Stock Alerts
```sql
SELECT
    m.id,
    m.name,
    m.current_stock,
    m.min_stock_level,
    m.unit
FROM materials m
WHERE m.current_stock < m.min_stock_level
AND m.status = 'active'
ORDER BY (m.min_stock_level - m.current_stock) DESC;
```

---

This database schema is designed to be:
- **Scalable**: Handles millions of records
- **Performant**: Optimized indexes and queries
- **Normalized**: Follows 3NF principles
- **Secure**: Row-level security ready
- **Flexible**: JSONB columns for extensibility
- **Auditable**: Complete audit trail
