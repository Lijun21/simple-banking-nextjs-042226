# System Design: Simple Banking App (Company P)

## Overview

Company P is a payment intermediary platform that enables small-to-medium businesses (customers) to pay vendors who don't accept credit cards. Customers pay Company P via credit card through a web app; Company P disburses funds to vendors via ACH, wire, or check, and charges a service fee.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                   │
│              Next.js + React + TypeScript               │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / REST
┌──────────────────────────▼──────────────────────────────┐
│                  API Gateway / BFF                       │
│              NestJS + Node.js + TypeScript               │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Auth Module │  │Payment Module│  │Payout  Module │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │User  Module │  │Vendor Module │  │Transaction    │  │
│  └─────────────┘  └──────────────┘  │Module         │  │
│                                     └───────────────┘  │
└──────┬──────────────────────────┬───────────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│ PostgreSQL  │          │     Redis        │
│  (primary   │          │  (sessions,      │
│   storage)  │          │   job queues,    │
└─────────────┘          │   rate limiting) │
                         └─────────────────┘
                                  │
                         ┌────────▼────────┐
                         │  Background Jobs │
                         │  (Bull queues)   │
                         │  - ACH processor │
                         │  - Wire sender   │
                         │  - Check issuer  │
                         │  - Email sender  │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │  Email Provider  │
                         │  (SendGrid /     │
                         │   Resend)        │
                         └─────────────────┘
```

---

## Domain Model

### Core Entities

```
Customer (User)
  └── creates ──> PaymentOrder
                      └── has one ──> CreditCardCharge (inbound)
                      └── has one ──> Disbursement (outbound to Vendor)
                      └── has one ──> Fee

Vendor
  └── receives ──> Disbursement

Transaction
  └── wraps ──> PaymentOrder (full lifecycle record)
```

---

## Database Schema (PostgreSQL)

### `users`
| Column         | Type         | Notes                        |
|----------------|--------------|------------------------------|
| id             | UUID PK      |                              |
| email          | VARCHAR      | unique, indexed              |
| password_hash  | VARCHAR      |                              |
| company_name   | VARCHAR      |                              |
| role           | ENUM         | `customer`, `admin`          |
| created_at     | TIMESTAMP    |                              |
| updated_at     | TIMESTAMP    |                              |

### `vendors`
| Column          | Type      | Notes                       |
|-----------------|-----------|-----------------------------|
| id              | UUID PK   |                             |
| user_id         | UUID FK   | owner (customer)            |
| name            | VARCHAR   |                             |
| payment_method  | ENUM      | `ach`, `wire`, `check`      |
| bank_account    | JSONB     | encrypted routing/acct info |
| address         | JSONB     | for check mailing           |
| created_at      | TIMESTAMP |                             |

### `payment_orders`
| Column          | Type      | Notes                              |
|-----------------|-----------|------------------------------------|
| id              | UUID PK   |                                    |
| user_id         | UUID FK   | customer                           |
| vendor_id       | UUID FK   |                                    |
| amount_cents    | INTEGER   | amount customer wants to send      |
| fee_cents       | INTEGER   | Company P fee                      |
| total_cents     | INTEGER   | amount_cents + fee_cents           |
| status          | ENUM      | `pending`, `processing`, `completed`, `failed` |
| memo            | TEXT      |                                    |
| created_at      | TIMESTAMP |                                    |
| updated_at      | TIMESTAMP |                                    |

### `credit_card_charges`
| Column           | Type      | Notes                           |
|------------------|-----------|---------------------------------|
| id               | UUID PK   |                                 |
| payment_order_id | UUID FK   |                                 |
| processor_ref    | VARCHAR   | Stripe/Adyen charge ID          |
| amount_cents     | INTEGER   |                                 |
| status           | ENUM      | `pending`, `succeeded`, `failed`, `refunded` |
| charged_at       | TIMESTAMP |                                 |

### `disbursements`
| Column           | Type      | Notes                           |
|------------------|-----------|---------------------------------|
| id               | UUID PK   |                                 |
| payment_order_id | UUID FK   |                                 |
| vendor_id        | UUID FK   |                                 |
| method           | ENUM      | `ach`, `wire`, `check`          |
| amount_cents     | INTEGER   |                                 |
| processor_ref    | VARCHAR   | external payout reference       |
| status           | ENUM      | `queued`, `processing`, `sent`, `failed` |
| scheduled_at     | TIMESTAMP |                                 |
| sent_at          | TIMESTAMP |                                 |

### `fees`
| Column           | Type      | Notes                           |
|------------------|-----------|---------------------------------|
| id               | UUID PK   |                                 |
| payment_order_id | UUID FK   |                                 |
| fee_type         | ENUM      | `percentage`, `flat`            |
| rate             | DECIMAL   | e.g. 0.029 for 2.9%             |
| amount_cents     | INTEGER   | computed fee amount             |

---

## API Design (NestJS REST)

### Auth
| Method | Path               | Description              |
|--------|--------------------|--------------------------|
| POST   | /auth/register     | Register new customer    |
| POST   | /auth/login        | Login, return JWT        |
| POST   | /auth/logout       | Invalidate session       |
| GET    | /auth/me           | Get current user         |

### Vendors
| Method | Path               | Description              |
|--------|--------------------|--------------------------|
| GET    | /vendors           | List customer's vendors  |
| POST   | /vendors           | Add a vendor             |
| GET    | /vendors/:id       | Get vendor detail        |
| PATCH  | /vendors/:id       | Update vendor info       |
| DELETE | /vendors/:id       | Remove vendor            |

### Payment Orders
| Method | Path                    | Description                    |
|--------|-------------------------|--------------------------------|
| POST   | /payment-orders         | Create a new payment order     |
| GET    | /payment-orders         | List all orders (paginated)    |
| GET    | /payment-orders/:id     | Get order detail               |
| POST   | /payment-orders/:id/pay | Submit credit card & charge    |

### Transactions (deprecated — use /payment-orders)
| Method | Path               | Description                    |
|--------|--------------------|--------------------------------|
| GET    | /transactions      | List all transactions (paginated, filterable) |
| GET    | /transactions/:id  | Full transaction detail        |

### Admin
| Method | Path                        | Description               |
|--------|-----------------------------|---------------------------|
| GET    | /admin/disbursements        | Queue overview            |
| PATCH  | /admin/disbursements/:id    | Update disbursement status|

---

## Frontend Design (Next.js)

### Pages & Routes

```
/                        → redirect to /dashboard or /login
/login                   → Login page
/register                → Register page
/dashboard               → Summary: recent transactions, balances
/vendors                 → Vendor list
/vendors/new             → Add vendor form
/vendors/[id]            → Vendor detail / edit
/payments/new            → Step-by-step payment flow
/payments/[id]           → Payment order detail
/transactions            → Transaction history table
/transactions/[id]       → Transaction detail
```

### Payment Flow (multi-step wizard)

```
Step 1: Select Vendor
  └── Step 2: Enter Amount + Memo
        └── Step 3: Review (show amount, fee, total)
              └── Step 4: Enter Credit Card
                    └── Step 5: Confirmation / Receipt
