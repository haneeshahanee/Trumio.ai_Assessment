# OrangeHRM UI Automation Framework

A comprehensive end-to-end UI automation framework for [OrangeHRM](https://opensource-demo.orangehrmlive.com) built with **Playwright** and **TypeScript**, following the **Page Object Model (POM)** design pattern.

---

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Test Execution Instructions](#test-execution-instructions)
- [Test Scenarios Covered](#test-scenarios-covered)
- [Page Object Model](#page-object-model)
- [Test Reports](#test-reports)
- [Logs](#logs)
- [CI/CD Integration](#cicd-integration)

---

## ✨ Features

- ✅ **Playwright** with **TypeScript** for robust cross-browser testing
- ✅ **Page Object Model (POM)** for clean, maintainable test architecture
- ✅ **Test Data Management** with dynamic data generation
- ✅ **Positive & Negative test scenarios** for complete coverage
- ✅ **Custom Logger** with colored console output and file logging
- ✅ **Multiple report formats**: HTML, JSON, JUnit XML
- ✅ **Screenshots & Videos** on test failure
- ✅ **Trace viewer** support for debugging
- ✅ **Environment configuration** via `.env` file
- ✅ **Error handling** with retry mechanisms

---

## 📁 Project Structure

```
orangehrm-automation/
├── src/
│   ├── config/
│   │   └── environment.ts        # Environment variables & constants
│   ├── data/
│   │   └── testData.ts           # Test data: credentials, expected messages
│   ├── pages/                    # Page Object Model classes
│   │   ├── BasePage.ts           # Base class with shared utilities
│   │   ├── LoginPage.ts          # Login page interactions
│   │   ├── DashboardPage.ts      # Dashboard page interactions
│   │   ├── EmployeeListPage.ts   # PIM Employee list page
│   │   ├── AddEmployeePage.ts    # Add/Create employee page
│   │   └── EmployeePersonalDetailsPage.ts  # Employee details editing
│   ├── tests/
│   │   ├── login.spec.ts         # 12 login/logout test cases
│   │   └── employee.spec.ts      # 14 employee management test cases
│   └── utils/
│       ├── logger.ts             # Custom logger (console + file)
│       └── helpers.ts            # Helper utilities
├── reports/                      # Generated test reports (auto-created)
├── logs/                         # Test execution logs (auto-created)
├── .env                          # Environment variables (not committed)
├── .env.example                  # Environment template
├── playwright.config.ts          # Playwright configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Prerequisites

| Tool       | Version  | Install                        |
|------------|----------|-------------------------------|
| Node.js    | ≥ 18.x   | https://nodejs.org             |
| npm        | ≥ 9.x    | Included with Node.js          |
| Git        | Any      | https://git-scm.com            |

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/orangehrm-automation.git
cd orangehrm-automation
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install --with-deps chromium
```

> To install all browsers: `npx playwright install --with-deps`

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

The default `.env` values work with the public demo site:

```env
BASE_URL=https://opensource-demo.orangehrmlive.com
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=admin123
```

---

## ⚙️ Configuration

The main configuration file is `playwright.config.ts`:

| Setting              | Value / Description                              |
|----------------------|--------------------------------------------------|
| `testDir`            | `./src/tests`                                    |
| `timeout`            | 60 seconds per test                              |
| `retries`            | 0 (local), 1 (CI)                               |
| `workers`            | 1 (sequential — shared demo site)               |
| `headless`           | `true` (set `false` for headed mode)             |
| `screenshot`         | Captured on failure                              |
| `video`              | Retained on failure                              |
| `trace`              | Retained on failure                              |
| `reporter`           | list, html, json, junit                          |

---

## 🧪 Test Execution Instructions

### Run All Tests

```bash
npm test
# or
npx playwright test
```

### Run All Tests with HTML Report

```bash
npm run test:all
```

### Run Only Login Tests

```bash
npm run test:login
# or
npx playwright test src/tests/login.spec.ts
```

### Run Only Employee Tests

```bash
npm run test:employee
# or
npx playwright test src/tests/employee.spec.ts
```

### Run in Headed (Visible Browser) Mode

```bash
npm run test:headed
# or
npx playwright test --headed
```

### Run in Debug Mode

```bash
npm run test:debug
# or
npx playwright test --debug
```

### Run a Specific Test by Title

```bash
npx playwright test --grep "TC-L02"
```

### Run Tests with Trace Viewer

```bash
npx playwright test --trace on
npx playwright show-trace reports/test-artifacts/trace.zip
```

### View HTML Report

```bash
npm run test:report
# or
npx playwright show-report reports/html-report
```

---

## 📋 Test Scenarios Covered

### Login & Logout (`login.spec.ts`) — 12 Test Cases

| Test ID | Scenario | Type |
|---------|----------|------|
| TC-L01 | Login page displays all required UI elements | Positive |
| TC-L02 | Successful login with valid credentials | Positive |
| TC-L03 | Logged-in user name is displayed on dashboard | Positive |
| TC-L04 | Successful logout redirects to login page | Positive |
| TC-L05 | Accessing protected URL after logout redirects to login | Positive |
| TC-L06 | Error shown for invalid password | Negative |
| TC-L07 | Error shown for invalid username | Negative |
| TC-L08 | Validation error for empty username field | Negative |
| TC-L09 | Validation error for empty password field | Negative |
| TC-L10 | Validation errors when both fields are empty | Negative |
| TC-L11 | Forgot Password link navigates correctly | Positive |
| TC-L12 | Password field masks input (type="password") | Positive |

---

### Employee Management (`employee.spec.ts`) — 14 Test Cases

| Test ID | Scenario | Type |
|---------|----------|------|
| TC-E01 | Create a new employee via PIM module | Positive |
| TC-E02 | Find employee by Employee ID using search | Positive |
| TC-E03 | Find employee by Employee Name using search | Positive |
| TC-E04 | No records for non-existent employee ID | Negative |
| TC-E05 | Reset button clears all search filters | Positive |
| TC-E06 | Save and verify employee personal details | Positive |
| TC-E07 | Personal details persist after save and page reload | Positive |
| TC-E08 | Edit employee details and verify update | Positive |
| TC-E09 | Validation errors when saving without required fields | Negative |
| TC-E10 | Delete employee and verify removal from list | Positive |
| TC-E11 | Employee list page loads with all required elements | Positive |
| TC-E12 | Add Employee form has all required fields | Positive |
| TC-E13 | Cancel on Add Employee returns to employee list | Positive |
| TC-E14 | PIM module navigation from dashboard works | Positive |

---

## 🏗️ Page Object Model

Each page has its own class extending `BasePage`:

```
BasePage (shared utilities)
├── LoginPage
├── DashboardPage
├── EmployeeListPage
├── AddEmployeePage
└── EmployeePersonalDetailsPage
```

**BasePage** provides:
- `navigateTo(path)` — navigate with networkidle wait
- `clickElement(locator, description)` — safe click with logging
- `fillInput(locator, value, description)` — clear + fill with logging
- `getElementText(locator)` — trimmed text content
- `isElementVisible(locator, timeout)` — boolean visibility check
- `waitForToast(expectedText?)` — toast notification handling
- `selectDropdownOption(locator, text)` — OrangeHRM dropdown helper
- `waitForSpinnerToDisappear()` — loading spinner handling

---

## 📊 Test Reports

After running tests, reports are generated in the `reports/` directory:

| Report | Path | Description |
|--------|------|-------------|
| **HTML** | `reports/html-report/index.html` | Interactive visual report |
| **JSON** | `reports/test-results.json` | Machine-readable results |
| **JUnit XML** | `reports/junit-results.xml` | CI/CD compatible format |
| **Artifacts** | `reports/test-artifacts/` | Screenshots, videos, traces |

Open the HTML report:
```bash
npx playwright show-report reports/html-report
```

---

## 📝 Logs

Logs are written to timestamped files in the `logs/` directory:

```
logs/test-run-2024-01-15T10-30-00.log
```

Log levels:
- **STEP** (green) — Test action steps
- **INFO** (cyan) — General information
- **WARN** (yellow) — Warnings and retries
- **ERROR** (red) — Failures and errors
- **DEBUG** (gray) — Debug information

---

## 🔄 CI/CD Integration

### GitHub Actions

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: Run tests
        run: npm test
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          ADMIN_USERNAME: ${{ secrets.ADMIN_USERNAME }}
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
      - name: Upload HTML Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: reports/html-report/
          retention-days: 30
      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-artifacts
          path: reports/test-artifacts/
          retention-days: 7
```

---

## 🛠️ Troubleshooting

**Tests failing due to network issues:**
- The demo site at `opensource-demo.orangehrmlive.com` can be slow or reset. Run with `--retries=2` as a fallback.

**Browser not found:**
```bash
npx playwright install chromium
```

**Timeout errors:**
- Increase `timeout` in `playwright.config.ts` if on a slow connection.

**Employee test data conflicts:**
- Employee tests generate unique IDs based on timestamps to avoid conflicts.
