# Enterprise Task Management - Testing Guide

## 🎯 Test Status: **Ready for Testing**

All components have been implemented and integrated. Follow this guide to test the complete enterprise task management system.

---

## 🚀 Quick Start - Setup

### 1. Start Backend Server

```bash
cd backend

# Install dependencies (if not done)
npm install

# Run database migration
npx prisma migrate deploy

# Start server
npm run dev

# Server should be running on http://localhost:5000
```

### 2. Start Frontend Application

```bash
cd frontend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Application should be running on http://localhost:5173
```

### 3. Login and Navigate

1. Open browser: `http://localhost:5173`
2. Login with your credentials
3. Navigate to `/tasks` page

---

## 📋 Test Checklist

### ✅ Phase 1: Board View (Kanban)

**Test ID: T1.1 - Load Task Board**
- [ ] Navigate to Tasks page
- [ ] Verify 6 columns appear: Pending, Assigned, In Progress, Under Review, Completed, Blocked
- [ ] Verify task cards load in appropriate columns
- [ ] Check real-time indicator shows "Live" (green dot)

**Test ID: T1.2 - Search and Filter**
- [ ] Type in search box and verify tasks filter
- [ ] Click "Filters" button
- [ ] Select phase filter and verify results
- [ ] Select assignee filter and verify results
- [ ] Select priority filter and verify results
- [ ] Click "Reset Filters" and verify all tasks return

**Test ID: T1.3 - Drag and Drop**
- [ ] Drag a task from "Pending" to "In Progress"
- [ ] Verify task moves successfully
- [ ] Check toast notification appears
- [ ] Verify task status updates in backend
- [ ] Check real-time update (open in another tab and see change)

**Test ID: T1.4 - Task Card Details**
- [ ] Click on a task card
- [ ] Verify task detail drawer opens on right side
- [ ] Check all tabs: Details, Comments, Checklist, Materials, Alerts
- [ ] Verify task information displays correctly

**Expected Results:**
- All tasks should load within 2 seconds
- Drag-and-drop should be smooth and responsive
- Task details should open immediately
- Real-time updates should appear within 1 second

---

### ✅ Phase 2: Gantt Timeline

**Test ID: T2.1 - Load Gantt Chart**
- [ ] Click "Timeline" tab
- [ ] Verify Gantt chart loads with task list on left
- [ ] Verify timeline grid displays on right
- [ ] Check task bars appear at correct positions
- [ ] Verify today's date is highlighted (blue column)

**Test ID: T2.2 - View Mode Navigation**
- [ ] Click "Days" view mode
- [ ] Verify daily grid displays
- [ ] Click "Weeks" view mode
- [ ] Verify weekly intervals display
- [ ] Click "Months" view mode
- [ ] Verify monthly view displays

**Test ID: T2.3 - Timeline Navigation**
- [ ] Click "Previous" arrow button
- [ ] Verify timeline shifts backward
- [ ] Click "Next" arrow button
- [ ] Verify timeline shifts forward
- [ ] Click "Today" button
- [ ] Verify timeline centers on current date

**Test ID: T2.4 - Drag to Reschedule**
- [ ] Drag a task bar horizontally to new dates
- [ ] Release mouse
- [ ] Verify toast notification: "Task rescheduled successfully"
- [ ] Check task dates updated in backend
- [ ] Verify real-time update (check in another tab)

**Test ID: T2.5 - Dependencies and Critical Path**
- [ ] Verify dependency arrows connect related tasks
- [ ] Check critical path tasks highlighted in red
- [ ] Verify task progress bars display inside task bars
- [ ] Hover over task and verify tooltip shows task details

**Test ID: T2.6 - Fullscreen Mode**
- [ ] Click fullscreen button (maximize icon)
- [ ] Verify Gantt expands to full screen
- [ ] Click again to exit fullscreen
- [ ] Verify returns to normal size

**Expected Results:**
- Gantt chart should load within 3 seconds
- Drag-to-reschedule should update immediately
- Dependency arrows should be visible
- Critical path should be highlighted in red
- Timeline navigation should be smooth

---

### ✅ Phase 3: Phase Management (WBS)

**Test ID: T3.1 - Load Phase Structure**
- [ ] Click "Phases" tab
- [ ] Verify WBS tree structure displays
- [ ] Check phases with folder icons
- [ ] Verify statistics show: Tasks, Progress, Budget

**Test ID: T3.2 - Add New Phase**
- [ ] Click "Add Phase" button
- [ ] Fill in phase name: "Foundation Work"
- [ ] Fill in description: "Initial foundation tasks"
- [ ] Set start date and end date
- [ ] Set estimated budget: 500000
- [ ] Click "Create"
- [ ] Verify toast: "Phase created successfully"
- [ ] Verify new phase appears in list