```

### Key Components

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (protected)/
│   │   ├── dashboard/page.tsx
│   │   ├── vendors/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── payments/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── transactions/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                     # Button, Input, Badge, Modal, etc.
│   ├── PaymentWizard/
│   ├── TransactionTable/
│   ├── VendorCard/
│   └── StatusBadge/
├── lib/
│   ├── api.ts                  # Axios/fetch client
│   ├── auth.ts                 # JWT helpers
│   └── formatters.ts           # Currency, date formatters
├── hooks/
│   ├── useAuth.ts
│   ├── useTransactions.ts
│   └── useVendors.ts
└── types/
    └── index.ts                # Shared TypeScript interfaces
```

---

## Backend Structure (NestJS)

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── guards/
├── users/
├── vendors/
├── payment-orders/
│   ├── payment-orders.module.ts
│   ├── payment-orders.controller.ts
│   ├── payment-orders.service.ts
│   └── dto/
├── disbursements/
│   ├── disbursements.module.ts
│   ├── disbursements.service.ts
│   └── processors/
│       ├── ach.processor.ts
│       ├── wire.processor.ts
│       └── check.processor.ts
├── transactions/
├── fees/
│   └── fee-calculator.service.ts
├── notifications/
│   ├── notifications.module.ts
│   ├── notifications.service.ts      # enqueues email jobs
│   ├── email.processor.ts            # BullMQ worker
│   └── templates/
│       ├── payment-complete-customer.hbs
│       └── payment-complete-vendor.hbs
├── queues/                     # Bull queue definitions
└── common/
    ├── decorators/
    ├── filters/
    └── interceptors/
