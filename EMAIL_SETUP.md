# GitHub Secrets Configuration Examples

This document provides step-by-step instructions for configuring email notifications with various SMTP providers.

## 🔐 How to Add Secrets to GitHub

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with the values below
6. Click **Add secret**

## 📧 SMTP Provider Configurations

### 1. **Gmail** ⭐ (Recommended)

**Steps:**
1. Enable 2-Factor Authentication: https://accounts.google.com/security
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer" (or Other)
4. Copy the 16-character password

**Secrets to Add:**

| Secret | Value |
|---|---|
| `MAIL_SERVER` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | Your Gmail address (e.g., `your-email@gmail.com`) |
| `MAIL_PASSWORD` | 16-character App Password (without spaces) |
| `MAIL_FROM` | Your Gmail address (e.g., `your-email@gmail.com`) |

**Example:**
```
MAIL_PORT = 587
MAIL_PASSWORD = abcd efgh ijkl mnop (copy without spaces: abcdefghijklmnop)
```

---

### 2. **Microsoft Outlook / Office 365**

**Secrets to Add:**

| Secret | Value |
|---|---|
| `MAIL_SERVER` | `smtp.office365.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | Your Outlook email (e.g., `your-email@outlook.com`) |
| `MAIL_PASSWORD` | Your Outlook password |
| `MAIL_FROM` | Your Outlook email (e.g., `your-email@outlook.com`) |

**Note:** If you have 2FA enabled, you may need an App Password instead.

---

### 3. **Zoho Mail**

**Secrets to Add:**

| Secret | Value |
|---|---|
| `MAIL_SERVER` | `smtp.zoho.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | Your Zoho email |
| `MAIL_PASSWORD` | Your Zoho password |
| `MAIL_FROM` | Your Zoho email |

**Note:** You may need to enable "Less secure apps" in Zoho settings.

---

### 4. **SendGrid** (For High Volume)

**Steps:**
1. Sign up at https://sendgrid.com
2. Create an API key in Settings → API Keys
3. Copy the key

**Secrets to Add:**

| Secret | Value |
|---|---|
| `MAIL_SERVER` | `smtp.sendgrid.net` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | `apikey` |
| `MAIL_PASSWORD` | Your SendGrid API Key |
| `MAIL_FROM` | Your verified sender email |

---

### 5. **Amazon SES**

**Steps:**
1. Set up AWS account and verify email
2. Get SMTP credentials from AWS SES console
3. Note: May require special SMTP username/password (not AWS credentials)

**Secrets to Add:**

| Secret | Value |
|---|---|
| `MAIL_SERVER` | `email-smtp.[region].amazonaws.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | Your SES SMTP username |
| `MAIL_PASSWORD` | Your SES SMTP password |
| `MAIL_FROM` | Your verified sender email |

---

### 6. **Internal Corporate Email**

**Contact your IT department for:**
- SMTP server address
- SMTP port (usually 587, 465, or 25)
- Username and password (if required)
- Whether TLS/SSL is required

**Common patterns:**
```
MAIL_SERVER: mail.company.com
or
MAIL_SERVER: smtp.company.com
```

---

## ✅ Testing Your Configuration

### Test 1: Verify Secrets are Saved

1. Go to **Settings → Secrets and variables → Actions**
2. You should see all 5 secrets listed:
   - `MAIL_SERVER`
   - `MAIL_PORT`
   - `MAIL_USERNAME`
   - `MAIL_PASSWORD`
   - `MAIL_FROM`

### Test 2: Trigger a Workflow

1. Go to **Actions** tab
2. Select "Playwright Regression Tests" or "Smoke Tests"
3. Click **Run workflow** → **Run workflow**
4. Wait for the workflow to complete
5. Check your email for notifications

### Test 3: Check Workflow Logs

If you don't receive an email:

1. Go to **Actions** tab
2. Click on the latest workflow run
3. Scroll to **Send email on success/failure** step
4. Expand and look for error messages

---

## 🐛 Troubleshooting

### Issue: Error connecting to mail server

**Solutions:**
- Verify `MAIL_SERVER` is correct
- Verify `MAIL_PORT` is correct
- Check if firewall blocks the port
- Try port 465 instead of 587 (for SSL instead of TLS)

### Issue: Authentication failed

**Solutions:**
- Verify username and password are correct
- For Gmail: Use App Password, not your regular password
- For Office 365: Try your full email address
- Check if 2FA is enabled (may need App Password)

### Issue: Unable to send mail from 'X' address

**Solutions:**
- Make sure `MAIL_FROM` matches or is verified with your email provider
- For SendGrid: Email must be verified first
- For SES: Email must be verified in your account

### Issue: Gmail says "Less secure app blocked"

**Solutions:**
- Use App Password instead (recommended)
- Or: Go to https://myaccount.google.com/lesssecureapps and enable
- Better: Use 2FA + App Password method (most secure)

### Issue: No email received but no error in logs

**Solutions:**
- Check spam/junk folder
- Verify recipient email is correct in workflow file
- Check if email filtering rules are blocking pipeline emails
- Wait a few minutes (email delivery can be slow)

---

## 🔄 Changing the Recipient Email

By default, emails go to `carlos.mega@objectedge.com`.

To change this:

1. Edit `.github/workflows/regression.yml`
2. Find the line: `to: carlos.mega@objectedge.com`
3. Replace with your email address
4. Save and commit

Or, to make it configurable via secrets:

1. Edit both workflow files
2. Replace `to: carlos.mega@objectedge.com` with `to: ${{ secrets.NOTIFICATION_EMAIL }}`
3. Add secret `NOTIFICATION_EMAIL` with your email
4. Save and commit

---

## 📋 Verification Checklist

Before running workflows:

- [ ] All 5 secrets are added to GitHub
- [ ] Secret values are correct and have no extra spaces
- [ ] Email service is configured correctly
- [ ] For Gmail: App Password is used (not regular password)
- [ ] Recipient email address is correct
- [ ] GitHub Pages is enabled (Settings → Pages)
- [ ] Workflows files are properly formatted YAML

---

## 💡 Best Practices

1. **Never use your main password for email**
   - Use App Passwords when available
   - Makes it easier to revoke access

2. **Use TLS (port 587) when possible**
   - More secure than SSL (port 465)
   - Supports more providers

3. **Test before relying on it**
   - Run workflow manually after setup
   - Verify email is received

4. **Monitor email delivery**
   - Check spam folder regularly
   - Update secrets if email provider changes

5. **Rotate secrets periodically**
   - Update App Passwords every 6-12 months
   - Especially if you suspect compromise

---

## 📞 Provider Support Links

- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [Gmail Security Settings](https://accounts.google.com/security)
- [Outlook SMTP Settings](https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-for-outlook-com-d088b986-291d-42b8-9564-9c414e2adb96)
- [Zoho Mail Configuration](https://www.zoho.com/mail/help/pop-imap-smtp-configuration.html)
- [SendGrid SMTP Configuration](https://sendgrid.com/docs/for-developers/sending-email/integrating-with-the-smtp-api/)
- [AWS SES SMTP Configuration](https://docs.aws.amazon.com/ses/latest/dg/smtp-connect.html)

---

**Last Updated:** February 20, 2026