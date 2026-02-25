# CI/CD Setup Guide - Playwright + GitHub Actions + GitHub Pages

Este guia descreve como configurar o CI/CD com GitHub Actions, relatórios no GitHub Pages e notificações por email.

## 📋 Requirements

- Repositório GitHub com Playwright Tests
- Conta GitHub
- Servidor de email (SMTP)

## 🔧 Configuration Steps

### 1. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to **Settings → Pages**
3. Set **Source** to **Deploy from a branch**
4. Select **branch: main** and **folder: / (root)**
5. Click **Save**

> Your GitHub Pages will be available at: `https://username.github.io/repository-name`

### 2. Configure GitHub Secrets for Email Notifications

Navigate to **Settings → Secrets and variables → Actions** and add the following secrets:

#### For SMTP Email Configuration:

**Add these secrets:**

| Secret Name | Value | Example |
|---|---|---|
| `MAIL_SERVER` | Your SMTP server address | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USERNAME` | Your email address | `your-email@gmail.com` |
| `MAIL_PASSWORD` | App password or API token | `xxxx xxxx xxxx xxxx` |
| `MAIL_FROM` | Sender email | `ci-pipeline@objectedge.com` |

#### Example SMTP Configurations:

**Gmail:**
```
MAIL_SERVER: smtp.gmail.com
MAIL_PORT: 587
MAIL_USERNAME: your-email@gmail.com
MAIL_PASSWORD: [App Password from Gmail Security Settings]
MAIL_FROM: your-email@gmail.com
```

> For Gmail, you need to:
> 1. Enable 2-Factor Authentication
> 2. Create an [App Password](https://myaccount.google.com/apppasswords)
> 3. Use the generated 16-character password

**Office 365 / Outlook:**
```
MAIL_SERVER: smtp.office365.com
MAIL_PORT: 587
MAIL_USERNAME: your-email@company.com
MAIL_PASSWORD: [Your password or app-specific password]
MAIL_FROM: your-email@company.com
```

**Zoho Mail:**
```
MAIL_SERVER: smtp.zoho.com
MAIL_PORT: 587
MAIL_USERNAME: your-email@zoho.com
MAIL_PASSWORD: [Your password]
MAIL_FROM: your-email@zoho.com
```

**SendGrid:**
```
MAIL_SERVER: smtp.sendgrid.net
MAIL_PORT: 587
MAIL_USERNAME: apikey
MAIL_PASSWORD: [Your SendGrid API Key]
MAIL_FROM: your-email@domain.com
```

### 3. Verify Email in Notifications

The email recipient (`carlos.mega@objectedge.com`) is hardcoded in the workflows. To change it:

1. Edit `.github/workflows/regression.yml` and `.github/workflows/smoke.yml`
2. Search for `carlos.mega@objectedge.com`
3. Replace with your desired email address

### 4. Understanding the Workflows

#### **Regression Workflow** (`.github/workflows/regression.yml`)
- **Trigger:** Daily at 2:00 AM UTC + push to main/develop
- **Environments:** Chromium, Firefox, WebKit
- **Duration:** ~15-20 minutes
- **Dashboard:** Displays all test results across browsers

#### **Smoke Workflow** (`.github/workflows/smoke.yml`)
- **Trigger:** Push/PR to main branch
- **Environments:** Chromium (quick smoke test)
- **Duration:** ~5-10 minutes
- **Dashboard:** Quick validation before release

### 5. Update Your Repository Settings

In your repository, ensure:

1. **Actions are enabled:**
   - Settings → Actions → General
   - Check "Allow all actions and reusable workflows"

2. **Branch Protection (Optional but recommended):**
   - Settings → Branches → Add branch protection rule
   - Require status checks to pass before merging
   - Select: `Regression` and `Smoke` workflows

3. **Enable GitHub Pages:**
   - Settings → Pages
   - Source: Deploy from a branch (main)
   - Folder: / (root)

## 📊 Dashboard Features

### Test Results Display:
- ✅ Total tests executed
- ✅ Passed tests count
- ❌ Failed tests count
- ⏭️ Skipped tests count
- 📈 Progress indicators

### Environment Overview:
- 🔴 Chromium Browser Results
- 🟠 Firefox Browser Results
- 🟣 WebKit Browser Results

### Available Information:
- Pipeline name and ID
- Build timestamp
- Git commit SHA
- Branch name
- Links to detailed test reports
- Quick access to GitHub Actions

## 🚀 Triggering Workflows Manually

1. Go to **Actions** tab
2. Select the workflow (Regression or Smoke)
3. Click **Run workflow** button
4. Choose branch
5. Click **Run workflow**

## 📧 Email Notifications

### When do you receive emails?

**Success Email:**
- Sent when all tests PASS ✅
- Contains: Build ID, Commit SHA, Branch, Dashboard link
- To: carlos.mega@objectedge.com

**Failure Email:**
- Sent when tests FAIL ❌
- Contains: Build ID, Commit SHA, Branch, Dashboard link
- To: carlos.mega@objectedge.com

### Email HTML Template

Emails include:
- Status indicator (✅ or ❌)
- Pipeline name
- Build information
- Commit details
- Direct link to the dashboard
- Professional formatted layout

## 📁 File Structure

```
.github/
├── workflows/
│   ├── regression.yml      # Daily regression tests
│   └── smoke.yml           # Quick validation tests
└── copilot-instructions.md

