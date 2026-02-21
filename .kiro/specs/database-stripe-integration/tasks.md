# Implementation Plan: Database and Stripe Payment Integration

## Overview

This plan implements a complete SaaS transformation for ConvertAll Hub, adding user accounts, PostgreSQL database persistence, Stripe subscription payments, usage tracking with tier-based limits, and conversion history. The implementation follows a three-tier architecture with React/TypeScript frontend, FastAPI/Python backend, and PostgreSQL database on AWS RDS.

## Tasks

- [x] 1. Set up database infrastructure and migrations
  - [x] 1.1 Create database models and schema
    - Create SQLAlchemy models for User, Subscription, Conversion, and UsageTracking
    - Define relationships and foreign key constraints
    - Add indexes for performance optimization
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  
  - [x] 1.2 Set up Alembic for database migrations
    - Initialize Alembic configuration
    - Create initial migration script for all tables
    - Add migration commands to backend README
    - _Requirements: 12.5, 12.6_
  
  - [x] 1.3 Create database service layer
    - Implement DatabaseService class with connection pooling
    - Add async session management with context manager
    - Implement health check endpoint
    - _Requirements: 2.4, 8.2_

- [x] 2. Implement authentication system
  - [x] 2.1 Create authentication service
    - Implement password hashing with bcrypt
    - Implement JWT token creation and verification
    - Add token expiration handling (7-day default)
    - _Requirements: 1.4, 1.5_
  
  - [x] 2.2 Create authentication API endpoints
    - Implement POST /api/auth/register endpoint
    - Implement POST /api/auth/login endpoint
    - Implement GET /api/auth/me endpoint
    - Add request/response Pydantic schemas
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 2.3 Create authentication middleware
    - Implement JWT token verification middleware
    - Add dependency injection for current user
    - Handle expired and invalid tokens
    - _Requirements: 1.5_
  
  - [ ]* 2.4 Write unit tests for authentication
    - Test password hashing and verification
    - Test JWT token creation and validation
    - Test registration and login flows
    - Test error cases (invalid credentials, duplicate email)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Checkpoint - Verify authentication works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement usage tracking system
  - [ ] 4.1 Create usage tracker service
    - Implement check_can_convert method with tier-based limits
    - Implement record_conversion method
    - Implement get_usage_stats method with monthly reset logic
    - Add FREE_TIER_LIMIT constant (10 conversions/month)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ] 4.2 Create conversions API endpoints
    - Implement GET /api/conversions/usage endpoint
    - Implement GET /api/conversions/history endpoint with pagination
    - Add filtering by conversion type
    - Add Pydantic schemas for usage stats and conversion records
    - _Requirements: 3.5, 7.1, 7.2, 7.3, 7.6_
  
  - [ ]* 4.3 Write property test for usage tracking
    - **Property 1: Usage limits are enforced correctly**
    - **Validates: Requirements 3.2, 3.3**
    - Test that free tier users cannot exceed 10 conversions per month
    - Test that pro tier users have unlimited conversions
  
  - [ ]* 4.4 Write unit tests for usage tracker
    - Test monthly reset logic
    - Test conversion recording
    - Test usage stats calculation
    - Test failed conversion handling
    - _Requirements: 3.1, 3.4, 3.6_

- [ ] 5. Implement Stripe integration service
  - [ ] 5.1 Create Stripe service class
    - Implement create_checkout_session method
    - Implement create_portal_session method
    - Implement verify_webhook_signature method
    - Implement cancel_subscription method
    - Add retry logic with exponential backoff
    - _Requirements: 4.1, 4.4, 5.1, 6.1, 6.2, 9.3_
  
  - [ ] 5.2 Create subscription manager service
    - Implement handle_checkout_completed method
    - Implement handle_payment_succeeded method
    - Implement handle_payment_failed method
    - Implement handle_subscription_deleted method
    - Ensure atomic database transactions
    - _Requirements: 4.2, 5.2, 5.3, 5.4, 6.3, 6.4, 6.5_
  
  - [ ]* 5.3 Write unit tests for Stripe integration
    - Test checkout session creation
    - Test webhook signature verification
    - Test subscription lifecycle events
    - Test error handling and retries
    - _Requirements: 4.1, 5.1, 5.5, 9.1, 9.2, 9.3, 9.4_

- [ ] 6. Implement subscription API endpoints
  - [ ] 6.1 Create subscriptions router
    - Implement POST /api/subscriptions/create-checkout endpoint
    - Implement POST /api/subscriptions/create-portal endpoint
    - Implement GET /api/subscriptions/status endpoint
    - Implement POST /api/subscriptions/cancel endpoint
    - Add Pydantic schemas for requests and responses
    - _Requirements: 4.1, 4.2, 4.6, 6.1, 6.2, 6.6_
  
  - [ ] 6.2 Create webhooks router
    - Implement POST /api/webhooks/stripe endpoint
    - Add webhook signature verification
    - Handle checkout.session.completed event
    - Handle invoice.payment_succeeded event
    - Handle invoice.payment_failed event
    - Handle customer.subscription.deleted event
    - Implement idempotent event processing
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 6.3 Write property test for subscription state consistency
    - **Property 2: Subscription state remains consistent across webhook events**
    - **Validates: Requirements 5.6, 2.6**
    - Test that duplicate webhook events don't corrupt state
    - Test that subscription tier matches database state
  
  - [ ]* 6.4 Write integration tests for subscription flow
    - Test complete upgrade flow from free to pro
    - Test subscription cancellation flow
    - Test payment failure handling
    - _Requirements: 4.2, 4.3, 5.2, 5.3, 5.4, 6.3_

