# UI/UX Design Structure

## Design Philosophy
- **Clean & Modern**: Minimalist design with focus on functionality
- **Intuitive**: Easy to navigate without extensive training
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Accessible**: WCAG 2.1 AA compliant
- **Fast**: Optimized for performance
- **Consistent**: Unified design language across all modules

---

## Color Scheme

### Light Mode
```
Primary: #2563eb (Blue 600)
Primary Hover: #1d4ed8 (Blue 700)
Secondary: #7c3aed (Purple 600)
Success: #059669 (Green 600)
Warning: #d97706 (Amber 600)
Error: #dc2626 (Red 600)
Info: #0891b2 (Cyan 600)

Background: #ffffff (White)
Surface: #f9fafb (Gray 50)
Border: #e5e7eb (Gray 200)

Text Primary: #111827 (Gray 900)
Text Secondary: #6b7280 (Gray 500)
Text Disabled: #9ca3af (Gray 400)
```

### Dark Mode
```
Primary: #3b82f6 (Blue 500)
Primary Hover: #2563eb (Blue 600)
Secondary: #8b5cf6 (Purple 500)
Success: #10b981 (Green 500)
Warning: #f59e0b (Amber 500)
Error: #ef4444 (Red 500)
Info: #06b6d4 (Cyan 500)

Background: #111827 (Gray 900)
Surface: #1f2937 (Gray 800)
Border: #374151 (Gray 700)

Text Primary: #f9fafb (Gray 50)
Text Secondary: #9ca3af (Gray 400)
Text Disabled: #6b7280 (Gray 500)
```

---

## Typography

```
Font Family: 'Inter', system-ui, sans-serif

Headings:
H1: 36px/40px, font-weight: 700
H2: 30px/36px, font-weight: 700
H3: 24px/32px, font-weight: 600
H4: 20px/28px, font-weight: 600
H5: 16px/24px, font-weight: 600
H6: 14px/20px, font-weight: 600

Body:
Large: 18px/28px, font-weight: 400
Normal: 16px/24px, font-weight: 400
Small: 14px/20px, font-weight: 400
Extra Small: 12px/16px, font-weight: 400

Special:
Button: 14px/20px, font-weight: 500
Caption: 12px/16px, font-weight: 400
Overline: 10px/16px, font-weight: 700, uppercase
```

---

## Layout Structure

### Main Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (Fixed)                                                 │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────────────┐│
│  │ Logo + Title │  │ Global Search  │  │ Notif │ User Menu  ││
│  └──────────────┘  └────────────────┘  └─────────────────────┘│
├─────────────────┬───────────────────────────────────────────────┤
│  Sidebar        │  Main Content Area                            │
│  (Collapsible)  │                                                │
│                 │  ┌──────────────────────────────────────────┐ │
│  ┌────────────┐ │  │  Breadcrumb Navigation                   │ │
│  │ Dashboard  │ │  └──────────────────────────────────────────┘ │
│  ├────────────┤ │                                                │
│  │ Projects   │ │  ┌──────────────────────────────────────────┐ │
│  ├────────────┤ │  │                                          │ │
│  │ Planning   │ │  │                                          │ │
│  ├────────────┤ │  │                                          │ │
│  │ Resources  │ │  │         Page Content                     │ │
│  ├────────────┤ │  │                                          │ │
│  │ BOQ        │ │  │                                          │ │
│  ├────────────┤ │  │                                          │ │
│  │ Materials  │ │  │                                          │ │
│  ├────────────┤ │  │                                          │ │
│  │ Site       │ │  │                                          │ │
│  ├────────────┤ │  │                                          │ │
│  │ Reports    │ │  │                                          │ │
│  ├────────────┤ │  │                                          │ │
│  │ Analytics  │ │  └──────────────────────────────────────────┘ │
│  ├────────────┤ │                                                │
│  │ Settings   │ │                                                │
│  └────────────┘ │                                                │
│                 │                                                │
│  Width: 240px   │  Flex: 1                                       │
│  (64px when     │                                                │
│   collapsed)    │                                                │
│                 │                                                │
└─────────────────┴────────────────────────────────────────────────┘
```

### Header Component
```
Height: 64px
Background: White (light) / Gray-900 (dark)
Border Bottom: 1px solid Border Color
Z-index: 40