**Test ID: T3.3 - Add Subphase**
- [ ] Click on a phase to expand it
- [ ] Click "+" button on phase row
- [ ] Fill in subphase name: "Excavation"
- [ ] Fill in description
- [ ] Set dates
- [ ] Click "Create"
- [ ] Verify toast: "Subphase created successfully"
- [ ] Verify subphase appears under phase

**Test ID: T3.4 - Edit Phase/Subphase**
- [ ] Click edit icon (pencil) on a phase
- [ ] Modify name or dates
- [ ] Click "Update"
- [ ] Verify toast: "Phase updated successfully"
- [ ] Verify changes reflected immediately

**Test ID: T3.5 - Delete Phase**
- [ ] Click delete icon (trash) on a phase
- [ ] Confirm deletion in alert dialog
- [ ] Verify toast: "Phase deleted"
- [ ] Verify phase removed from list

**Test ID: T3.6 - Expand/Collapse Hierarchy**
- [ ] Click chevron icon to expand phase
- [ ] Verify subphases appear
- [ ] Click chevron again to collapse
- [ ] Verify subphases hide
- [ ] Click chevron on subphase to show tasks
- [ ] Verify tasks appear with progress bars

**Test ID: T3.7 - Progress Rollup**
- [ ] Create phase with 2-3 tasks
- [ ] Update task progress in Board view
- [ ] Return to Phases tab
- [ ] Verify phase progress auto-calculates
- [ ] Check progress bar displays correctly

**Expected Results:**
- Phase tree should load within 2 seconds
- Create/update operations should complete instantly
- Progress should auto-calculate and rollup correctly
- Expand/collapse should be smooth
- Statistics should update in real-time

---

### ✅ Phase 4: Approvals Workflow

**Test ID: T4.1 - Load Approval Dashboard**
- [ ] Click "Approvals" tab
- [ ] Verify statistics cards display: Total, Overdue, High Priority, Due Today
- [ ] Check pending approvals list loads
- [ ] Verify each approval shows: Task name, Priority, Deadline, SLA status

**Test ID: T4.2 - Approve Task**
- [ ] Click "Approve" button on an approval
- [ ] Add optional comments
- [ ] Click "Confirm"
- [ ] Verify toast: "Task approved successfully!"
- [ ] Verify approval removed from pending list
- [ ] Check task status updated in Board view

**Test ID: T4.3 - Reject Task**
- [ ] Click "Reject" button on an approval
- [ ] Enter rejection reason (required)
- [ ] Click "Confirm"
- [ ] Verify toast: "Task rejected"
- [ ] Verify approval removed from list

**Test ID: T4.4 - Request Revision**
- [ ] Click "Revise" button on an approval
- [ ] Enter revision requirements (required)
- [ ] Click "Confirm"
- [ ] Verify toast: "Revision requested"
- [ ] Verify approval status updates to "REVISION_REQUIRED"

**Test ID: T4.5 - Conditional Approval**
- [ ] Click "Conditional" button on an approval
- [ ] Click "Add Condition"
- [ ] Enter condition: "Complete safety inspection"
- [ ] Add another condition: "Get material approval"
- [ ] Add optional comments
- [ ] Click "Confirm"
- [ ] Verify toast: "Conditionally approved"
- [ ] Verify approval marked with conditions

**Test ID: T4.6 - View Details**
- [ ] Click chevron icon on approval row
- [ ] Verify navigates to task details
- [ ] Verify task information displays

**Test ID: T4.7 - SLA Tracking**
- [ ] Find approval with deadline
- [ ] Check time remaining displays: "2d remaining" or "5h remaining"
- [ ] Check overdue approvals show in red: "Overdue"
- [ ] Verify urgent items highlighted with red badges

**Expected Results:**
- Dashboard should load within 2 seconds
- Approval actions should complete instantly
- Toast notifications should appear for all actions
- Removed approvals should disappear immediately
- SLA times should be accurate

---

### ✅ Phase 5: Analytics Dashboard

**Test ID: T5.1 - Load Analytics**
- [ ] Click "Analytics" tab
- [ ] Verify all metric cards load: Overall Progress, Tasks Completed, Budget Status, Issues & Risks
- [ ] Check all charts render: Progress Over Time, Status Distribution, Budget by Phase, Priority/Risk

