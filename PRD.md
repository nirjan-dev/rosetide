# Period Tracker App - Product Requirements Document

## 1. Product Overview

### Vision
Create a fast, intuitive, and offline-capable period tracking app that helps young women understand their reproductive health while providing a delightful user experience across devices.

### Target Users
- **Primary:** Teenagers and young adults (13-25 years)
- **Experience Level:** Mostly beginners to period tracking
- **Current Solutions:** Basic health watch tracking, spreadsheets, or no tracking
- **Primary Use Cases:** General health awareness, avoiding pregnancy, reproductive health education

### Core Value Proposition
- Lightning-fast logging experience (< 30 seconds)
- Works seamlessly offline with poor internet connectivity
- Simple, beautiful interface designed for young women
- Basic predictions and health insights
- Educational resources for reproductive health

## 2. Technical Architecture

### Tech Stack
- **Frontend:** Vite + React SPA + TypeScript
- **Backend:** Hono + TypeScript with Hono RPC
- **Database:** Turso (serverless SQLite)
- **ORM:** Drizzle ORM
- **Styling:** Tailwind CSS + DaisyUI (Valentine theme)
- **Components:** Radix UI (headless components for complex logic)
- **Monorepo:** pnpm workspaces
- **Data Fetching:** React Query (TanStack Query) + Hono RPC client
- **Validation:** Zod schemas (shared between frontend and backend)
- **Architecture:** Monorepo with shared types and validation schemas
- **Authentication:** Better Auth with Google OAuth
- **Logging:** Winston (backend) + Console overrides (frontend)
- **Linting:** ESLint + ESLint Stylistic (formatting and linting)
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel/Cloudflare (frontend), Fly.io/Railway (backend)
- **PWA:** Service Worker + Web App Manifest

### Data Strategy
- **Approach:** Cloud-first with aggressive local caching via React Query
- **Type Safety:** End-to-end type safety with Hono RPC + Zod validation
- **Offline Strategy:** React Query cache + service worker for offline reads
- **Cross-device:** Full sync across devices via React Query synchronization
- **Performance Target:** < 1 second load times with optimistic updates

### Data Model (Drizzle Schema + Zod Validation)
- use drizzle schema with Zod validation and make sure the types flow through the app using hono RPC
- use tanstack query hooks for fetching data and making mutations and managing cache

## 3. MVP Features
### 3.1 Essential Features (Phase 1)
1. **User Authentication**
   - Google OAuth login
   - Basic profile setup
   - Account deletion capability

2. **Period Tracking**
   - Start/stop period logging
   - Flow intensity tracking (1-5 scale)
   - Calendar view of cycles

3. **Symptom Logging**
   - Quick 1-5 scale for: Flow, Mood, Pain, Energy, Bloating, Cravings
   - Optional notes field
   - Medication tracking (free text)

4. **Basic Predictions**
   - Next period start date
   - Cycle length averages
   - Simple confidence indicators

5. **Offline Capability**
   - Service worker for offline functionality
   - Local data caching
   - Sync queue for when online

6. **Static FAQ**
   - Common period questions
   - Health education content
   - Search functionality

### 3.2 Nice-to-Have Features (Phase 2)
1. **Partner Sharing**
   - Read-only access for partners
   - Shareable cycle calendar
   - Privacy controls

2. **Enhanced Analytics**
   - Cycle pattern analysis
   - Symptom correlation insights
   - Historical comparisons

3. **Fertility Tracking**
   - Ovulation predictions
   - Fertile window indicators
   - Conception probability

## 4. User Experience Requirements

### Design Principles
- **Minimalist:** Clean, uncluttered interface using DaisyUI Valentine theme
- **Fast:** Quick interactions, instant feedback with Tailwind utilities
- **Empathetic:** Supportive tone, educational, warm pink/red color palette
- **Accessible:** Radix UI primitives ensure proper accessibility
- **Modern:** Contemporary design trends for young women, cohesive Valentine theme

### Key User Flows

#### Quick Logging Flow
1. Open app → Auto-loads to today's view
2. One-tap period start/stop
3. Optional: Quick symptom sliders (< 15 seconds)
4. Auto-save with visual confirmation

#### Analysis Flow
1. Navigate to calendar view
2. See cycle history and patterns
3. View predictions for next period
4. Access detailed cycle insights