Left Section:
- Logo (32px × 32px)
- App Title (Font: 18px, Bold)
- Sidebar Toggle Button (Mobile)

Center Section:
- Global Search (Min-width: 300px, Max-width: 600px)
- Keyboard shortcut: Cmd+K / Ctrl+K

Right Section:
- Project Selector Dropdown
- Notification Bell (with badge)
- AI Assistant Button
- Theme Toggle (Light/Dark)
- User Avatar + Name (Dropdown)
```

### Sidebar Component
```
Width: 240px (expanded) / 64px (collapsed)
Background: White (light) / Gray-800 (dark)
Border Right: 1px solid Border Color

Navigation Items:
- Icon (24px) + Label
- Active state: Primary color background
- Hover state: Light primary color background
- Badge support for counts

Bottom Section:
- Help & Support
- Version Number
- Collapse Toggle
```

---

## Module Pages

### 1. Dashboard Page

```
┌─────────────────────────────────────────────────────────────────┐
│  Project Overview Header                                        │
│  ┌──────────────┐  Project: Temple Construction Phase 1        │
│  │ Project Icon │  Status: Active • 65% Complete               │
│  └──────────────┘  Timeline: Jan 2026 - Dec 2026               │
├─────────────────────────────────────────────────────────────────┤
│  KPI Cards (Grid: 4 columns on desktop, 2 on tablet, 1 mobile) │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐│
│  │ Total Tasks  │ │ Budget Used  │ │ Active       │ │Delayed ││
│  │             │ │             │ │ Resources    │ │Tasks   ││
│  │ 156/240     │ │ 45.2M/80M   │ │ 45 Workers   │ │12      ││
│  │ ■■■■■□□ 65% │ │ ■■■■□□□ 56% │ │ 12 Equipment │ │■ High  ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Chart Section (Grid: 2 columns)                                │
│  ┌──────────────────────────────┐ ┌──────────────────────────┐│
│  │ Progress Timeline            │ │ Budget Breakdown         ││
│  │ (Line Chart)                 │ │ (Donut Chart)            ││
│  │                              │ │                          ││
│  │                              │ │                          ││
│  │                              │ │                          ││
│  └──────────────────────────────┘ └──────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Split View (2:1 ratio)                                         │
│  ┌──────────────────────────────┐ ┌──────────────────────────┐│
│  │ Recent Activities            │ │ Alerts & Notifications   ││
│  │ - Task completed: Foundation │ │ ⚠ Material Low Stock     ││
│  │ - Budget approved: Phase 2   │ │ ⚠ Task Delayed: Plumbing ││
│  │ - New worker assigned        │ │ ℹ Inspection Tomorrow    ││
│  │ - Material delivered         │ │ ✓ Budget Approved        ││
│  │ [View All]                   │ │ [View All]               ││
│  └──────────────────────────────┘ └──────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  AI Insights Panel                                              │
│  ┌─────────────────────────────────────────────────────────────┤
│  │ 🤖 AI Recommendations                                       ││
│  │ • Project may face 5-day delay due to weather forecast     ││
│  │ • Consider reallocating 3 workers from Task A to Task B    ││
│  │ • Budget overrun risk in electrical work (15% over)        ││
│  │ [View Detailed Analysis]                                    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 2. Projects List Page

