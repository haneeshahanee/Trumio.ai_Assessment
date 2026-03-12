# Petstore API Automation Framework

Playwright + TypeScript automation framework for the [Swagger Petstore API](https://petstore.swagger.io).  
Covers **API tests** (Pet, Store, User endpoints) and **UI smoke tests** (Swagger UI), organized in a single unified Playwright project.

---

## Project Structure

```
petstore-playwright/
├── config/
│   └── api.config.ts          # Base URL, endpoints, status constants
├── fixtures/
│   └── petstore.fixtures.ts   # Custom Playwright fixtures (pre-created pet/order)
├── tests/
│   ├── api/
│   │   ├── pet.spec.ts        # Pet endpoint tests (CRUD + findByStatus)
│   │   ├── store.spec.ts      # Store endpoint tests (orders, inventory)
│   │   ├── user.spec.ts       # User endpoint tests
│   │   └── workflows.spec.ts  # Full end-to-end lifecycle workflows
│   └── ui/
│       └── swagger-ui.spec.ts # Swagger UI smoke tests
├── utils/
│   ├── api-client.ts          # HTTP client wrapper (GET/POST/PUT/DELETE + logging)
│   ├── assertions.ts          # Reusable assertion helpers
│   ├── logger.ts              # Structured console logger
│   ├── test-data.factory.ts   # Test data factory (unique data per run)
│   └── types.ts               # TypeScript interfaces (Pet, Order, User, etc.)
├── playwright.config.ts       # Playwright configuration (projects, reporters)
├── tsconfig.json
└── package.json
```

---

##  Test Coverage

### Pet Endpoints (`/pet`)
| Scenario | Type |
|---|---|
| Add a valid pet | Positive |
| Add pet with all optional fields | Positive |
| Add minimal pet (required fields only) | Positive |
| Add pets with each valid status | Positive |
| Update pet name and status | Positive |
| Update pet category | Positive |
| Update non-existent pet | Negative |
| Find pet by existing ID | Positive |
| Find pet by non-existent ID → 404 | Negative |
| Find pet by invalid ID format → 400 | Negative |
| Delete existing pet | Positive |
| Delete non-existent pet → 404 | Negative |
| Find pets by status (available/pending) | Positive |
| Find pets by invalid status → 400 | Negative |

### Store Endpoints (`/store`)
| Scenario | Type |
|---|---|
| Place valid order | Positive |
| Place order with quantity > 1 | Positive |
| Place orders with all valid statuses | Positive |
| Place complete order | Positive |
| Place order with invalid data | Negative |
| Find order by existing ID | Positive |
| Find order by non-existent ID → 404 | Negative |
| Find order with out-of-range ID → 400 | Negative |
| Find order with ID = 0 → 400 | Negative |
| Delete existing order | Positive |
| Delete non-existent order → 404 | Negative |
| Delete order with negative ID → 400 |  Negative |
| Get store inventory map | Positive |

### User Endpoints (`/user`)
| Scenario | Type |
|---|---|
| Create valid user | Positive |
| Create users with array  Positive |
| Create users with list | Positive |
| Get user by username | Positive |
| Get non-existent user → 404 | Negative |
| Update existing user | Positive |
| Delete existing user | Positive |
| Delete non-existent user → 404 | Negative |
| Login with valid credentials | Positive |
| Login with invalid credentials → 400 | Negative |
| Logout | Positive |

### End-to-End Workflows
| Scenario |
|---|
| Full pet lifecycle: create → update → find → delete |
| Full order lifecycle: add pet → place order → find → delete |
| Inventory reflects added pet status |
| Place multiple orders and delete sequentially |

### UI Tests (Swagger UI)
| Scenario |
|---|
| Load Swagger Petstore UI |
| Display three API tag sections (pet, store, user) |
| Expand pet section and list endpoints |
| Display GET /pet/findByStatus endpoint |
| Display server URL and version info |

---

## Setup Instructions

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/petstore-playwright.git
cd petstore-playwright

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install --with-deps
```

---

## Test Execution Instructions

### Run all tests
```bash
npm test
```

### Run only API tests
```bash
npm run test:api
```

### Run only UI tests
```bash
npm run test:ui
```

### Run in headed mode (shows browser)
```bash
npm run test:headed
```

### Run a specific test file
```bash
npx playwright test tests/api/pet.spec.ts
npx playwright test tests/api/store.spec.ts
npx playwright test tests/api/user.spec.ts
npx playwright test tests/api/workflows.spec.ts
```

### Run tests matching a keyword
```bash
npx playwright test --grep "lifecycle"
npx playwright test --grep "Delete"
```

### Run with verbose output
```bash
npx playwright test --reporter=list
```

---