### Performance Requirements
- **Initial Load:** < 1 second
- **Offline Functionality:** Full logging capability
- **Sync Time:** < 3 seconds when back online
- **PWA Score:** > 90 on Lighthouse

## 5. Development Roadmap

### Priority 1: Core Foundation
**Essential infrastructure and basic functionality**

**Project Setup & Infrastructure**
- [ ] Initialize pnpm workspace monorepo (packages: frontend, backend, shared)
- [ ] Set up TypeScript configurations across all packages
- [ ] Configure Tailwind CSS + DaisyUI (Valentine theme) in frontend
- [ ] Set up development environment with hot reload and workspace linking
- [ ] Configure ESLint + ESLint Stylistic for all packages
- [ ] Set up GitHub Actions workflow for CI/CD
- [ ] Configure Winston logger for backend with structured logging
- [ ] Set up console logging overrides for frontend development
- [ ] Create shared Zod validation schemas package

**Database & Authentication**
- [ ] Set up Turso database with Drizzle ORM and migrations
- [ ] Create Zod schemas for all data models in shared package
- [ ] Implement Better Auth with Google OAuth and validation
- [ ] Set up Hono RPC routes with zValidator middleware
- [ ] Create user management APIs with comprehensive error handling
- [ ] Configure middleware (auth, CORS, request logging, Zod validation)
- [ ] Environment configuration and secrets management across workspaces

**Core Period Tracking**
- [ ] Design Drizzle schemas with Zod validation integration
- [ ] Create period start/stop functionality with DaisyUI components
- [ ] Set up React Query client with Hono RPC integration
- [ ] Build calendar view component using Radix UI Calendar
- [ ] Implement cycle calculation logic with Zod input validation
- [ ] Create type-safe CRUD operations using Hono RPC + React Query
- [ ] Add comprehensive error handling and loading states

### Priority 2: User Experience Essentials
**Core features users need for basic functionality**

**Symptom Logging Interface**
- [ ] Create symptom logging interface with DaisyUI sliders and Zod validation
- [ ] Implement 1-5 scale components with optimistic updates via React Query
- [ ] Build daily log view with Valentine theme colors and error boundaries
- [ ] Connect symptom data to Hono RPC endpoints with type safety
- [ ] Add notes and medication fields using DaisyUI forms + Zod schemas
- [ ] Implement quick-entry shortcuts with keyboard navigation

**Predictions & Basic Analytics**
- [ ] Implement cycle prediction algorithm with Zod input/output validation
- [ ] Calculate average cycle length with confidence intervals and error handling
- [ ] Build prediction display components using DaisyUI cards and React Query
- [ ] Add confidence indicators with visual feedback and loading states
- [ ] Create basic analytics dashboard with Tailwind grid and type-safe data
- [ ] Implement error handling for insufficient data scenarios with user guidance

**PWA & Offline Capability**
- [ ] Implement service worker with comprehensive caching strategy
- [ ] Add web app manifest with Valentine theme assets and proper icons
- [ ] Configure React Query for offline-first data management
- [ ] Build offline indicators using DaisyUI alerts and network status
- [ ] Test offline scenarios and implement retry logic with exponential backoff
- [ ] Add conflict resolution for offline/online data synchronization

### Priority 3: Polish & Enhancement
**Features that improve the experience but aren't essential for launch**

**UI/UX Polish & Accessibility**
- [ ] Implement design system with DaisyUI Valentine theme
- [ ] Responsive design optimization using Tailwind breakpoints
- [ ] Accessibility improvements with Radix UI primitives
- [ ] Loading states and error handling with DaisyUI components
- [ ] User feedback animations and micro-interactions
- [ ] Focus management and keyboard navigation
- [ ] Screen reader testing and ARIA labels

**Content & Education**
- [ ] Create static FAQ content with search functionality
- [ ] Implement educational content with DaisyUI collapse components
- [ ] Help and support pages using Valentine theme
- [ ] Onboarding flow with DaisyUI steps component
- [ ] Error messages with helpful guidance
- [ ] Success states and positive reinforcement

### Priority 4: Advanced Features
**Nice-to-have features for enhanced functionality**

**Partner Sharing (Optional)**
- [ ] Partner invitation system with email integration
- [ ] Read-only sharing interface using DaisyUI badges
- [ ] Privacy controls with Radix UI switches
- [ ] Shared calendar view with restricted permissions
- [ ] Notification preferences using DaisyUI toggles