```
┌─────────────────────────────────────────────────────────────────┐
│  Projects                                          [+ New Project]│
├─────────────────────────────────────────────────────────────────┤
│  Filters & Search                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐│
│  │ 🔍 Search    │ │ Status: All  │ │ Type: All    │ │ Sort   ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────┘│
├─────────────────────────────────────────────────────────────────┤
│  View Switcher: [■ Grid] [≡ List]                              │
├─────────────────────────────────────────────────────────────────┤
│  Grid View (3 columns on desktop, 2 on tablet, 1 on mobile)    │
│  ┌─────────────────────┐ ┌─────────────────────┐              │
│  │ Temple Phase 1      │ │ Eco Village         │              │
│  │ [Project Image]     │ │ [Project Image]     │              │
│  │                     │ │                     │              │
│  │ Status: ● Active    │ │ Status: ● Planning  │              │
│  │ Progress: 65%       │ │ Progress: 25%       │              │
│  │ ■■■■■□□             │ │ ■■□□□□□             │              │
│  │                     │ │                     │              │
│  │ Budget: 45M/80M     │ │ Budget: 12M/50M     │              │
│  │ Team: 45 members    │ │ Team: 18 members    │              │
│  │ Due: Dec 2026       │ │ Due: Jun 2027       │              │
│  │                     │ │                     │              │
│  │ [View Details]      │ │ [View Details]      │              │
│  └─────────────────────┘ └─────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Task Management / Gantt Chart

```
┌─────────────────────────────────────────────────────────────────┐
│  Planning & Scheduling                                          │
│  [List View] [Gantt Chart] [Kanban Board] [Calendar View]      │
├─────────────────────────────────────────────────────────────────┤
│  Toolbar                                                        │
│  [+ Add Task] [↓ Export] [⚙ Settings]    Zoom: [-] [■] [+]   │
├─────────┬───────────────────────────────────────────────────────┤
│ Task    │  Timeline (Gantt Chart)                               │
│ List    │  ┌────────────────────────────────────────────────────┤
│         │  │ Jan  │ Feb  │ Mar  │ Apr  │ May  │ Jun  │ Jul ... │
│ ┌──────┐│  ├────────────────────────────────────────────────────┤
│ │Task 1││  │ ████████░░░░░░░░░░░                               │
│ │65%   ││  │     └─ Dependencies →                             │
│ └──────┘│  │                      ████████████░░░░░             │
│         │  │                                                     │
│ ┌──────┐│  │ ████████████████░░░░░░                            │
│ │Task 2││  │ ⚠ Delayed                                          │
│ │45%   ││  │                                                     │
│ └──────┘│  │                                      ███████████  │
│         │  │                                      Milestone ▼   │
│ ┌──────┐│  │                                                     │
│ │Task 3││  │        ████████████████████░░░░░░                 │
│ │80%   ││  │                                                     │
│ └──────┘│  └────────────────────────────────────────────────────┘
│         │                                                        │
│ [Show   │  Task Details Panel (Right Sidebar - Collapsible)     │
│  More]  │  ┌────────────────────────────────────────────────────┤
│         │  │ Foundation Work                                    │
│         │  │ Status: In Progress  Priority: High               │
│         │  │ Assigned: John Doe, Jane Smith                     │
│         │  │ Due: Feb 15, 2026                                 │
│         │  │ Progress: 65%                                      │
│         │  │ [Edit] [Delete]                                    │
│         │  └────────────────────────────────────────────────────┘
└─────────┴────────────────────────────────────────────────────────┘
```

### 4. Resource Management

```
┌─────────────────────────────────────────────────────────────────┐
│  Resource Management                                            │
│  [Workers] [Equipment] [Vehicles] [Allocations]                │
├─────────────────────────────────────────────────────────────────┤
│  Toolbar                                                        │
│  [+ Add Worker] [Import CSV]           🔍 Search  [Filters▼]  │
├─────────────────────────────────────────────────────────────────┤
│  Workers List (Table with pagination)                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Name        │ Skill      │ Status   │ Daily Wage │ Actions ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 👤 John Doe │ Mason      │ ● Active │ ₹1,500    │ [📝][🗑]││
│  │ 👤 Jane S.  │ Carpenter  │ ● Active │ ₹1,200    │ [📝][🗑]││
│  │ 👤 Mike R.  │ Electrician│ ● Active │ ₹1,800    │ [📝][🗑]││
│  │ 👤 Sarah T. │ Plumber    │ ○ Leave  │ ₹1,500    │ [📝][🗑]││
│  └─────────────────────────────────────────────────────────────┘│
│  Showing 1-10 of 45                       [< 1 2 3 4 5 >]      │
├─────────────────────────────────────────────────────────────────┤
│  Allocation Calendar (Week View)                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Worker  │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │ Sun    ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ John Doe│ P1   │ P1   │ P1   │ P1   │ P1   │ P1   │ OFF    ││
│  │ Jane S. │ P1   │ P1   │ P2   │ P2   │ P2   │ OFF  │ OFF    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 5. BOQ & Budget Module

