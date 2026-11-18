The SQL Server schema is generated from the Entity Framework Core models.

Run from `backend/SmallBusiness.Api`:
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

EF Core creates Users, Customers, Products, Sales, SaleItems and Expenses tables, including decimal precision and a unique user email index.
