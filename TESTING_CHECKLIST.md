# Testing Checklist - Construction AI Platform

## Post-Refactoring Testing Guide

### 🚀 Quick Start
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## ✅ Testing Checklist

### 1. Authentication & Navigation
- [ ] Login page loads correctly
- [ ] Can login with valid credentials (admin@construction.com)
- [ ] Session persists after page refresh
- [ ] Logout button works
- [ ] Protected routes redirect to login when not authenticated
- [ ] Sidebar navigation works for all pages

### 2. Dashboard Page
- [ ] Dashboard loads without errors
- [ ] Real project count displays
- [ ] Real task count displays
- [ ] Budget stats calculated from API
- [ ] Recent projects list populates
- [ ] AI Insights Widget loads (may show error for sample project)

### 3. Projects Page
- [ ] Projects list loads from API
- [ ] Search functionality works
- [ ] Status filter works (All, Active, Planning, Completed, On Hold)
- [ ] Create Project modal opens
- [ ] Can create new project successfully
- [ ] New project appears in list immediately
- [ ] Project progress bars display correctly
- [ ] "View Details" button works

### 4. Tasks Page
- [ ] Tasks load from API
- [ ] Kanban board organizes by status (Pending, In Progress, Delayed/Blocked, Completed)
- [ ] Task stats display correctly
- [ ] Create Task modal opens
- [ ] Project dropdown populates from API
- [ ] Can create new task successfully
- [ ] Task cards show: name, priority, project, assignee, due date

### 5. Materials Page
- [ ] Inventory tab loads materials from API
- [ ] Orders tab loads orders from API
- [ ] Low stock count calculates correctly
- [ ] Material table shows all fields
- [ ] Create Order modal opens
- [ ] Material dropdown populates
- [ ] Can create new order successfully
- [ ] Order appears in Orders tab

### 6. Reports Page
- [ ] Project selector dropdown works
- [ ] Daily Reports tab loads reports for selected project
- [ ] Site Issues tab loads issues for selected project
- [ ] Stats update based on selected project
- [ ] Create Report modal opens
- [ ] Create Issue modal opens
- [ ] Forms submit successfully

### 7. Analytics Page
- [ ] Analytics loads without errors
- [ ] Project selector works
- [ ] Time period selector works
- [ ] Budget analysis shows real projects
- [ ] Task distribution chart displays
- [ ] AI Insights load (if available)
- [ ] Export buttons present

### 8. BOQ Page
- [ ] Project selector works
- [ ] BOQ items load for selected project
- [ ] Category summary calculates correctly
- [ ] Add Item modal opens
- [ ] Can add BOQ items successfully
- [ ] Items appear in table immediately
- [ ] Total BOQ value calculates correctly
- [ ] Delete item works

### 9. Resources Page
- [ ] Workers tab loads workers from API
- [ ] Equipment tab loads equipment from API
- [ ] Stats display correctly
- [ ] Add Worker modal opens
- [ ] Add Equipment modal opens
- [ ] Can create worker successfully
- [ ] Can create equipment successfully
- [ ] Delete functionality works

### 10. Settings Page
- [ ] Settings page loads
- [ ] Profile tab shows current user data
- [ ] Can update profile fields
- [ ] Account settings tab works
- [ ] Notifications tab toggles work
- [ ] Security tab displays
- [ ] Password change form present

### 11. Error Handling
- [ ] Loading spinners show during API calls
- [ ] Toast notifications appear for success/error
- [ ] Empty states display when no data
- [ ] 404 page works for invalid routes
- [ ] Network errors handled gracefully

### 12. Responsive Design
- [ ] All pages work on mobile viewport
- [ ] Sidebar collapses properly
- [ ] Tables scroll on mobile
- [ ] Modals are mobile-friendly
- [ ] Forms adapt to small screens

## 🐛 Common Issues & Solutions

### Issue: 404 errors for API endpoints
**Solution:** Ensure backend routes exist for all endpoints. Check `backend/src/routes/` for missing route files.

### Issue: "Insufficient permissions" errors
**Solution:** Run `node backend/scripts/seed-roles.js` to assign admin role to user. Logout and login again.

### Issue: Token expired errors
**Solution:** Token refresh should happen automatically. Check `frontend/src/services/api.js` interceptor is working.

### Issue: BOQ/Resources showing "No data"
**Solution:** These endpoints may not be fully implemented yet in backend. Check backend route files.

### Issue: Login redirects in loop
**Solution:** Check browser console for errors. Verify `localStorage` has `accessToken` after login.

## 📝 Testing Notes

### Completed Tests
- Date: ___________
- Tested by: ___________
- Issues found: ___________
- Status: ⬜ Pass ⬜ Fail ⬜ Partial

### Known Limitations
1. AI Insights Widget may show 404 for sample-project-id (expected)
2. Some backend endpoints may not be fully implemented
3. Project Detail page is placeholder only
4. Photo upload in settings not implemented
5. Export PDF/Excel features are UI-only (backend pending)

## ✅ Sign-off
Once all critical tests pass:
- [ ] All pages load without errors
- [ ] CRUD operations work
- [ ] No console errors (except expected ones)
- [ ] Authentication flow works
- [ ] API integration confirmed

**Tester:** ___________
**Date:** ___________
**Status:** ⬜ APPROVED ⬜ NEEDS WORK