**Test ID: T5.2 - Key Metrics**
- [ ] Verify "Overall Progress" shows percentage
- [ ] Check progress bar displays correctly
- [ ] Verify status indicator: "On Track" / "At Risk" / "Behind"
- [ ] Check "Tasks Completed" shows X/Y format
- [ ] Verify "Budget Utilization" shows percentage
- [ ] Check "Issues & Risks" shows count

**Test ID: T5.3 - Progress Over Time Chart**
- [ ] Verify line chart displays with two lines: Actual and Planned
- [ ] Check X-axis shows time periods (weeks)
- [ ] Check Y-axis shows percentage
- [ ] Hover over data point and verify tooltip shows values
- [ ] Check info box below chart shows ahead/behind status

**Test ID: T5.4 - Task Status Pie Chart**
- [ ] Verify pie chart displays with color segments
- [ ] Check labels show: Completed, In Progress, Pending, Blocked
- [ ] Hover over segment and verify tooltip
- [ ] Check legend below shows all statuses with counts

**Test ID: T5.5 - Budget vs Actual Bar Chart**
- [ ] Verify bar chart displays for each phase
- [ ] Check two bars per phase: Estimated (blue) and Actual (red)
- [ ] Verify X-axis shows phase names
- [ ] Verify Y-axis shows amount in lakhs (₹L)
- [ ] Hover over bar and verify tooltip shows value

**Test ID: T5.6 - Priority and Risk Distributions**
- [ ] Verify two donut charts display side-by-side
- [ ] Check Priority chart shows: Low, Medium, High, Urgent
- [ ] Check Risk chart shows: Low, Medium, High, Critical
- [ ] Verify color coding: Green (low), Yellow (medium), Red (high)
- [ ] Check legends below charts show counts

**Test ID: T5.7 - Time Range Filter**
- [ ] Change time range to "Last 7 Days"
- [ ] Verify charts update
- [ ] Change to "Last 90 Days"
- [ ] Verify charts update again
- [ ] Return to "Last 30 Days"

**Test ID: T5.8 - Performance Summary**
- [ ] Verify "Schedule Performance" shows: Good/Fair/Poor
- [ ] Verify "Budget Performance" shows: Good/Fair/Poor
- [ ] Verify "Risk Level" shows: Low/Medium/High
- [ ] Check all metrics have supporting text

**Expected Results:**
- All charts should render within 3 seconds
- Data should be accurate based on actual tasks
- Charts should be interactive (hover tooltips)
- Time range filter should update all charts
- Performance indicators should match actual data

---

### ✅ Phase 6: Daily Progress Reporting

**Test ID: T6.1 - Open Progress Form**
- [ ] Click "Submit Daily Report" button (top-right)
- [ ] Verify modal opens with form
- [ ] Check all sections present: Progress, Labor, Equipment, Materials, Weather, Issues
- [ ] Verify today's date pre-filled

**Test ID: T6.2 - Fill Basic Progress**
- [ ] Enter "Progress Today": 10
- [ ] Enter "Cumulative Progress": 45
- [ ] Enter work description: "Completed steel reinforcement work"
- [ ] Verify all fields accept input

**Test ID: T6.3 - Add Labor Attendance**
- [ ] Click "Add Labor"
- [ ] Select category: "Mason"
- [ ] Enter count: 5
- [ ] Enter hours worked: 8
- [ ] Verify wage rate auto-fills: 800
- [ ] Click "Add Labor" again and add "Helper": 10, 8 hours, 500
- [ ] Verify both entries appear in list

**Test ID: T6.4 - Add Equipment Usage**
- [ ] Click "Add Equipment"
- [ ] Enter equipment type: "Concrete Mixer"
- [ ] Enter hours used: 6
- [ ] Enter rate/hour: 200
- [ ] Enter operator name: "John Smith"
- [ ] Verify entry appears

**Test ID: T6.5 - Add Materials Consumed**
- [ ] Click "Add Material"
- [ ] Enter material name: "Cement"
- [ ] Enter quantity: 50
- [ ] Enter unit: "bags"
- [ ] Enter rate: 400
- [ ] Verify entry appears
- [ ] Add another material: "Steel Bars", 100, "kg", 80

**Test ID: T6.6 - Select Weather Conditions**
- [ ] Click weather icon: "Clear"
- [ ] Verify selected (blue border)
- [ ] Enter temperature: 28
- [ ] Enter working hours: 8
- [ ] Try clicking "Rainy" and verify selection changes

**Test ID: T6.7 - Add Issues**
- [ ] Click "Add Issue"
- [ ] Enter in prompt: "Delay in material delivery"
- [ ] Verify issue appears in list
- [ ] Click X to remove issue
- [ ] Verify issue removed