```
┌─────────────────────────────────────────────────────────────────┐
│  BOQ & Budget Management                                        │
│  [BOQ] [Budget] [Expenses] [Variance Analysis]                 │
├─────────────────────────────────────────────────────────────────┤
│  Budget Overview Cards                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ Total Budget │ │ Spent        │ │ Remaining    │           │
│  │ ₹80,00,000  │ │ ₹45,20,000  │ │ ₹34,80,000  │           │
│  │              │ │ 56.5%        │ │ 43.5%        │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  BOQ Items (Expandable Tree Structure)                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ▼ Civil Work                         ₹25,00,000 (31%)     ││
│  │   ▼ Foundation                       ₹10,00,000           ││
│  │     • Excavation (100 cu.m @ 500)     ₹50,000            ││
│  │     • Concrete (50 cu.m @ 8000)       ₹4,00,000          ││
│  │     • Steel (5 tons @ 60000)          ₹3,00,000          ││
│  │   ▼ Superstructure                   ₹15,00,000           ││
│  │                                                             ││
│  │ ▼ Electrical Work                    ₹15,00,000 (19%)     ││
│  │   • Wiring (1000m @ 150)              ₹1,50,000           ││
│  │   • Fixtures & Fittings               ₹5,00,000           ││
│  │                                                             ││
│  │ ▶ Plumbing Work                      ₹12,00,000 (15%)     ││
│  │ ▶ Finishing Work                     ₹20,00,000 (25%)     ││
│  │ ▶ Miscellaneous                      ₹8,00,000 (10%)      ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Budget vs Actual Chart                                        │
│  [Bar Chart showing budget vs actual spend by category]        │
└─────────────────────────────────────────────────────────────────┘
```

### 6. Materials & Purchase

