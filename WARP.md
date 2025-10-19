# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev                # Start development server on localhost:3000
npm run build             # Build for production
npm run start             # Start production server
npm run clean             # Clean build artifacts
npm run reinstall         # Full clean reinstall
```

### Code Quality
```bash
npm run lint              # Check for linting issues
npm run lint:fix          # Auto-fix linting issues
npm run type-check        # Run TypeScript type checking
npm run format            # Format code with Prettier
npm run format:check      # Check code formatting
npm run validate          # Run type-check + lint + test
```

### Testing
```bash
npm run test              # Run unit tests (Vitest)
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
npm run test:e2e          # Run end-to-end tests (Playwright)
npm run test:e2e:ui       # Run E2E tests with interactive UI
```

### Database Operations
```bash
npm run prisma:generate   # Generate Prisma client
npm run prisma:push       # Push schema changes to database
npm run prisma:studio     # Open Prisma Studio database GUI
npm run db:migrate        # Run database migrations
npm run db:seed           # Seed database with sample data
npm run prisma:reset      # Reset database (destructive)
npm run user:promote      # Promote user to admin role
```

### Security & Maintenance
```bash
npm run security:audit    # Run npm security audit
npm run security:scan     # Full security scan with retire.js
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Runtime**: TypeScript, React 18
- **Database**: PostgreSQL with Prisma ORM  
- **Authentication**: Iron Session with secure cookie management
- **Styling**: Tailwind CSS with dark/light theme support
- **Payments**: Stripe integration
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **AI**: OpenAI integration for recommendations and chat

### Key Architectural Patterns

#### Route Structure (Next.js App Router)
- `src/app/` - Pages and layouts using App Router
- `src/app/api/` - API endpoints for backend functionality
- `src/app/(auth)/` - Authentication-related pages (login, register)
- `src/app/admin/` - Admin dashboard and management pages
- Route groups organize pages without affecting URL structure

#### Authentication & Security
- Iron Session manages secure server-side sessions
- CSRF protection implemented in `middleware.ts` 
- Zod schemas validate all user inputs
- Rate limiting protects API endpoints
- Environment variables handle sensitive configuration

#### Database Layer
- Prisma ORM provides type-safe database access
- PostgreSQL database with comprehensive schema
- Models: User, Event, Ticket, Comment, Like, Favorite, etc.
- Seeding and admin promotion scripts in `prisma/`

#### Component Architecture
- `src/components/` - Reusable React components
- Server and client components separated appropriately
- Toast notifications system for user feedback
- Theme toggle and responsive design patterns

#### Core Libraries & Utilities
- `src/lib/` - Core business logic and configurations
  - `session.ts` - Session management utilities
  - `auth.ts` - Authentication helpers
  - `prisma.ts` - Database client configuration
  - `ai.ts` - AI/OpenAI integration
  - `stripe.ts` - Payment processing
  - `mailer.ts` - Email functionality
  - `rateLimit.ts` - API rate limiting

#### Testing Structure
- `tests/unit/` - Unit tests for utilities and components
- `tests/integration/` - Integration tests for API endpoints
- `tests/e2e/` - End-to-end tests for user workflows
- Vitest configuration with jsdom environment and coverage

### Development Patterns

#### Code Organization
- Path aliases configured: `@/` maps to `src/`
- TypeScript strict mode enabled
- ESLint + Prettier for code quality
- Husky git hooks for pre-commit validation

#### State Management
- Server Components for data fetching
- Client Components for interactivity
- React hooks in `src/hooks/` for reusable logic
- Form handling with react-hook-form + Zod validation

#### Environment Configuration
- `.env.example` shows required environment variables
- Separate configurations for development/production
- Database URL, session secrets, API keys managed securely

## Common Development Workflows

### Adding New Features
1. Create API endpoints in `src/app/api/`
2. Add database models to `prisma/schema.prisma` if needed
3. Run `npm run prisma:generate` after schema changes  
4. Create components in `src/components/`
5. Add pages in appropriate `src/app/` directories
6. Write tests in corresponding `tests/` directories

### Database Schema Changes
1. Modify `prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Run `npm run prisma:generate` to update client
4. Update seed data in `prisma/seed.mjs` if needed

### Running Single Tests
```bash
npx vitest run specific-test.test.ts    # Single unit test
npx playwright test --grep "test name"  # Single E2E test
```

## Project Context

This is a professional event management application with:
- Event creation, management, and ticketing
- User authentication and role-based access
- AI-powered recommendations and chat assistance  
- Stripe payment processing with QR code generation
- Geolocation features and responsive design
- Comprehensive security measures and testing coverage

The codebase emphasizes type safety, security, and maintainability with modern web development practices.