**Test ID: T6.8 - Submit Report**
- [ ] Review all entered data
- [ ] Click "Submit Report"
- [ ] Verify toast: "Daily report submitted successfully!"
- [ ] Verify modal closes
- [ ] Check report saved in backend

**Test ID: T6.9 - Validation**
- [ ] Try submitting with progress > 100
- [ ] Verify error: "Progress must be between 0 and 100%"
- [ ] Try submitting without work description
- [ ] Verify HTML5 validation prevents submission

**Test ID: T6.10 - Mobile Responsive**
- [ ] Resize browser to mobile width (375px)
- [ ] Verify form adapts to single column
- [ ] Check all buttons accessible
- [ ] Verify scrolling works smoothly
- [ ] Check form submits on mobile

**Expected Results:**
- Form should open instantly
- All inputs should be clearly labeled
- Dynamic sections (labor, equipment, materials) should work smoothly
- Calculations should happen automatically
- Submission should complete within 2 seconds
- Form should be mobile-friendly

---

### ✅ Phase 7: Real-time Updates

**Test ID: T7.1 - Multi-user Task Updates**
- [ ] Open application in Browser Tab 1
- [ ] Open application in Browser Tab 2 (incognito or different browser)
- [ ] Login with same user in both tabs
- [ ] Navigate to Tasks > Board in both tabs
- [ ] In Tab 1: Drag a task to different column
- [ ] In Tab 2: Verify task moves automatically (within 1 second)
- [ ] Check toast notification appears in Tab 2

**Test ID: T7.2 - Task Progress Update**
- [ ] Tab 1: Open task detail drawer
- [ ] Tab 2: Keep board view open
- [ ] Tab 1: Submit daily progress report for task
- [ ] Tab 2: Verify task card progress bar updates
- [ ] Check toast notification appears

**Test ID: T7.3 - Approval Real-time**
- [ ] Tab 1: Navigate to Approvals tab
- [ ] Tab 2: Navigate to Approvals tab
- [ ] Tab 1: Approve a task
- [ ] Tab 2: Verify approval disappears from list
- [ ] Check notification appears

**Test ID: T7.4 - Gantt Reschedule**
- [ ] Tab 1: Navigate to Timeline
- [ ] Tab 2: Navigate to Timeline
- [ ] Tab 1: Drag task to new dates
- [ ] Tab 2: Verify task bar moves to new position
- [ ] Check real-time indicator stays green

**Test ID: T7.5 - Connection Status**
- [ ] Check "Live" indicator (green dot) in Board view
- [ ] Stop backend server
- [ ] Verify indicator changes to "Offline" (gray dot)
- [ ] Restart backend server
- [ ] Verify indicator returns to "Live"
- [ ] Check auto-reconnection works

**Test ID: T7.6 - Notification Toast**
- [ ] Have another user assign you a task
- [ ] Verify toast notification appears: "You have been assigned a new task!"
- [ ] Click "View" button on toast
- [ ] Verify navigates to task details

**Expected Results:**
- Real-time updates should appear within 1-2 seconds
- No page refresh should be required
- Toast notifications should be user-friendly
- Connection indicator should be accurate
- Auto-reconnection should work seamlessly

---

### ✅ Phase 8: Task Detail Drawer

**Test ID: T8.1 - Details Tab**
- [ ] Click task card to open drawer
- [ ] Verify "Details" tab active by default
- [ ] Check all information displays: Status, Priority, Critical Path badge
- [ ] Verify progress bar shows with percentage
- [ ] Check description displays
- [ ] Verify assignee, dates, duration show correctly
- [ ] Check budget section shows: Estimated, Actual, Variance

**Test ID: T8.2 - Comments Tab**
- [ ] Click "Comments" tab
- [ ] Type comment: "This task needs review"
- [ ] Click "Post"
- [ ] Verify comment appears immediately
- [ ] Check username and timestamp display
- [ ] Verify real-time: Other users see comment instantly

**Test ID: T8.3 - Checklist Tab**
- [ ] Click "Checklist" tab
- [ ] Verify checklist items load
- [ ] Click on unchecked item
- [ ] Verify checkbox toggles to checked
- [ ] Verify item text gets strikethrough
- [ ] Click again to uncheck
- [ ] Verify real-time update

**Test ID: T8.4 - Materials Tab**
- [ ] Click "Materials" tab
- [ ] Verify materials list loads
- [ ] Check each material shows: Name, Quantity, Unit, Status
- [ ] Verify reservation status badge colors:
  - Green: RESERVED
  - Yellow: PARTIAL
  - Gray: PENDING

