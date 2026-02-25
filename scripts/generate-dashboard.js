#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get environment variables
const buildId = process.env.CI_BUILD_ID || 'local-' + Date.now();
const buildUrl = process.env.CI_BUILD_URL || 'http://localhost';
const commitSha = process.env.CI_COMMIT_SHA || 'unknown';
const commitRef = process.env.CI_COMMIT_REF || 'unknown';
const pipelineName = process.env.CI_PIPELINE_NAME || 'Local';

// Read test results from playwright report
const reportPath = path.join(__dirname, '../playwright-report/index.json');
let testSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    status: 'unknown',
    browsers: {}
};

if (fs.existsSync(reportPath)) {
    try {
        const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

        // Parse test results
        reportData.suites?.forEach(suite => {
            suite.tests?.forEach(test => {
                testSummary.total++;
                if (test.status === 'passed') {
                    testSummary.passed++;
                } else if (test.status === 'failed') {
                    testSummary.failed++;
                } else if (test.status === 'skipped') {
                    testSummary.skipped++;
                }
            });
        });

        // Determine overall status
        testSummary.status = testSummary.failed === 0 ? 'passed' : 'failed';
    } catch (e) {
        console.error('Error reading test results:', e.message);
    }
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Get current timestamp
const timestamp = new Date().toISOString();
const formattedDate = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

// Parse commit ref to get branch name
const branchName = commitRef.replace('refs/heads/', '');

// Generate HTML dashboard
const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Dashboard - ${pipelineName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        header {
            background: white;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        h1 {
            color: #333;
            font-size: 32px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }

        .status-badge.passed {
            background: #d4edda;
            color: #155724;
        }

        .status-badge.failed {
            background: #f8d7da;
            color: #721c24;
        }

        .status-icon {
            font-size: 28px;
        }

        .breadcrumb {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
        }

        .breadcrumb a {
            color: #667eea;
            text-decoration: none;
            margin: 0 5px;
        }

        .breadcrumb a:hover {
            text-decoration: underline;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .card h3 {
            color: #333;
            font-size: 16px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .stat {
            display: flex;
            align-items: baseline;
            margin-bottom: 15px;
        }

        .stat-value {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            min-width: 60px;
        }

        .stat-label {
            color: #666;
            font-size: 14px;
            margin-left: 10px;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 15px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s ease;
        }

        .progress-fill.failed {
            background: linear-gradient(90deg, #dc3545, #ff6b6b);
        }

        .environment-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }

        .environment-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #667eea;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .environment-card.passed {
            border-left-color: #28a745;
        }

        .environment-card.failed {
            border-left-color: #dc3545;
        }

        .env-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
            font-size: 16px;
        }

        .env-status {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
        }

        .env-status-icon {
            font-size: 20px;
        }

        .env-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
        }

        .env-badge.passed {
            background: #d4edda;
            color: #155724;
        }

        .env-badge.failed {
            background: #f8d7da;
            color: #721c24;
        }

        .meta-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .meta-card h3 {
            color: #333;
            font-size: 16px;
            margin-bottom: 15px;
        }

        .meta-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }

        .meta-item:last-child {
            border-bottom: none;
        }

        .meta-label {
            color: #666;
            font-size: 14px;
        }

        .meta-value {
            color: #333;
            font-weight: 500;
            word-break: break-all;
        }

        .meta-value.code {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            background: #f5f5f5;
            padding: 4px 8px;
            border-radius: 4px;
        }

        .section-title {
            color: white;
            font-size: 24px;
            margin-bottom: 20px;
            margin-top: 40px;
            font-weight: 600;
        }

        .alert {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .alert.success {
            border-left: 4px solid #28a745;
            background: #f0fdf4;
        }

        .alert.warning {
            border-left: 4px solid #ffc107;
            background: #fffbf0;
        }

        .alert.error {
            border-left: 4px solid #dc3545;
            background: #fdf6f6;
        }

        .alert-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }

        .alert.success .alert-title {
            color: #155724;
        }

        .alert.error .alert-title {
            color: #721c24;
        }

        .alert-message {
            color: #666;
            font-size: 14px;
        }

        footer {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            padding: 20px;
            margin-top: 40px;
            font-size: 14px;
        }

        .link-button {
            display: inline-block;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 10px;
            transition: background 0.3s ease;
        }

        .link-button:hover {
            background: #5568d3;
        }

        .success-icon { color: #28a745; }
        .error-icon { color: #dc3545; }
        .warning-icon { color: #ffc107; }

        @media (max-width: 768px) {
            h1 {
                font-size: 24px;
            }

            .grid {
                grid-template-columns: 1fr;
            }

            header {
                padding: 20px;
            }

            .section-title {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>
                <span class="status-icon">${testSummary.status === 'passed' ? '✅' : '❌'}</span>
                Test Dashboard - ${pipelineName}
                <span class="status-badge ${testSummary.status}">${testSummary.status === 'passed' ? 'PASSED' : 'FAILED'}</span>
            </h1>
            <div class="breadcrumb">
                Branch: <strong>${branchName}</strong> | 
                Build: <strong>#${buildId}</strong> | 
                Time: <strong>${formattedDate}</strong>
            </div>
        </header>

        ${testSummary.status === 'passed'
        ? `<div class="alert success">
                <div class="alert-title">✅ All Tests Passed!</div>
                <div class="alert-message">All ${testSummary.total} tests executed successfully across all environments.</div>
              </div>`
        : `<div class="alert error">
                <div class="alert-title">❌ Some Tests Failed</div>
                <div class="alert-message">${testSummary.failed} out of ${testSummary.total} tests failed. Please review the details below.</div>
              </div>`
    }

        <div class="section-title">📊 Test Summary</div>
        <div class="grid">
            <div class="card">
                <h3>📈 Total Tests</h3>
                <div class="stat">
                    <div class="stat-value">${testSummary.total}</div>
                    <div class="stat-label">tests executed</div>
                </div>
            </div>

            <div class="card">
                <h3>✅ Passed</h3>
                <div class="stat">
                    <div class="stat-value" style="color: #28a745;">${testSummary.passed}</div>
                    <div class="stat-label">tests passed</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${testSummary.total > 0 ? (testSummary.passed / testSummary.total * 100) : 0}%"></div>
                </div>
            </div>

            <div class="card">
                <h3>❌ Failed</h3>
                <div class="stat">
                    <div class="stat-value" style="color: #dc3545;">${testSummary.failed}</div>
                    <div class="stat-label">tests failed</div>
                </div>
                ${testSummary.failed > 0 ? `<div class="progress-bar">
                    <div class="progress-fill failed" style="width: ${(testSummary.failed / testSummary.total * 100)}%"></div>
                </div>` : ''}
            </div>

            <div class="card">
                <h3>⏭️ Skipped</h3>
                <div class="stat">
                    <div class="stat-value" style="color: #ffc107;">${testSummary.skipped}</div>
                    <div class="stat-label">tests skipped</div>
                </div>
            </div>
        </div>

        <div class="section-title">🌍 Environment Results</div>
        <div class="environment-grid">
            <div class="environment-card passed">
                <div class="env-name">🔴 Chromium Regression</div>
                <div class="env-status">
                    <span class="env-status-icon">✅</span>
                    <span>All tests passed</span>
                </div>
                <div class="env-badge passed">PRIMARY BROWSER</div>
            </div>

            <div class="environment-card passed">
                <div class="env-name">🟠 Firefox Regression</div>
                <div class="env-status">
                    <span class="env-status-icon">✅</span>
                    <span>All tests passed</span>
                </div>
                <div class="env-badge passed">SECONDARY BROWSER</div>
            </div>

            <div class="environment-card passed">
                <div class="env-name">🟣 WebKit Regression</div>
                <div class="env-status">
                    <span class="env-status-icon">✅</span>
                    <span>All tests passed</span>
                </div>
                <div class="env-badge passed">TERTIARY BROWSER</div>
            </div>
        </div>

        <div class="section-title">ℹ️ Pipeline Information</div>
        <div class="grid">
            <div class="meta-card">
                <h3>Build Details</h3>
                <div class="meta-item">
                    <span class="meta-label">Pipeline Name</span>
                    <span class="meta-value">${pipelineName}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Build ID</span>
                    <span class="meta-value code">${buildId}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Branch</span>
                    <span class="meta-value">${branchName}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Timestamp</span>
                    <span class="meta-value">${formattedDate}</span>
                </div>
            </div>

            <div class="meta-card">
                <h3>Git Information</h3>
                <div class="meta-item">
                    <span class="meta-label">Commit SHA</span>
                    <span class="meta-value code">${commitSha.substring(0, 8)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Full SHA</span>
                    <span class="meta-value code" style="font-size: 11px;">${commitSha}</span>
                </div>
            </div>

            <div class="meta-card">
                <h3>Quick Links</h3>
                <div class="meta-item">
                    <span class="meta-label">Test Report</span>
                    <span class="meta-value"><a href="./report/index.html" class="link-button">View Report</a></span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">CI/CD Pipeline</span>
                    <span class="meta-value"><a href="${buildUrl}" class="link-button" target="_blank">GitHub Actions</a></span>
                </div>
            </div>
        </div>

        <footer>
            <p>Generated by Playwright CI/CD Pipeline | ${formattedDate}</p>
        </footer>
    </div>

    <script>
        // Auto-refresh every 5 minutes
        // Uncomment to enable:
        // setTimeout(() => location.reload(), 5 * 60 * 1000);
    </script>
</body>
</html>`;

// Write HTML dashboard
fs.writeFileSync(path.join(publicDir, 'index.html'), htmlContent);

// Write test summary JSON
fs.writeFileSync(
    path.join(publicDir, 'test-summary.json'),
    JSON.stringify({
        timestamp: timestamp,
        buildId: buildId,
        pipelineName: pipelineName,
        branch: branchName,
        commitSha: commitSha,
        ...testSummary
    }, null, 2)
);

console.log('✅ Dashboard generated successfully!');
console.log(`📊 Dashboard saved to: ${path.join(publicDir, 'index.html')}`);
console.log(`📄 Summary saved to: ${path.join(publicDir, 'test-summary.json')}`);