scripts/
└── generate-dashboard.js   # Dashboard generator

public/                      # Generated on each run
├── index.html             # Main dashboard
└── test-summary.json      # JSON summary
```

## 🔍 Accessing Reports

### Live Dashboard:
- **URL:** `https://username.github.io/repository-name`
- **Updated:** After each workflow run
- **Available:** 30 days

### Detailed Test Reports:
- **URL:** `https://username.github.io/repository-name/report`
- **Format:** Playwright HTML Report
- **Updated:** After each workflow run
- **Available:** 14 days

### GitHub Actions Results:
- **URL:** `https://github.com/USERNAME/REPO/actions`
- **Direct run link:** Included in emails

## 🐛 Troubleshooting

### Emails not being sent:

1. **Check secrets are configured:**
   ```bash
   Settings → Secrets and variables → Actions
   ```

2. **Verify SMTP credentials:**
   - Test email/password with your email client first
   - Check if 2FA is interfering (Gmail)

3. **Check workflow logs:**
   - Actions tab → Select workflow run
   - Scroll to "Send email" step
   - Review error messages

4. **For Gmail specifically:**
   - Enable "Less secure apps" OR
   - Use App Password (recommended)
   - Check if blocked by security

### Dashboard not displaying:

1. **Check GitHub Pages is enabled:**
   - Settings → Pages → Check source branch

2. **Verify public directory exists:**
   - Check workflow artifacts

3. **Check deployment:**
   - Actions tab → Look for "pages build and deployment" job

### Tests failing in CI but passing locally:

1. **Check browser versions:**
   ```bash
   npm list @playwright/test
   ```

2. **Verify timeouts:**
   - Edit playwright.config.js
   - Increase timeout values

3. **Check environment differences:**
   - Headless vs headed
   - Screen resolution
   - Network conditions

## 📝 Notes

- Artifacts are retained for 1-30 days based on configuration
- Logs are available for 90 days
- GitHub Pages are always public
- Workflows run with standard Ubuntu runners

## 🎯 Next Steps

1. ✅ Configure GitHub Secrets
2. ✅ Enable GitHub Pages
3. ✅ Push changes to repository
4. ✅ Verify first workflow run
5. ✅ Check email notification
6. ✅ Review dashboard

## 📞 Support

For issues with:
- **Playwright:** Check [Playwright Documentation](https://playwright.dev)
- **GitHub Actions:** Check [GitHub Actions Documentation](https://docs.github.com/actions)
- **GitHub Pages:** Check [GitHub Pages Documentation](https://docs.github.com/pages)

---

**Created:** February 2026
**Last Updated:** February 20, 2026