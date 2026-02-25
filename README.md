# Playwright Project

This is a Playwright project set up with JavaScript for end-to-end testing, with integrated CI/CD pipelines, automated dashboards, and email notifications.

> ⚠️ **NEW TO THIS PROJECT?** Start with [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) for quick next steps!

## 🎯 Find What You Need

| I want to... | Read this |
|---|---|
| **Get started quickly** | [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) |
| **Set up GitHub** | [GITHUB_SETUP_CHECKLIST.md](GITHUB_SETUP_CHECKLIST.md) |
| **Understand dashboards** | [CI_CD_DASHBOARD_OVERVIEW.md](CI_CD_DASHBOARD_OVERVIEW.md) |
| **Configure email** | [EMAIL_SETUP.md](EMAIL_SETUP.md) |
| **Detailed setup guide** | [CI_CD_SETUP.md](CI_CD_SETUP.md) |
| **See test examples** | [tests/README.md](tests/README.md) |

## 🚀 Quick Start

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Run tests in headed mode:
   ```bash
   npm run test:headed
   ```

5. Open Playwright UI:
   ```bash
   npm run test:ui
   ```

## � Documentation Hub

**Quick Links to Essential Guides:**

| Guide | Purpose |
|---|---|
| [🎯 GitHub Setup Checklist](GITHUB_SETUP_CHECKLIST.md) | **START HERE** - Step-by-step setup for GitHub Actions and Pages |
| [📊 CI/CD Dashboard Overview](CI_CD_DASHBOARD_OVERVIEW.md) | Understanding dashboards, pipelines, and architecture |
| [🔧 CI/CD Setup Guide](CI_CD_SETUP.md) | Detailed configuration and troubleshooting |
| [📧 Email Setup Guide](EMAIL_SETUP.md) | Email provider configuration (Gmail, Office365, etc.) |
| [🧪 Test Documentation](tests/README.md) | Test examples and patterns used in this project |

---

## �📊 CI/CD Pipeline

This project includes automated testing pipelines with GitHub Actions:

### Pipelines

- **Regression Tests**: Daily regression testing across Chromium, Firefox, and WebKit
- **Smoke Tests**: Quick validation tests on PR/push to main branch

### Features

✅ **Multi-browser testing** (Chromium, Firefox, WebKit)
✅ **Automated dashboards** with test results
✅ **Email notifications** on test completion
✅ **GitHub Pages** integration for report hosting
✅ **Detailed HTML reports** with failure analysis
✅ **Test history** tracking and trending

### Dashboard

Access the live test dashboard at:
```
https://[your-username].github.io/[repository-name]
```

**Dashboard includes:**
- Overall test results (Passed/Failed/Skipped)
- Per-browser results (Chromium, Firefox, WebKit)
- Build information and git details
- Links to detailed test reports
- Email status notifications

### Email Notifications

Automatic emails are sent to `carlos.mega@objectedge.com`:
- ✅ **Success Email**: When all tests pass
- ❌ **Failure Email**: When tests fail
- Includes: Dashboard link, Build ID, Commit info

## 🔧 CI/CD Setup

For complete setup instructions, see [CI_CD_SETUP.md](CI_CD_SETUP.md)

### Quick Configuration Checklist

- [ ] Enable GitHub Pages (Settings → Pages)
- [ ] Configure email secrets (Settings → Secrets and variables)
- [ ] Verify branch protection rules
- [ ] Check first workflow run

**Required Secrets:**
- `MAIL_SERVER` - SMTP server address
- `MAIL_PORT` - SMTP port (587 for TLS)
- `MAIL_USERNAME` - Email address
- `MAIL_PASSWORD` - Email password or app token
- `MAIL_FROM` - Sender email address

## Project Structure

```
.github/
├── workflows/
│   ├── regression.yml      # Daily regression tests (3 browsers)
│   └── smoke.yml           # Quick smoke tests (Chromium only)

scripts/
├── generate-dashboard.js   # Creates test dashboard
└── ...

tests/
├── pages/                  # Page Object Models
├── fixtures/               # Custom test fixtures
└── *.spec.js              # Test files

playwright.config.js        # Playwright configuration
public/                     # Generated dashboards (CI/CD)
```

## 📋 Full Documentation

**Getting Started:**
- [🎯 GitHub Setup Checklist](GITHUB_SETUP_CHECKLIST.md) - Configure GitHub for CI/CD
- [🧪 Tests Documentation](tests/README.md) - Details on test examples and patterns

**CI/CD & Dashboards:**
- [📊 Dashboard Overview](CI_CD_DASHBOARD_OVERVIEW.md) - How dashboards work
- [🔧 CI/CD Setup Guide](CI_CD_SETUP.md) - Complete CI/CD configuration
- [📧 Email Configuration](EMAIL_SETUP.md) - Email provider setup

**External Resources:**
- [🎭 Playwright Documentation](https://playwright.dev)
- [🐙 GitHub Actions Guide](https://docs.github.com/actions)
- [📄 GitHub Pages Help](https://docs.github.com/pages)

## 📈 Test Coverage

Current test categories:
- **Page Object Model**: Encapsulated page interactions
- **Custom Fixtures**: Reusable test helpers
- **Locators**: Various selection strategies
- **Data-Driven Tests**: Parameterized tests
- **User Interactions**: Keyboard, mouse, form actions
- **API Testing**: Network interception and mocking
- **Advanced Patterns**: Waiting, debugging, conditional tests

See [tests/README.md](tests/README.md) for detailed examples.

## 🎯 Running Tests Locally

```bash
# Run all tests
npm test

# Run specific browser
npm test -- --project=chromium

# Run specific test file
npm test tests/example.spec.js

# Run in headed mode (see browser)
npm run test:headed

# Run with UI inspector
npm run test:ui

# Run with debug mode
npm test -- --debug

# Generate HTML report
npm test
npx playwright show-report
```

## 🌐 GitHub Actions Integration

### Automatic Triggers

**Regression Workflow:**
- Daily at 2:00 AM UTC
- Push to `main` or `develop` branches
- Manual trigger via Actions tab

**Smoke Workflow:**
- Push/PR to `main` branch
- Manual trigger via Actions tab

### Manual Trigger

1. Go to **Actions** tab
2. Select workflow (Regression or Smoke)
3. Click **Run workflow**
4. Choose branch and click **Run workflow**

## Project Structure

- `playwright.config.js`: Playwright configuration file
- `tests/`: Directory containing test files
- `package.json`: Project dependencies and scripts

## Writing Tests

Tests are written using Playwright's test runner. Example test is in `tests/example.spec.js`.

For more information, see the [Playwright documentation](https://playwright.dev/docs/intro).