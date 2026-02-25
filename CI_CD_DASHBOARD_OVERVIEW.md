# 🎯 CI/CD & Dashboard Overview

This document provides a quick overview of the CI/CD infrastructure, dashboards, and how everything works together.

## 🏗️ Architecture

```
GitHub Repository
    │
    ├─ Push / PR to main/develop
    │   │
    │   ├─ .github/workflows/regression.yml
    │   │   ├─ Run tests on Chromium
    │   │   ├─ Run tests on Firefox
    │   │   ├─ Run tests on WebKit
    │   │   ├─ Merge reports
    │   │   ├─ Generate dashboard
    │   │   ├─ Generate history
    │   │   ├─ Send email notification
    │   │   └─ Publish to GitHub Pages
    │   │
    │   └─ .github/workflows/smoke.yml
    │       ├─ Run quick smoke tests
    │       ├─ Generate dashboard
    │       ├─ Generate history
    │       ├─ Send email notification
    │       └─ Publish to GitHub Pages
    │
    └─ GitHub Pages (Dashboards & Reports)
        ├─ index.html (Latest results)
        ├─ history.html (All runs history)
        └─ report/ (Detailed test reports)
```

## 📊 Dashboards Explained

### 1. **Main Dashboard** (`index.html`)

Shows the latest test results with:

| Section | Content |
|---|---|
| **Alert Section** | Overall status - Passed ✅ or Failed ❌ |
| **Test Summary Cards** | Total, Passed, Failed, Skipped counts |
| **Environment Results** | Results per browser (Chromium, Firefox, WebKit) |
| **Build Information** | Build ID, Commit SHA, Branch, Timestamp |
| **Quick Links** | Links to detailed reports and GitHub Actions |

**Refresh Frequency:** Updated after each workflow run
**Data Source:** `test-summary.json` (auto-generated)

### 2. **History Dashboard** (`history.html`)

Shows all test runs in a table with:

| Column | Info |
|---|---|
| **Build ID** | Unique identifier for the test run |
| **Pipeline** | Type of run (Regression or Smoke) |
| **Status** | Overall pass/fail status |
| **Results** | Counts of Passed/Failed/Skipped |
| **Progress** | Visual representation of pass rate |
| **Branch** | Git branch that was tested |
| **Timestamp** | When the test ran |
| **Action** | Link to detailed report |

**Keeps Last:** 30 runs
**Data Source:** `history.json` (cumulative data)

### 3. **Detailed Report** (`report/index.html`)

Playwright's HTML report showing:
- Individual test cases with status
- Screenshots on failure
- Error messages and traces
- Detailed timing information
- Video recordings (if enabled)

---

## 🔄 Pipeline Flows

### Regression Pipeline

```
┌─ Chromium Tests
│  ├─ Run all test files
│  ├─ Generate blob report
│  └─ Upload artifact
│
├─ Firefox Tests
│  ├─ Run all test files
│  ├─ Generate blob report
│  └─ Upload artifact
│
├─ WebKit Tests
│  ├─ Run all test files
│  ├─ Generate blob report
│  └─ Upload artifact
│
├─ Merge Reports
│  ├─ Combine all blob reports
│  ├─ Generate HTML report
│  └─ Upload artifact
│
├─ Generate Dashboard
│  ├─ Read test results
│  ├─ Create index.html
│  ├─ Create test-summary.json
│  ├─ Generate history.html
│  └─ Upload artifacts
│
├─ Send Email
│  ├─ Check test status
│  ├─ Send success/failure email
│  └─ Include dashboard link
│
└─ Publish to GitHub Pages
   ├─ Download all artifacts
   ├─ Deploy to gh-pages
   └─ Make available at https://user.github.io/repo
```

**Duration:** ~20-30 minutes
**Triggered:** Daily at 2 AM UTC + manual
**Browsers:** 3 (Chromium, Firefox, WebKit)

### Smoke Pipeline

```
┌─ Chromium Smoke Tests
│  ├─ Run example.spec.js only
│  ├─ Generate blob report
│  └─ Upload artifact
│
├─ Merge Reports
│  ├─ Combine blob reports
│  ├─ Generate HTML report
│  └─ Upload artifact
│
├─ Generate Dashboard
│  ├─ Read test results
│  ├─ Create index.html
│  ├─ Create test-summary.json
│  ├─ Generate history.html
│  └─ Upload artifacts
│
├─ Send Email
│  ├─ Check test status
│  ├─ Send notification
│  └─ Include dashboard link
│
└─ Publish to GitHub Pages
   ├─ Download artifacts
   ├─ Deploy to gh-pages
   └─ Make available online
```

**Duration:** ~10-15 minutes
**Triggered:** On PR/push to main
**Browsers:** 1 (Chromium only)

---

## 📁 File Structure

### GitHub Actions Workflows

```
.github/
└─ workflows/
   ├─ regression.yml       # Daily regression tests (all browsers)
   └─ smoke.yml            # Quick validation (main branch only)
```

### Scripts

```
scripts/
├─ generate-dashboard.js   # Creates main dashboard + summary JSON
└─ generate-history.js     # Updates test run history
```

### Generated Artifacts