```

---

## Payment Processing Flow

```
Customer submits payment order
         │
         ▼
  Validate order (amount, vendor)
         │
         ▼
  Calculate fee
  (e.g. 2.9% + $0.30 for CC processing, plus Company P margin)
         │
         ▼
  Charge credit card via processor (Stripe)
         │
    ┌────┴────┐
  Fail      Success
    │          │
  Return     Mark charge succeeded
  error      │
             ▼
         Enqueue disbursement job (Redis/Bull)
             │
             ▼
         Job runs → send ACH / wire / check
             │
    ┌────────┴────────┐
  Fail              Success
    │                  │
  Retry (3x)        Mark disbursement sent
  then alert admin  │
                    ▼
                Update payment_order status = completed
                │
                ▼
         Enqueue email notification jobs
                │
       ┌────────┴─────────┐
       ▼                  ▼
  Email → Customer    Email → Vendor
  (payment receipt)   (payment received)
  - amount sent       - amount received
  - vendor name       - payer company name
  - confirmation #    - confirmation #
  - date / memo       - payment method used
```

---

## Email Notifications

### Trigger
Emails are sent **after the disbursement is confirmed sent** (payment_order status → `completed`). Both recipient emails are enqueued as separate BullMQ jobs so a failure in one does not block the other.

### Customer Email — Payment Receipt

| Field         | Value                                      |
|---------------|--------------------------------------------|
| To            | customer email                             |
| Subject       | `Payment Confirmation #<order_id>`         |
| Body includes | Vendor name, amount sent, fee charged, total charged to card, date, memo, confirmation number |

### Vendor Email — Payment Notification

| Field         | Value                                            |
|---------------|--------------------------------------------------|
| To            | vendor email                                     |
| Subject       | `Payment Received from <customer company name>`  |
| Body includes | Payer company name, amount, payment method (ACH/wire/check), expected settlement date, memo |

### Implementation

- **Provider**: SendGrid or Resend (configurable via env var `EMAIL_PROVIDER`)
- **Queue**: dedicated BullMQ queue `email-notifications` backed by Redis
- **Retry**: up to 3 attempts with exponential backoff on delivery failure
- **Templates**: Handlebars (`.hbs`) compiled by `@nestjs-modules/mailer`
- **Vendor email source**: stored on the `vendors` table (`email` column, see schema below)

### `vendors` table addition

Add `email VARCHAR` column to the `vendors` schema to store the vendor contact email for notifications.

---

## Security Considerations

| Concern                  | Approach                                              |
|--------------------------|-------------------------------------------------------|
| Authentication           | JWT (access token 15min) + refresh token in HttpOnly cookie |
| Authorization            | NestJS Guards + role-based (`customer`, `admin`)     |
| Credit card data         | Never stored — tokenized via Stripe                  |
| Bank account info        | Encrypted at rest (AES-256) in JSONB column          |
| CSRF                     | SameSite cookies + CSRF tokens for state mutations   |
| SQL Injection            | TypeORM parameterized queries (no raw SQL)           |
| Rate limiting            | Redis-backed rate limiter on auth + payment endpoints|
| Input validation         | `class-validator` DTOs on all endpoints              |
| HTTPS                    | TLS everywhere; HSTS header                          |

---

## Fee Structure Example

| Transaction Amount | Fee Rate | Fee Amount | Customer Pays |
|--------------------|----------|------------|---------------|
| $1,000             | 2.9%     | $29.00     | $1,029.00     |
| $5,000             | 2.5%     | $125.00    | $5,125.00     |
| $10,000            | 2.0%     | $200.00    | $10,200.00    |

> Fee rates are configurable per customer tier or flat-rate plan.

---

## TDD Approach

Each module is built test-first:

1. **Unit tests** — fee calculator, status transitions, validators
2. **Integration tests** — NestJS controllers with in-memory DB
3. **E2E tests** — full payment flow using `supertest`
4. **Frontend tests** — React Testing Library for wizard steps

Test file convention:
```
*.spec.ts       → unit / integration (Jest)
*.e2e-spec.ts   → end-to-end (Jest + Supertest)
```

---

## Tech Stack Summary

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Frontend       | Next.js 14, React 18, TypeScript        |
| Styling        | Tailwind CSS                            |
| State          | TanStack Query (server state) + Zustand |
| Backend        | NestJS, Node.js, TypeScript             |
| Database       | PostgreSQL (TypeORM)                    |
| Cache / Queue  | Redis + BullMQ                          |
| Auth           | JWT + Passport.js                       |
| Payments in    | Stripe (credit card)                    |
| Payments out   | ACH/Wire/Check processor (e.g. Dwolla)  |
| Email          | SendGrid or Resend + @nestjs-modules/mailer |
| Testing        | Jest, React Testing Library, Supertest  |
| Containerize   | Docker + Docker Compose                 |
