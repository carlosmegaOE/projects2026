#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * This script generates a historical dashboard index
 * showing all test runs over time
 */

// Mock historical data (in production, this would be stored in a database or JSON file)
const historyFile = path.join(__dirname, '../public/history.json');
let history = [];

if (fs.existsSync(historyFile)) {
    try {
        history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
    } catch (e) {
        history = [];
    }
}

// Current test summary
const summaryFile = path.join(__dirname, '../public/test-summary.json');
let currentSummary = null;

if (fs.existsSync(summaryFile)) {
    try {
        currentSummary = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'));

        // Add to history if not duplicate
        const isDuplicate = history.some(h => h.buildId === currentSummary.buildId);
        if (!isDuplicate) {
            history.unshift(currentSummary); // Add to beginning

            // Keep only last 30 runs
            if (history.length > 30) {
                history = history.slice(0, 30);
            }

            // Save updated history
            fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
        }
    } catch (e) {
        console.error('Error reading summary:', e.message);
    }
}

// Generate HTML for history dashboard
const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test History - Playwright Dashboard</title>
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
            max-width: 1200px;
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
            font-size: 28px;
            margin-bottom: 10px;
        }

        .subtitle {
            color: #666;
            font-size: 14px;
        }

        .nav-buttons {
            margin-top: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .nav-button {
            display: inline-block;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: background 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 14px;
        }

        .nav-button:hover {
            background: #5568d3;
        }

        .nav-button.secondary {
            background: #6c757d;
        }

        .nav-button.secondary:hover {
            background: #5a6268;
        }

        .table-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead {
            background: #f8f9fa;
            border-bottom: 2px solid #dee2e6;
        }

        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }

        td {
            padding: 15px;
            border-bottom: 1px solid #dee2e6;
            font-size: 14px;
        }

        tr:hover {
            background: #f8f9fa;
        }

        .status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 12px;
        }

        .status.passed {
            background: #d4edda;
            color: #155724;
        }

        .status.failed {
            background: #f8d7da;
            color: #721c24;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            background: #e9ecef;
            color: #495057;
            margin-right: 5px;
        }

        .badge.smoke {
            background: #cfe2ff;
            color: #084298;
        }

        .badge.regression {
            background: #d3f9d8;
            color: #2b8a3e;
        }

        .link {
            color: #667eea;
            text-decoration: none;
            cursor: pointer;
        }

        .link:hover {
            text-decoration: underline;
        }

        .progress-bar {
            width: 100%;
            max-width: 150px;
            height: 6px;
            background: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
        }

        .progress-fill.failed {
            background: linear-gradient(90deg, #dc3545, #ff6b6b);
        }

        .empty-state {
            text-align: center;
            padding: 40px;
            color: #666;
        }

        .empty-state h3 {
            margin-bottom: 10px;
        }

        footer {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            padding: 20px;
            margin-top: 40px;
            font-size: 14px;
        }

        @media (max-width: 768px) {
            .table-container {
                overflow-x: scroll;
            }

            table {
                min-width: 600px;
            }

            th, td {
                padding: 10px;
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Test Run History</h1>
            <p class="subtitle">Complete history of all test executions</p>
            <div class="nav-buttons">
                <a href="./index.html" class="nav-button secondary">← Back to Latest</a>
                <a href="./report/" class="nav-button secondary">View Latest Report</a>
            </div>
        </header>

        <div class="table-container">
            ${history.length > 0
        ? `
                <table>
                    <thead>
                        <tr>
                            <th>Build ID</th>
                            <th>Pipeline</th>
                            <th>Status</th>
                            <th>Results</th>
                            <th>Progress</th>
                            <th>Branch</th>
                            <th>Timestamp</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${history.map(run => {
            const passPercentage = run.total > 0 ? (run.passed / run.total * 100) : 0;
            return \`
                            <tr>
                                <td><code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 12px;">\${run.buildId.substring(0, 8)}</code></td>
                                <td><span class="badge \${run.pipelineName.toLowerCase()}">\${run.pipelineName}</span></td>
                                <td><span class="status \${run.status}">\${run.status.toUpperCase()}</span></td>
                                <td>
                                    <strong>\${run.passed}</strong> ✅ / 
                                    <strong>\${run.failed}</strong> ❌ / 
                                    <strong>\${run.skipped}</strong> ⏭️
                                </td>
                                <td>
                                    <div class="progress-bar">
                                        <div class="progress-fill \${run.failed > 0 ? 'failed' : ''}" style="width: \${passPercentage}%"></div>
                                    </div>
                                </td>
                                <td>\${run.branch}</td>
                                <td><small>\${new Date(run.timestamp).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</small></td>
                                <td><a href="./report/" class="link">Details →</a></td>
                            </tr>
                            \`;
                        }).join('')}
                    </tbody>
                </table>
                `
                : `
                <div class="empty-state">
                    <h3>No test runs yet</h3>
                    <p>Test history will appear here as workflows run</p>
                </div>
                `
    }
        </div>

        <footer>
            <p>Generated by Playwright CI/CD Pipeline | Showing last ${Math.min(history.length, 30)} runs</p>
        </footer>
    </div>
</body>
</html>`;

// Write history dashboard
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'history.html'), htmlContent);

// Save history
fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

console.log('✅ History dashboard generated!');
console.log(`📊 History saved: Last ${Math.min(history.length, 30)} runs`);
console.log(`📄 File: ${path.join(publicDir, 'history.html')}`);