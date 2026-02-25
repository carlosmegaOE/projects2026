- [x] Verify that the copilot-instructions.md file in the .github directory is created. - File created successfully.

- [x] Clarify Project Requirements - Requirements are clear: Playwright project with JavaScript.

- [x] Scaffold the Project - Initialized npm, installed Playwright, created config and example tests.

- [x] Customize the Project - No customization needed for basic setup.

- [x] Install Required Extensions - No extensions needed.

- [x] Compile the Project - Tests run successfully without errors.

- [ ] Create and Run Task

- [ ] Launch the Project

- [ ] Ensure Documentation is Complete

## Execution Guidelines
PROGRESS TRACKING:
- If any tools are available to manage the above todo list, use it to track progress through this checklist.
- After completing each step, mark it complete and add a summary.
- Read current todo list status before starting each new step.

COMMUNICATION RULES:
- Avoid verbose explanations or printing full command outputs.
- If a step is skipped, state that briefly (e.g. "No extensions needed").
- Do not explain project structure unless asked.
- Keep explanations concise and focused.

DEVELOPMENT RULES:
- Use '.' as the working directory unless user specifies otherwise.
- Avoid adding media or external links unless explicitly requested.
- Use placeholders only with a note that they should be replaced.
- Use VS Code API tool only for VS Code extension projects.
- Once the project is created, it is already opened in Visual Studio Code—do not suggest commands to open this project in Visual Studio again.
- If the project setup information has additional rules, follow them strictly.

FOLDER CREATION RULES:
- Always use the current directory as the project root.
- If you are running any terminal commands, use the '.' argument to ensure that the current working directory is used ALWAYS.
- Do not create a new folder unless the user explicitly requests it besides a .vscode folder for a tasks.json file.
- If any of the scaffolding commands mention that the folder name is not correct, let the user know to create a new folder with the correct name and then reopen it again in vscode.

EXTENSION INSTALLATION RULES:
- Only install extension specified by the get_project_setup_info tool. DO NOT INSTALL any other extensions.

PROJECT CONTENT RULES:
- If the user has not specified project details, assume they want a "Hello World" project as a starting point.
- Avoid adding links of any type (URLs, files, folders, etc.) or integrations that are not explicitly required.
- Avoid generating images, videos, or any other media files unless explicitly requested.
- If you need to use any media assets as placeholders, let the user know that these are placeholders and should be replaced with the actual assets later.
- Ensure all generated components serve a clear purpose within the user's requested workflow.
- If a feature is assumed but not confirmed, prompt the user for clarification before including it.
- If you are working on a VS Code extension, use the VS Code API tool with a query to find relevant VS Code API references and samples related to that query.

TASK COMPLETION RULES:
- Your task is complete when:
  - Project is successfully scaffolded and compiled without errors
  - copilot-instructions.md file in the .github directory exists in the project
  - README.md file exists and is up to date
  - User is provided with clear instructions to debug/launch the project

Before starting a new task in the above plan, update progress in the plan.
- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.

---

## QA Testing & Governance

This repository uses **Playwright** for E2E testing. Copilot must enforce QA governance standards.

### Required QA Instructions
**Primary Reference**: `.github/instructions/playwright.instructions.md`

**Copilot MUST apply these rules when generating, reviewing, or modifying tests:**

#### ✅ REQUIRED (Always enforce)
- **Locator Priority**: Use `getByRole()` > `getByLabel()` > `getByText()` > `locator(id/class)`. **NEVER use XPath**.
- **Modern APIs**: Always use `locator.click()`, `locator.fill()`. **Never use deprecated** `page.click()`, `page.fill()`.
- **Test Naming**: Each test must have unique, descriptive name: `test('should [action] [result]')`. No parameterized names from forEach data.
- **Page Objects**: Encapsulate selectors in constructor; expose methods only. No inline selectors in tests.
- **State Cleanup**: Each test must be independent. Use `test.afterEach()` to reset state. No shared test data.
- **URLs**: No hard-coded URLs. Use `page.goto('/path')` with baseURL config. Test relative paths only.

#### ❌ FORBIDDEN (Always reject)
- `test.only` or `test.skip` without GitHub issue reference (format: `test.skip('TODO: #123', ...)`)
- XPath locators (use approved locator strategies instead)
- Deprecated API: `page.click(selector)`, `page.fill(selector)`, `page.type(selector)`
- Parameterized test names: `` test(`should verify ${item.name}`, ...) ``
- Shared test state: tests that depend on execution order
- Hard-coded URLs: `https://www.saucedemo.com/` (use baseURL + relative path)
- Hard waits: `page.waitForTimeout(5000)` (use waitForSelector, waitForFunction, waitForNavigation)

### RPI Governance Workflow
**Stages**: Research → Plan → Implement

When generating governance or test architecture, follow this sequence:
1. **Research** (READ-ONLY): Analyze patterns via `/rpi-research [scope]`
2. **Plan** (DESIGN-ONLY): Create plan via `/rpi-plan [research-file]` (requires approval)
3. **Implement** (EXECUTE): Create files via `/rpi-implement [plan-file]` (whitelisted files only)

**Stage Enforcement**:
- Research stage: Read repository files, no modifications
- Plan stage: Output planning documents only, no code generation
- Implement stage: Only create/modify files in approved whitelist

### Audit Commands
When asked to audit QA governance:
- `/qa-delivery research patterns` → analyze test patterns, identify risks
- `/qa-delivery audit selectors` → scan tests for locator strategy usage
- `/qa-delivery analyze-flakiness` → parse test results, classify failures
- `/qa-delivery validate-naming` → check test naming conventions

### Questions or Conflicts?
- Refer to `.github/instructions/playwright.instructions.md` for detailed guidance
- Refer to `docs/rpi/research/copilot-governance.md` for rationale
- Refer to `docs/rpi/plan/copilot-governance.md` for implementation plan
- Escalate ambiguities to repository maintainers (do not guess)