**Test ID: T8.5 - Alerts Tab**
- [ ] Click "Alerts" tab
- [ ] Verify active alerts display
- [ ] Check alert severity colors:
  - Red border: CRITICAL
  - Yellow border: WARNING
  - Blue border: INFO
- [ ] Click "Acknowledge" on an alert
- [ ] Verify alert marked as acknowledged

**Test ID: T8.6 - Close Drawer**
- [ ] Click X button in top-right
- [ ] Verify drawer closes smoothly
- [ ] Click task card again
- [ ] Verify drawer opens again
- [ ] Click outside drawer (backdrop)
- [ ] Verify drawer closes

**Expected Results:**
- Drawer should slide in smoothly (animated)
- All tabs should load content instantly
- Real-time updates should work in drawer
- Drawer should be scrollable for long content
- Close actions should work reliably

---

## 🐛 Known Issues to Test

### Issue 1: Task Dependencies Not Loading
**Symptom:** Dependency arrows not showing in Gantt chart
**Test:** Create dependencies via API and check if arrows appear
**Expected:** Arrows should connect related tasks

### Issue 2: Real-time Disconnection
**Symptom:** Socket connection drops after 5 minutes of inactivity
**Test:** Leave application idle for 10 minutes, then perform action
**Expected:** Auto-reconnect should happen, or manual refresh required

### Issue 3: Phase Progress Calculation
**Symptom:** Phase progress not updating when task progress changes
**Test:** Update task progress and immediately check phase progress
**Expected:** Phase progress should recalculate instantly

---

## 📊 Performance Benchmarks

### Loading Times
- Task Board: < 2 seconds
- Gantt Chart: < 3 seconds
- Phase Management: < 2 seconds
- Approvals Dashboard: < 2 seconds
- Analytics Dashboard: < 3 seconds

### Real-time Updates
- Task status change: < 1 second
- Progress update: < 1 second
- Approval action: < 1 second
- Comment posted: < 500ms

### Data Limits
- Tasks per project: Up to 500 tasks tested
- Comments per task: Up to 100 comments tested
- Checklist items: Up to 50 items tested

---

## 🔧 Troubleshooting

### Problem: Charts not rendering
**Solution:** Check if `recharts` package is installed: `npm install recharts`

### Problem: Gantt not displaying
**Solution:** Check if tasks have valid start/end dates in database

### Problem: Real-time not working
**Solution:**
1. Check backend Socket.IO server running
2. Check `VITE_API_URL` in `.env`
3. Check browser console for connection errors
4. Verify JWT token in localStorage

### Problem: Tasks not loading
**Solution:**
1. Check network tab in DevTools
2. Verify API endpoint: `GET /api/tasks`
3. Check authentication token
4. Check backend logs for errors

---

## ✅ Test Completion Checklist

After completing all tests above, verify:

- [ ] All 60+ test cases passed
- [ ] No console errors in browser DevTools
- [ ] No backend errors in server logs
- [ ] Real-time updates working across all features
- [ ] Mobile responsive design verified
- [ ] Performance benchmarks met
- [ ] All known issues documented
- [ ] Screenshots/videos captured (if needed)

---

## 📝 Bug Report Template

If you find issues during testing, report using this template:

```markdown
**Bug ID:** [Unique ID]
**Test ID:** [Which test case]
**Severity:** Critical / High / Medium / Low
**Environment:** Browser, OS, Screen size

**Steps to Reproduce:**
1. Navigate to...
2. Click on...
3. Enter...
4. Observe...

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Copy from browser console]

**Additional Notes:**
[Any other relevant information]
```

---

## 🎉 Success Criteria

Testing is considered successful when:

✅ All 8 test phases completed (60+ test cases)
✅ Core features working: Board, Gantt, Phases, Approvals, Analytics
✅ Real-time updates functioning across all features
✅ No critical or high severity bugs
✅ Performance benchmarks met
✅ Mobile responsiveness verified
✅ System ready for production deployment

---

## 📞 Support

If you encounter issues during testing:
1. Check troubleshooting section above
2. Review browser console for errors
3. Check backend logs for API errors
4. Review [FRONTEND_IMPLEMENTATION.md](./FRONTEND_IMPLEMENTATION.md)
5. Review [ENTERPRISE_TASK_MANAGEMENT_COMPLETE.md](./ENTERPRISE_TASK_MANAGEMENT_COMPLETE.md)

---

**Testing Guide Version:** 1.0
**Last Updated:** 2026-05-09
**Status:** ✅ Ready for Testing