**Advanced Analytics & Insights**
- [ ] Enhanced analytics with pattern recognition
- [ ] Fertility window calculations and visualizations
- [ ] Cycle pattern recognition with data analysis
- [ ] Historical comparisons using DaisyUI timeline
- [ ] Data export functionality (CSV/JSON)
- [ ] Advanced settings with organized DaisyUI tabs

### Priority 5: Production & Deployment
**Getting the app ready for real users**

**Testing & Quality Assurance**
- [ ] Unit tests for shared Zod schemas and utility functions
- [ ] Integration tests for Hono RPC endpoints with proper mocking
- [ ] End-to-end testing for critical user flows using Playwright
- [ ] React Query testing with MSW for API mocking
- [ ] Performance optimization and bundle analysis across workspaces
- [ ] Lighthouse score improvements with PWA compliance (target > 90)
- [ ] ESLint Stylistic compliance and code quality checks

**Deployment & Monitoring**
- [ ] GitHub Actions CI/CD pipeline for pnpm workspace deployment
- [ ] Production deployment setup (Vercel for frontend, Fly.io for backend)
- [ ] Database migration scripts and backup strategy with Drizzle
- [ ] Comprehensive logging and monitoring with structured Winston logs
- [ ] Error tracking and alerting systems with proper Zod error handling
- [ ] Performance monitoring and React Query devtools integration
- [ ] Type safety verification in CI/CD pipeline

**Launch Preparation**
- [ ] Documentation and API reference
- [ ] Privacy policy and terms of service
- [ ] Backup and disaster recovery procedures
- [ ] Security audit and penetration testing
- [ ] User acceptance testing with target audience
- [ ] Go-live checklist and rollback procedures

## 6. Success Criteria

### Technical Success
- [ ] App loads in < 1 second
- [ ] PWA score > 90
- [ ] Works offline seamlessly
- [ ] Cross-browser compatibility
- [ ] Mobile-responsive design

### User Experience Success
- [ ] Girlfriend can log period in < 30 seconds
- [ ] Predictions are reasonably accurate (within 2-3 days)
- [ ] App feels fast and responsive
- [ ] No data loss during offline usage
- [ ] Intuitive interface requiring no training

### Learning Objectives Success
- [ ] Solid understanding of React hooks and patterns
- [ ] Experience with offline-first PWA development
- [ ] Knowledge of modern full-stack architecture
- [ ] Understanding of health app considerations
- [ ] Clean, maintainable codebase

## 7. Technical Considerations

### Monorepo Structure (pnpm workspaces)
```
period-tracker/
├── packages/
│   ├── frontend/          # Vite + React SPA
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── backend/           # Hono API server
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/            # Shared types & Zod schemas
│       ├── src/
│       │   ├── schemas.ts
│       │   └── types.ts
│       ├── package.json
│       └── tsconfig.json
├── apps/                  # Future mobile apps
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── package.json           # Root workspace config
├── pnpm-workspace.yaml
├── eslint.config.js       # ESLint + Stylistic config
└── tsconfig.json         # Root TypeScript config
```

### Security & Privacy
- HTTPS everywhere
- Secure authentication flow with Better Auth
- Data validation with Drizzle ORM type safety
- Rate limiting on APIs with proper logging
- GDPR-friendly data handling
- Input sanitization and SQL injection prevention via Drizzle

### Scalability
- Stateless backend design with Hono
- Efficient database queries optimized with Drizzle
- CDN for static assets
- Turso's edge replication for global performance
- Horizontal scaling capability
- Comprehensive monitoring with Winston logging

### Maintenance
- Clear code documentation and type safety
- Comprehensive error handling with structured logging
- Automated testing pipeline
- Easy deployment process
- Performance monitoring and alerting
- Database migration management with Drizzle

## 8. Future Considerations

### Phase 2+ Features
- Advanced fertility tracking
- Community features
- Wearable device integration
- AI-powered insights
- Telehealth integration

### Monetization Options
- Premium analytics features
- Partner sharing subscriptions
- Educational content tiers
- Health coaching services
- Anonymous data insights (opt-in)

### Technical Debt Management
- Regular dependency updates
- Code refactoring cycles
- Performance audits
- Security reviews
- User feedback integration

---

*This PRD serves as the foundation for building a delightful, fast, and reliable period tracking application that prioritizes user experience while providing valuable health insights.*