```
┌─────────────────────────────────────────────────────────────────┐
│  Material & Purchase Management                                │
│  [Inventory] [Purchase Requests] [Purchase Orders] [Vendors]   │
├─────────────────────────────────────────────────────────────────┤
│  Stock Alerts                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⚠ Low Stock Items (3)                                      ││
│  │ • Cement - Current: 50 bags, Min: 100 bags  [Order Now]   ││
│  │ • Steel Rods - Current: 500 kg, Min: 1000 kg [Order Now]  ││
│  │ • Bricks - Current: 2000 nos, Min: 5000 nos  [Order Now]  ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Inventory Table                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Material   │Current│ Min │ Max │ Unit │ Status │ Actions  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Cement     │  50   │ 100 │ 500 │ Bags │ ⚠ Low  │ [+][-][📝]││
│  │ Sand       │ 2000  │ 500 │5000 │ Cu.ft│ ✓ OK   │ [+][-][📝]││
│  │ Aggregate  │ 1500  │ 800 │4000 │ Cu.ft│ ✓ OK   │ [+][-][📝]││
│  │ Steel TMT  │  500  │1000 │3000 │ Kg   │ ⚠ Low  │ [+][-][📝]││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Recent Purchase Orders                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ PO#     │ Vendor       │ Amount    │ Status   │ Due Date   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ PO-1001 │ ABC Traders  │ ₹2,50,000│● Delivered│ Jan 15    ││
│  │ PO-1002 │ XYZ Cement   │ ₹1,80,000│◐ Partial  │ Jan 20    ││
│  │ PO-1003 │ Steel Corp   │ ₹3,20,000│○ Pending  │ Jan 25    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 7. Site Execution / Daily Reports

```
┌─────────────────────────────────────────────────────────────────┐
│  Site Execution                                                │
│  [Daily Reports] [Work Logs] [Safety Checklist] [Issues]      │
├─────────────────────────────────────────────────────────────────┤
│  Create Daily Report                          Date: Jan 15, 2026│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Weather Conditions                                          ││
│  │ ┌──────────────┐ ┌──────────────┐                          ││
│  │ │ Weather: ☀   │ │ Temp: 28°C   │                          ││
│  │ └──────────────┘ └──────────────┘                          ││
│  │                                                              ││
│  │ Workers Attendance                                          ││
│  │ Present: [45]   Absent: [3]   On Leave: [2]                ││
│  │                                                              ││
│  │ Work Summary                                                ││
│  │ ┌───────────────────────────────────────────────────────────┐││
│  │ │ [Text area with rich text editor]                       │││
│  │ │ Today's work included:                                   │││
│  │ │ - Foundation concrete pouring completed                  │││
│  │ │ - Steel reinforcement for column started                 │││
│  │ │ - Electrical conduit laying in progress                  │││
│  │ └───────────────────────────────────────────────────────────┘││
│  │                                                              ││
│  │ Upload Photos                                               ││
│  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       ││
│  │ │[IMG1]│ │[IMG2]│ │[IMG3]│ │[+Add]│                       ││
│  │ └──────┘ └──────┘ └──────┘ └──────┘                       ││
│  │                                                              ││
│  │ Materials Consumed                                          ││
│  │ • Cement: 50 bags                                           ││
│  │ • Steel: 200 kg                                             ││
│  │ [+ Add Material]                                            ││
│  │                                                              ││
│  │ Issues/Challenges                                           ││
│  │ ┌───────────────────────────────────────────────────────────┐││
│  │ │ Minor delay due to late material delivery                │││
│  │ └───────────────────────────────────────────────────────────┘││
│  │                                                              ││
│  │               [Save Draft]  [Submit Report]                 ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 8. AI Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  AI-Powered Analytics                                           │
│  [Overview] [Predictions] [Recommendations] [Chat Assistant]   │
├─────────────────────────────────────────────────────────────────┤
│  AI Insights Summary                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🤖 Project Health Score: 78/100 (Good)                     ││
│  │                                                              ││
│  │ ✓ On track for completion                                   ││
│  │ ⚠ Budget risk in electrical work (15% overrun predicted)   ││
│  │ ⚠ Resource shortage expected in next 2 weeks               ││
│  │ ✓ Quality metrics within acceptable range                   ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Predictions & Forecasts                                        │
│  ┌──────────────────────────────┐ ┌──────────────────────────┐│
│  │ Project Completion Forecast  │ │ Budget Trend Analysis    ││
│  │ [Line Chart with confidence] │ │ [Area Chart]             ││
│  │                              │ │                          ││
│  │ Predicted: Dec 20, 2026      │ │ Predicted Final:         ││
│  │ Confidence: 85%              │ │ ₹86.5M (8% overrun)     ││
│  │                              │ │ Confidence: 78%          ││
│  └──────────────────────────────┘ └──────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  AI Recommendations                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. Resource Optimization                            Priority││
│  │    Consider reallocating 3 masons from Task A to    HIGH   ││
│  │    Task B to prevent bottleneck.                            ││
│  │    [View Details] [Apply]                                   ││
│  │                                                              ││
│  │ 2. Cost Optimization                                 MEDIUM ││
│  │    Alternative vendor for steel can save ₹50,000           ││
│  │    [View Vendor] [Contact]                                  ││
│  │                                                              ││
│  │ 3. Schedule Optimization                             MEDIUM ││
│  │    Parallel execution of Tasks X and Y can save 5 days     ││
│  │    [View Plan] [Apply]                                      ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  AI Chat Assistant                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 💬 Ask me anything about your project...                   ││
│  │                                                              ││
│  │ You: What's the status of electrical work?                 ││
│  │ AI: The electrical work is currently 45% complete and...   ││
│  │                                                              ││
│  │ You: Which tasks are delayed?                               ││
│  │ AI: Currently, 3 tasks are delayed:                         ││
│  │     1. Plumbing inspection (2 days)                         ││
│  │     2. Electrical conduit laying (1 day)                    ││
│  │     3. Floor tiling (3 days)                                ││
│  │                                                              ││
│  │ [Type your question...                              [Send]] ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Library

