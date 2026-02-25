# ✅ GitHub Setup Checklist

Follow this checklist to get your CI/CD pipelines and dashboards up and running.

## 📋 Pre-Deployment Checklist

### 1. Repository Preparation
- [ ] Push your code to GitHub
- [ ] Verify all files are committed
- [ ] Main branch is up to date
- [ ] No uncommitted changes

### 2. Enable GitHub Actions
Navigate to: **Settings → Actions → General**
- [ ] Select "Allow all actions and reusable workflows"
- [ ] Keep "Allow GitHub-created pull request workflows" checked

### 3. Enable GitHub Pages
Navigate to: **Settings → Pages**
- [ ] Under "Build and deployment" → Source
- [ ] Select "Deploy from a branch"
- [ ] Select branch: **main** (or your default branch)
- [ ] Select folder: **/ (root)**
- [ ] Click Save
- [ ] Wait 1-2 minutes for initial deployment
- [ ] Note the URL displayed: `https://username.github.io/repo-name`

### 4. Add Email Secrets
Navigate to: **Settings → Secrets and variables → Actions**

Add 5 new repository secrets:

#### For Gmail (Recommended)
- [ ] Create App Password: [Gmail Security](https://myaccount.google.com/apppasswords)
- [ ] Add Secret: `MAIL_SERVER` = `smtp.gmail.com`
- [ ] Add Secret: `MAIL_PORT` = `587`
- [ ] Add Secret: `MAIL_USERNAME` = `your-email@gmail.com`
- [ ] Add Secret: `MAIL_PASSWORD` = `[app-password-from-gmail]`
- [ ] Add Secret: `MAIL_FROM` = `your-email@gmail.com`

#### Or for Other Providers
See [EMAIL_SETUP.md](EMAIL_SETUP.md) for:
- Office 365
- Zoho Mail
- SendGrid
- AWS SES

### 5. Customize Recipient Email (Optional)
If changing from `carlos.mega@objectedge.com`:

1. Edit: `.github/workflows/regression.yml`
   - Find: `to: carlos.mega@objectedge.com`
   - Replace with: `to: your-email@example.com`

2. Edit: `.github/workflows/smoke.yml`
   - Find: `to: carlos.mega@objectedge.com`
   - Replace with: `to: your-email@example.com`

3. Commit and push changes

---

## 🚀 Run Your First Pipeline

### Option A: Automatic Trigger
```bash
# Just push any changes to main
git add .
git commit -m "Enable CI/CD pipelines"
git push origin main
```

This will:
1. Trigger the regression workflow
2. Run tests on all 3 browsers
3. Generate dashboards
4. Send email notification
5. Publish to GitHub Pages

### Option B: Manual Trigger
1. Go to GitHub: **Actions tab**
2. Click **Regression** workflow
3. Click **Run workflow**
4. Click **Run workflow** button
5. Watch it execute in real-time

---

## 📊 Verify Deployment

### Check Workflow Status
1. Go to **Actions tab**
2. Look for your workflow run
3. Verify all jobs completed successfully (green ✅)
4. Check logs if any job failed

### Check Email Received
- [ ] Check your inbox for email from the automated workflow
- [ ] Look for subject: "✅ Regression Tests Passed" or "❌ Regression Tests Failed"
- [ ] Verify email contains:
  - Total tests count
  - Pass/Fail breakdown
  - Link to dashboard
  - Build information

### Check Dashboard Deployed
1. Navigate to: `https://username.github.io/repo-name`
   - Replace `username` with your GitHub username
   - Replace `repo-name` with your repository name
2. You should see:
   - Status badge (✅ or ❌)
   - Test summary cards
   - Environment results
   - Build information
3. Click "View Full Report" to see detailed results

### Check History Dashboard
1. Navigate to: `https://username.github.io/repo-name/history.html`
2. You should see:
   - Table of all test runs
   - Most recent run at top
   - Pass rate visualizations
   - Links to detailed reports

---

## 🔧 Troubleshooting

### Workflow Not Running
**Problem:** Actions tab shows no workflow runs

**Solutions:**
1. Check Actions are enabled: Settings → Actions → General
2. Check workflow file syntax: `.github/workflows/regression.yml`
3. Try manual trigger: Actions → Workflow → Run workflow
4. Check commit is on main branch

### GitHub Pages Not Deployed
**Problem:** Dashboard URL shows 404

**Solutions:**
1. Verify Pages enabled: Settings → Pages
2. Verify source is "main" branch
3. Check workflow succeeded (Actions tab)
4. Wait 2-3 minutes for deployment
5. Clear browser cache and refresh

### Email Not Received
**Problem:** Email notification never arrives

**Solutions:**
1. Check secrets configured: Settings → Secrets
2. Verify all 5 secrets are present (MAIL_*)
3. Check email in workflow logs:
   - Go to workflow run
   - Click "Send Email" job
   - Look for "Sending email..." lines
   - Check for error messages
4. Verify email address: Check `to:` field in workflow
5. Check spam/junk folder
6. Try different email provider (see EMAIL_SETUP.md)

### Tests Failing After Deployment
**Problem:** Tests pass locally but fail in GitHub Actions

**Solutions:**
1. Check browser availability
2. Check internet connectivity in tests
3. Increase timeout values in `playwright.config.js`
4. Review test logs in Actions → Workflow Run → Job

---

## 🌍 Access Your Dashboards

After successful deployment:

| Dashboard | URL |
|---|---|
| **Latest Results** | `https://username.github.io/repo-name` |
| **Test History** | `https://username.github.io/repo-name/history.html` |
| **Detailed Report** | `https://username.github.io/repo-name/report/` |

Share these URLs with your team!

---

## 📅 Scheduled Test Runs

Your regression workflow is scheduled to run:
- **Daily:** 2 AM UTC
- **On push:** To main/develop branches
- **Manual:** Anytime via Actions tab

The smoke workflow runs:
- **On PR:** To main branch
- **Manual:** Anytime via Actions tab

---

## 🎯 Next Steps

1. ✅ Complete the checklist above
2. ✅ Trigger your first workflow run
3. ✅ Verify email received
4. ✅ Check dashboards online
5. ✅ Share dashboard URLs with team
6. ✅ Monitor for daily/PR test runs

---

## 📞 Need Help?

- [CI/CD Full Setup Guide](CI_CD_SETUP.md) - Detailed setup instructions
- [Email Configuration Guide](EMAIL_SETUP.md) - Email provider setup
- [Dashboard Overview](CI_CD_DASHBOARD_OVERVIEW.md) - Dashboard features explained
- [Playwright Docs](https://playwright.dev) - Testing framework documentation
- [GitHub Actions Docs](https://docs.github.com/actions) - Workflow documentation

---

**Document Version:** 1.0
**Last Updated:** February 20, 2026

Happy testing! 🎭🚀