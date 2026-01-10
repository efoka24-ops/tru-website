# 🔴 FIX: Team Data Disappears on Netlify/Render

## Problem Identification

**Issue**: Team data saved in backoffice disappears after some time
**Root Cause**: Backend on Render uses ephemeral file system (`data.json`) which gets wiped on restart

### Current Architecture
```
Backoffice (Netlify) → Render Backend → data.json (FILE SYSTEM)
                                            ↓
                                     LOST ON RESTART! 🔴
```

Render restarts containers periodically → `data.json` is reset → all changes lost

## Immediate Solutions

### Solution 1: Add Render PostgreSQL (RECOMMENDED) ✅
**Cost**: FREE tier available  
**Time**: 10 minutes

**Steps**:
1. Go to https://dashboard.render.com
2. New → PostgreSQL
3. Create free instance (0.5GB storage, read-only after 90 days free)
4. Get `DATABASE_URL` connection string
5. Go to `tru-backend-o1zc` service → Environment
6. Add `DATABASE_URL` variable
7. Redeploy service

**Expected Result**: Data persists permanently ✅

### Solution 2: Modify Backend to Use PostgreSQL
Backend needs code changes to read/write from PostgreSQL instead of `data.json`

**Files to update**:
- `backend/server.js` - import and use db module
- `backend/storage.js` - replace with PostgreSQL queries
- Add migration script to import current `data.json` → PostgreSQL

### Solution 3: Use Vercel Postgres (if migrating)
**Cost**: FREE tier  
**Benefit**: Already have Vercel configured

## Status Checklist

- [ ] Render PostgreSQL instance created
- [ ] DATABASE_URL added to Render environment
- [ ] Backend service redeployed
- [ ] Test: Save team data in backoffice
- [ ] Test: Wait 15 minutes
- [ ] Verify: Data still persists

## Next Steps

1. **Option A** (Easiest): Use Render Postgres + minimal code changes
2. **Option B** (Best): Implement full Prisma ORM with PostgreSQL
3. **Option C** (Quick fix): Add cron job to backup `data.json` to GitHub

Choose your preferred option and I'll implement it.