```
public/                    # Generated after each run
├─ index.html             # Latest dashboard
├─ history.html           # All runs history
├─ test-summary.json      # Latest test data (JSON)
├─ history.json           # Historical test data (JSON)
└─ report/                # Playwright HTML report
   └─ index.html          # Detailed test report
```

### Configuration

```
playwright.config.js        # Test configuration
EMAIL_SETUP.md             # Email setup guide
CI_CD_SETUP.md             # Full CI/CD setup
CI_CD_DASHBOARD_OVERVIEW.md # This file
```

---

## 🔐 Configuration Requirements

### GitHub Secrets (Required for Email)

```
MAIL_SERVER        → SMTP server (e.g., smtp.gmail.com)
MAIL_PORT          → SMTP port (usually 587)
MAIL_USERNAME      → Your email address
MAIL_PASSWORD      → Email password or app token
MAIL_FROM          → Sender email address
```

### GitHub Pages (Required for Dashboards)

```
Settings → Pages
Source: Deploy from a branch
Branch: main (or your main branch)
Folder: / (root)
```

### Branch Protection (Optional but Recommended)

```
Settings → Branches → Add branch protection rule
Require status checks to pass:
  - Regression
  - Smoke (optional)
```

---

## 📊 Data Flow

### Flow 1: Test Execution

```
Tests Run
    ↓
Generate Blob Reports (per browser)
    ↓
Merge Blob Reports
    ↓
Generate HTML Report (Playwright)
    ↓
Extract Test Summary
```

### Flow 2: Dashboard Generation

```
Read Test Summary ← Read HTML Report
    ↓
Generate index.html with:
  - Test counts
  - Status indicator
  - Progress bars
  - Build metadata
    ↓
Create test-summary.json
```

### Flow 3: History Management

```
Read Current test-summary.json
    ↓
Load existing history.json (last 30 runs)
    ↓
Add current run to history
    ↓
Generate history.html with table
    ↓
Save updated history.json
```

### Flow 4: Notifications

```
Check Test Status
    ↓
If Status = PASSED
    ├─ Prepare success email
    └─ Send to recipient
    
If Status = FAILED
    ├─ Prepare failure email
    └─ Send to recipient
```

---

## 🌐 Public URLs

Once deployed to GitHub Pages:

| URL | Content | Updated |
|---|---|---|
| `https://user.github.io/repo` | Latest dashboard | Per run |
| `https://user.github.io/repo/history.html` | All runs history | Per run |
| `https://user.github.io/repo/report/` | Detailed report | Per run |
| `https://user.github.io/repo/test-summary.json` | Latest data (JSON) | Per run |
| `https://user.github.io/repo/history.json` | History data (JSON) | Per run |

---

## 📈 Dashboard Statistics

### Test Summary Widget
- Shows overall test metrics
- Updates in real-time after each run
- Color-coded by status

### Environment Cards
- Individual results per browser
- Badge indicating test type (Primary/Secondary/Tertiary)
- Status icon (✅ or ❌)

### Historical Trends
- Track pass rate over time
- Compare pipeline performance
- Identify flaky tests
- Monitor regression introduction

---

## 🚀 Usage Examples

### Check Latest Results
1. Navigate to `https://user.github.io/repo`
2. View the dashboard
3. Check for any failures

### Review Test History
1. Go to `https://user.github.io/repo/history.html`
2. See all test runs in a table
3. Click on any run for detailed report

### Debug Failed Tests
1. Click "View Report" on dashboard
2. Scroll to failed test
3. Review error message and screenshot
4. Click on timeline for video

### Share Dashboard Link
- Copy `https://user.github.io/repo` and share with team
- Everyone has access to latest results
- No authentication required

---

## ⚙️ Customization Options

### Change Email Recipient

1. Edit `.github/workflows/regression.yml`
2. Find: `to: carlos.mega@objectedge.com`
3. Replace with your email

### Change Test Schedule

1. Edit `.github/workflows/regression.yml`
2. Find: `cron: '0 2 * * *'`
3. Adjust cron expression

### Change Deployment Frequency

1. Edit trigger in workflow file
2. Modify `on:` section
3. Add/remove triggers as needed

### Change History Retention

1. Edit `scripts/generate-history.js`
2. Find: `if (history.length > 30)`
3. Change `30` to desired number

---

## 📞 Troubleshooting Guide

### Dashboards Not Updating

**Check:**
1. Go to Actions tab
2. Verify workflow ran successfully
3. Check "Publish Dashboard" step
4. Verify GitHub Pages is enabled

### Emails Not Received

**Check:**
1. Secrets are configured correctly
2. SMTP credentials are valid
3. Check workflow logs for errors
4. Verify email address in workflow

### GitHub Pages Not Working

**Fix:**
1. Go to Settings → Pages
2. Verify source is set correctly
3. Check that build didn't fail
4. Wait a few minutes for deployment

---

## 📚 Additional Resources

- [CI/CD Setup Guide](CI_CD_SETUP.md) - Complete setup instructions
- [Email Configuration](EMAIL_SETUP.md) - Email provider examples
- [Playwright Documentation](https://playwright.dev) - Test framework docs
- [GitHub Actions Guide](https://docs.github.com/actions) - Workflow documentation
- [GitHub Pages Help](https://docs.github.com/pages) - Publishing documentation

---

**Last Updated:** February 20, 2026
**Documentation Version:** 1.0