# Project guide

## Architecture
Angular is the presentation layer. It calls the ASP.NET Core REST API over HTTP. The API validates the JWT, scopes every business-data query to the signed-in user, and uses EF Core to read/write SQL Server.

## Main folders
- `frontend/small-business-ui/src/app`: Angular app, API service and JWT interceptor.
- `backend/SmallBusiness.Api/Controllers`: authentication, customer, product, sales, expense, dashboard, report and invoice endpoints.
- `backend/SmallBusiness.Api/Models`: EF Core entities.
- `backend/SmallBusiness.Api/Data`: database context.

## Important behaviour
- Passwords are hashed with BCrypt; plain-text passwords are never stored.
- The JWT is sent in the Authorization header by an Angular HTTP interceptor.
- Each customer, product, sale and expense belongs to the authenticated user.
- A sale checks available stock and reduces stock within a database transaction.
- Invoice data is available from `GET /api/invoices/{saleId}`.
- Monthly reports return all 12 months, including months with no sales.

## Suggested next improvements
1. Add edit/delete screens for products and customers.
2. Add multi-item sale cart and invoice print/PDF generation.
3. Add pagination, search, server-side validation and automated unit/integration tests.
4. Add business profile, VAT/tax settings and configurable invoice branding.
5. Add roles (owner, manager, cashier) and audit history.
6. Add production-grade token refresh/revocation and secure secret storage.
7. Deploy to Azure SQL + App Service + Static Web Apps.
