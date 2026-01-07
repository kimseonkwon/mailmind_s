# PST Email Search Application

## Overview

This is a PST (Personal Storage Table) email search and management application. It allows users to import email data from JSON files and search through emails with relevance scoring. The application is built as a full-stack TypeScript project with a React frontend and Express backend, designed for productivity-focused email data exploration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and data fetching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (supports light/dark modes)
- **Design System**: Material Design 3 principles adapted for utility-focused productivity tools
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful endpoints under `/api` prefix
- **File Handling**: Multer for processing file uploads (up to 100MB)
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Development**: tsx for TypeScript execution, Vite dev server integration

### Data Layer
- **Database**: PostgreSQL (required via DATABASE_URL environment variable)
- **Schema Definition**: Drizzle schema in `shared/schema.ts`
- **Tables**:
  - `emails`: Stores imported email data (subject, sender, date, body, importance, label)
  - `importLogs`: Tracks file import history with email counts
  - `users`: User management (id, username, password)
- **Validation**: Zod schemas generated from Drizzle for type-safe API contracts

### Search Implementation
- Token-based text search with scoring algorithm
- Searches across subject, sender, and body fields
- Returns results ordered by relevance score

### Build Process
- Frontend: Vite builds to `dist/public`
- Backend: esbuild bundles server to `dist/index.cjs`
- Selective dependency bundling for optimized cold start times

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connected via `DATABASE_URL` environment variable
- **Connection**: Uses `pg` Pool for connection management

### UI Component Libraries
- **Radix UI**: Complete primitive set for accessible components (dialogs, dropdowns, tabs, etc.)
- **shadcn/ui**: Pre-styled component collection using Radix primitives
- **Lucide React**: Icon library

### Data & Forms
- **TanStack React Query**: Async state management and caching
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **Google Fonts**: Inter (primary), JetBrains Mono (monospace)

### Development Tools
- **Vite**: Build tool and dev server
- **Replit plugins**: Error overlay, cartographer, dev banner (development only)