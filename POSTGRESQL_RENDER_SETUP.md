# 🔧 STEP-BY-STEP: Fix Data Persistence on Netlify/Render

**Problem**: Team data saved in backoffice disappears after 15 minutes  
**Solution**: Use Render PostgreSQL instead of ephemeral file system

---

## ✅ STEP 1: Create Render PostgreSQL Database (5 minutes)

### On your browser:

1. **Open**: https://dashboard.render.com
2. **Click**: "New +" button (top-right)
3. **Select**: "PostgreSQL"
4. **Fill form**:
   ```
   Name:            tru-database
   Database:        tru_data
   User:            tru_user
   Password:        [auto-generated, copy it!]
   Region:          Frankfurt (eu-central-1)
   Version:         PostgreSQL 15
   Plan:            Free
   ```
5. **Click**: "Create Database"
6. **Wait**: 2-3 minutes (watch the "Creating..." status)
7. **When Ready**: You'll see "Available" status
8. **⭐ COPY THE CONNECTION STRING**:
   - Look for "External Database URL"
   - Starts with `postgresql://`
   - Save it somewhere safe!

---

## ✅ STEP 2: Add DATABASE_URL to Render Backend (2 minutes)

### Still on Render Dashboard:

1. **Click**: Your service "tru-backend-o1zc"
2. **Go to**: Settings (left sidebar)
3. **Click**: "Environment"
4. **Add Variable**:
   ```
   Key:   DATABASE_URL
   Value: [paste the PostgreSQL URL from Step 1]
   ```
5. **Click**: "Save Changes"
6. **Wait**: Service auto-redeploys (watch the "Deploying..." status)
7. **When green**: "Live" = Success! ✅

---

## ✅ STEP 3: Migrate Your Data (LOCAL COMPUTER - 2 minutes)

### Open Terminal in your project:

```bash
cd "C:\Users\EMMANUEL\Documents\site tru\backend"

# Run migration script
node migrate-to-postgres.js
```

**Expected output**:
```
🚀 Starting migration from data.json to PostgreSQL...

📦 Found data.json with:
   - 5 team members
   - 3 testimonials
   - 2 services
   - ...

📝 Migrating team members...
  ✓ John Doe
  ✓ Jane Smith
  ...

✅ Migration completed successfully!
✅ All data imported into PostgreSQL
```

**If you see errors**: 
- Check DATABASE_URL is in `.env` file correctly
- Make sure Render PostgreSQL shows "Available"

---

## ✅ STEP 4: Test Everything Works (5 minutes)

### Test 1: Verify data was imported
```bash
# In terminal, any folder:
curl https://tru-backend-o1zc.onrender.com/api/team
# Should show your team members
```

### Test 2: Test backoffice
1. Open: https://bo.trugroup.cm
2. Add a NEW team member (test data)
3. Save it
4. Check API: https://tru-backend-o1zc.onrender.com/api/team
5. Your new member should appear ✅

### Test 3: The Critical Test (wait 15 minutes!)
1. **Note the time**: e.g., 2:30 PM
2. **Wait**: Until 2:45 PM (15 minutes)
3. **Refresh**: https://tru-backend-o1zc.onrender.com/api/team
4. **Check**: Is your test team member still there?
   - ✅ YES = **FIXED!** Data persists!
   - ❌ NO = Problem still exists

---

## 📊 Expected Before/After

### BEFORE (❌ Data Loss)
```
Add team in backoffice
         ↓
Wait 15 minutes
         ↓
Render restarts container
         ↓
data.json (in memory) = LOST! ❌
         ↓
Team member GONE!
```

### AFTER (✅ Data Persists)
```
Add team in backoffice
         ↓
Backend saves to PostgreSQL
         ↓
Wait 15 minutes
         ↓
Render restarts container
         ↓
PostgreSQL database intact ✅
         ↓
App reads from PostgreSQL
         ↓
Team member SAVED! ✅
```

---

## 🚨 If Something Goes Wrong

### Error: "Can't connect to DATABASE_URL"
1. Go to Render Dashboard
2. Check PostgreSQL status = "Available"
3. Check DATABASE_URL is correct (no typos)
4. Click "Manual Deploy" on backend service

### Error: "Migration failed"
1. Check: Is Render PostgreSQL showing as "Available"?
2. Try again: `node migrate-to-postgres.js`
3. Check error message for which table failed

### Data isn't showing in backoffice after migration
1. Restart the backend service:
   - Render Dashboard → tru-backend-o1zc → Manual Deploy
2. Clear browser cache: Ctrl+Shift+Delete
3. Reload: https://bo.trugroup.cm

---

## ✨ Success Checklist

- [ ] Render PostgreSQL database created
- [ ] DATABASE_URL added to Render backend environment
- [ ] Backend service redeployed (shows "Live" in green)
- [ ] Migration script ran successfully
- [ ] Team data appears in API: `/api/team`
- [ ] Added test team member in backoffice
- [ ] Test member appears in API
- [ ] Waited 15 minutes
- [ ] Test member still in API ✅

**If all checked**: Your data persistence is FIXED! 🎉

---

## Next Time You Deploy

After this setup:
- Any changes in backoffice save to PostgreSQL
- Data persists through container restarts
- No more data loss! ✅
- Can deploy backend anytime without data loss

---

**Need help?** Check:
- [FIX_TEAM_DATA_PERSISTENCE.md](../FIX_TEAM_DATA_PERSISTENCE.md)
- [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)
