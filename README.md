# StockPilot Backend

Inventory and POS management backend built with NestJS, Prisma, and PostgreSQL.

This API powers the StockPilot retail dashboard, handling product management, sales orders, inventory tracking, supplier management, and analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | NestJS |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Authentication | JWT + Passport |
| Security | bcrypt password hashing |
| Validation | class-validator + class-transformer |
| API Docs | Swagger (OpenAPI) |
| CI | GitHub Actions |

---

## Architecture

The backend follows a modular NestJS architecture. Each module is self-contained with its own controller, service, and DTOs.

```
src/
├── common/
│   ├── decorators/        # @Public, @Roles
│   ├── filters/           # GlobalExceptionFilter
│   └── guards/            # JwtAuthGuard, RolesGuard
├── database/
│   └── prisma/            # PrismaService, PrismaModule
└── modules/
    ├── auth/              # Login, JWT strategy
    ├── users/             # User creation, role management
    ├── products/          # Product CRUD
    ├── orders/            # POS order processing
    ├── suppliers/         # Supplier management
    ├── purchase-orders/   # Restocking workflow
    └── analytics/         # Sales and inventory analytics
```

---

## Features

- Product management with SKU tracking
- Order processing (POS) with stock decrement
- Inventory tracking with stock movements
- Supplier management
- Purchase orders and restocking workflow
- Sales analytics and low stock alerts
- JWT authentication with role-based authorization (`ADMIN`, `STAFF`)
- Global validation pipeline with typed DTOs
- Structured logging across all services
- Consistent error responses via global exception filter
- Swagger API documentation at `/api`

---

## API Overview

### Authentication
| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/login` | Public |

### Products
| Method | Endpoint | Access |
|---|---|---|
| GET | `/products` | Authenticated |
| POST | `/products` | Admin |

### Orders
| Method | Endpoint | Access |
|---|---|---|
| POST | `/orders` | Authenticated |

### Suppliers
| Method | Endpoint | Access |
|---|---|---|
| GET | `/suppliers` | Authenticated |
| POST | `/suppliers` | Admin |

### Purchase Orders
| Method | Endpoint | Access |
|---|---|---|
| POST | `/purchase-orders` | Admin |
| POST | `/purchase-orders/:id/receive` | Admin |

### Users
| Method | Endpoint | Access |
|---|---|---|
| POST | `/users` | Admin |

### Analytics
| Method | Endpoint | Access |
|---|---|---|
| GET | `/analytics/sales` | Authenticated |
| GET | `/analytics/top-products` | Authenticated |
| GET | `/analytics/low-stock` | Authenticated |
| GET | `/analytics/stock-movements` | Authenticated |

---

## Running the Project

**1. Install dependencies**
```bash
npm install
```

**2. Set environment variables**

Create a `.env` file in the root:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

**3. Generate Prisma client and run migrations**
```bash
npx prisma generate
npx prisma migrate dev
```

**4. Start the development server**
```bash
npm run start:dev
```

**5. Open Swagger docs**

http://localhost:3000/api

---

## Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov
```

---

## CI/CD

GitHub Actions runs automatically on pushes to `main`, `feat/*`, `fix/*`, and `feature/*` branches.

The pipeline runs the following steps in order:

1. Install dependencies
2. Generate Prisma client
3. Build
4. Lint
5. Unit tests

---

## Future Improvements

- Pagination for product and order lists
- Refresh token support
- Docker containerization
- E2E tests

---

## Author

Built as part of a portfolio project demonstrating modern backend architecture with NestJS.
