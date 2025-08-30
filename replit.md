# AI English Tutor Platform

## Overview

An interactive AI-powered English learning platform that provides personalized language tutoring through level-based modules, adaptive testing, and intelligent feedback. The application features a gamified learning experience with progress tracking, achievements, and social leaderboards to motivate continuous learning. Built as a full-stack web application with real-time AI integration for instant feedback on writing and comprehension exercises.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for fast development and building
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling
- **Middleware**: Custom logging, authentication, and error handling middleware
- **Development**: Hot reload with Vite integration for seamless full-stack development

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Database**: PostgreSQL with Neon serverless for scalable data storage
- **Schema**: Comprehensive relational design covering users, modules, tests, progress tracking, and achievements
- **Session Storage**: PostgreSQL-backed session store for authentication persistence

### Authentication System
- **Provider**: Replit Auth using OpenID Connect for secure user authentication
- **Session Management**: Express session with PostgreSQL store for server-side session persistence
- **Authorization**: Passport.js strategy with custom middleware for route protection
- **Security**: HTTP-only cookies with secure flags and CSRF protection

### AI Integration
- **Provider**: OpenAI API integration for intelligent content generation and feedback
- **Services**: Dedicated AI service layer for test generation and personalized feedback
- **Features**: Automated scoring, skill assessment, and improvement suggestions
- **Error Handling**: Graceful fallbacks and retry logic for AI service reliability

### Learning Management System
- **Content Structure**: Hierarchical module system with beginner, intermediate, and advanced levels
- **Progress Tracking**: Comprehensive user progress with completion rates and skill metrics
- **Assessment Engine**: Dynamic test generation with multiple question types and adaptive difficulty
- **Gamification**: Points, streaks, achievements, and leaderboards for engagement

### Development Workflow
- **Build System**: Vite for frontend bundling with esbuild for server-side builds
- **Type Safety**: Full TypeScript coverage with strict compiler settings
- **Database Management**: Drizzle Kit for schema migrations and database synchronization
- **Environment**: Development and production configurations with proper environment variable handling

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting for scalable data storage
- **OpenAI API**: GPT-5 model for AI-powered content generation and feedback analysis
- **Replit Auth**: OAuth2/OpenID Connect authentication service for user management

### UI and Styling
- **Radix UI**: Headless component primitives for accessible interface elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent visual elements
- **Google Fonts**: Web typography with Inter, DM Sans, and Fira Code fonts

### Development Tools
- **Vite**: Build tool and development server with hot module replacement
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer for cross-browser compatibility
- **TypeScript**: Static type checking and enhanced developer experience

### Runtime Libraries
- **Express.js**: Web application framework for API development
- **React Query**: Data fetching and caching library for efficient state management
- **Passport.js**: Authentication middleware for Express applications
- **Zod**: Schema validation library for runtime type checking
- **Date-fns**: Date utility library for time-based calculations