- [ ] 7. Checkpoint - Verify backend services work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement environment configuration and secrets management
  - [ ] 8.1 Create configuration module
    - Load database URL from environment variables
    - Load Stripe API keys from environment variables
    - Load JWT secret from environment variables
    - Add validation for required environment variables
    - Support test and live Stripe modes
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6_
  
  - [ ] 8.2 Add AWS Secrets Manager integration
    - Implement secrets retrieval for production environment
    - Add fallback to environment variables for local development
    - Document secrets configuration in README
    - _Requirements: 10.4_
  
  - [ ] 8.3 Update backend main.py
    - Add startup validation for environment variables
    - Add database health check on startup
    - Configure CORS for frontend domain
    - Add error handling for missing configuration
    - _Requirements: 2.4, 10.5, 10.6_

- [ ] 9. Implement frontend authentication context
  - [ ] 9.1 Create AuthContext and provider
    - Implement login, register, and logout functions
    - Store JWT token in localStorage
    - Add automatic token refresh logic
    - Provide user state to all components
    - _Requirements: 1.1, 1.2, 11.1_
  
  - [ ] 9.2 Create ProtectedRoute component
    - Redirect to /login if not authenticated
    - Show loading state while checking auth
    - Pass through if authenticated
    - _Requirements: 1.1, 1.2_
  
  - [ ] 9.3 Create authentication pages
    - Create LoginPage component with form validation
    - Create RegisterPage component with form validation
    - Add error message display
    - Add loading states during API calls
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 10. Implement frontend subscription management
  - [ ] 10.1 Create SubscriptionContext and provider
    - Fetch and cache subscription status
    - Implement upgradeToProMonthly function
    - Implement upgradeToProAnnual function
    - Implement openBillingPortal function
    - Implement cancelSubscription function
    - Add automatic refresh every 5 minutes
    - _Requirements: 4.1, 4.6, 6.1, 6.2, 6.6, 11.2, 11.6_
  
  - [ ] 10.2 Create usage tracking UI components
    - Create UsageDisplay component showing used/limit
    - Create UsageProgressBar component
    - Show reset date for free tier users
    - Update UI when usage changes
    - _Requirements: 3.5, 11.3_
  
  - [ ] 10.3 Create subscription management page
    - Display current plan and status
    - Show upgrade buttons for free tier users
    - Show billing portal button for pro tier users
    - Show subscription renewal date
    - Add cancel subscription button with confirmation
    - _Requirements: 6.1, 6.2, 6.6, 11.4, 11.5_
  
  - [ ] 10.4 Create conversion history page
    - Display paginated conversion history
    - Add filtering by conversion type
    - Show conversion status and timestamp
    - Add loading and error states
    - _Requirements: 7.1, 7.2, 7.3, 7.6_

- [ ] 11. Integrate authentication and usage tracking into conversion tools
  - [ ] 11.1 Update conversion tool components
    - Add authentication check before conversion
    - Check usage limits before conversion
    - Record conversion to database after processing
    - Show usage stats after conversion
    - Handle usage limit exceeded errors
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [ ] 11.2 Update App.tsx routing
    - Add protected routes for authenticated pages
    - Add public routes for login/register
    - Add subscription management route
    - Add conversion history route
    - Wrap app with AuthContext and SubscriptionContext
    - _Requirements: 1.1, 1.2_
  
  - [ ]* 11.3 Write integration tests for conversion flow
    - Test authenticated conversion flow
    - Test usage limit enforcement
    - Test conversion recording
    - Test error handling
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

- [ ] 12. Checkpoint - Verify frontend integration works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement database security and error handling
  - [ ] 13.1 Add SQL injection prevention
    - Verify all queries use parameterized statements
    - Add input validation with Pydantic
    - Review SQLAlchemy query construction
    - _Requirements: 8.4_
  
  - [ ] 13.2 Implement error logging and monitoring
    - Add structured logging for database errors
    - Add structured logging for Stripe API errors
    - Sanitize error messages sent to clients
    - Add error tracking for webhook failures
    - _Requirements: 8.6, 9.1_
  
  - [ ] 13.3 Add rate limiting and security headers
    - Implement rate limiting for authentication endpoints
    - Add security headers (CORS, CSP, etc.)
    - Implement request size limits
    - _Requirements: 8.1, 8.5, 9.5_

- [ ] 14. Create deployment configuration
  - [ ] 14.1 Create database migration deployment script
    - Add script to run migrations on deployment
    - Add rollback capability
    - Document migration process
    - _Requirements: 12.5, 12.6_
  
  - [ ] 14.2 Update AWS deployment configuration
    - Configure RDS PostgreSQL instance
    - Set up AWS Secrets Manager for credentials
    - Configure backend environment variables
    - Update frontend environment variables for API URL
    - _Requirements: 10.4, 12.4_
  
  - [ ] 14.3 Configure database backups
    - Enable automated daily backups on RDS
    - Set 30-day retention period
    - Enable point-in-time recovery
    - Document backup and recovery procedures
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ] 14.4 Create deployment documentation
    - Document environment variables required
    - Document Stripe webhook configuration
    - Document database migration process
    - Add troubleshooting guide
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 15. Final checkpoint - End-to-end verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation builds incrementally: database → backend services → API endpoints → frontend integration
- Stripe webhooks must be configured in Stripe dashboard after deployment
- Database migrations should be run before deploying new backend code