### Buttons
```
Primary: bg-primary hover:bg-primary-dark text-white
Secondary: bg-gray-200 hover:bg-gray-300 text-gray-900
Outline: border border-primary text-primary hover:bg-primary-light
Ghost: text-primary hover:bg-primary-light
Danger: bg-error hover:bg-error-dark text-white

Sizes: sm (32px), md (40px), lg (48px)
States: default, hover, active, disabled, loading
```

### Input Fields
```
Base: border border-gray-300 rounded-lg px-4 py-2
Focus: ring-2 ring-primary border-primary
Error: border-error ring-1 ring-error
Disabled: bg-gray-100 cursor-not-allowed opacity-60

Variants: text, email, password, number, date, textarea, select
With Icons: leading-icon, trailing-icon
With Validation: error message, success message
```

### Cards
```
Base: bg-white rounded-lg shadow-sm border border-gray-200
Hover: shadow-md transition-shadow
Interactive: cursor-pointer hover:border-primary

Variants:
- Default Card
- Stats Card (with icon, value, trend)
- Image Card (with image header)
- List Card (compact, for lists)
```

### Tables
```
Features:
- Sortable columns
- Filterable columns
- Row selection (checkbox)
- Pagination
- Row actions (dropdown)
- Expandable rows
- Sticky header
- Responsive (horizontal scroll on mobile)
```

### Modals
```
Sizes: sm (400px), md (600px), lg (800px), xl (1000px), full
Structure:
- Header (title + close button)
- Body (scrollable content)
- Footer (actions)

Variants:
- Confirmation Modal
- Form Modal
- View Details Modal
- Fullscreen Modal (for media)
```

### Notifications/Toasts
```
Position: top-right, top-center, bottom-right, bottom-center
Types: success, error, warning, info
Duration: 3s (default), persistent (manual close)
Features:
- Auto-dismiss
- Action button
- Close button
- Progress bar
```

### Charts
```
Types:
- Line Chart (trends)
- Bar Chart (comparisons)
- Donut/Pie Chart (distributions)
- Area Chart (cumulative)
- Gantt Chart (timeline)
- Progress Chart (KPIs)

Features:
- Tooltips
- Legends
- Zoom/Pan
- Export (PNG, SVG, PDF)
- Responsive
```

---

## Responsive Breakpoints

```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: 1024px - 1536px
Large Desktop: > 1536px

Sidebar Behavior:
Mobile: Hidden by default (hamburger menu)
Tablet: Collapsed (icons only)
Desktop: Expanded
```

---

## Accessibility Features

1. **Keyboard Navigation**
   - Tab order
   - Keyboard shortcuts
   - Focus indicators

2. **Screen Reader Support**
   - ARIA labels
   - ARIA roles
   - ARIA live regions

3. **Color Contrast**
   - WCAG AA compliant
   - 4.5:1 for text
   - 3:1 for large text

4. **Motion**
   - Respect prefers-reduced-motion
   - Optional animations

---

## Performance Considerations

1. **Code Splitting**: Route-based lazy loading
2. **Image Optimization**: WebP format, lazy loading
3. **Virtualization**: Large lists (react-window)
4. **Debouncing**: Search inputs
5. **Caching**: React Query for API responses
6. **Memoization**: useMemo, useCallback for expensive operations

---

## Dark Mode Implementation

- System preference detection
- Manual toggle
- Persistent user preference (localStorage)
- Smooth transition between modes
- All components dark-mode ready

---

This UI/UX design ensures:
- **Professional Look**: Modern, clean interface
- **User-Friendly**: Intuitive navigation and workflows
- **Responsive**: Works on all devices
- **Accessible**: WCAG compliant
- **Performant**: Optimized for speed
- **Consistent**: Unified design language
