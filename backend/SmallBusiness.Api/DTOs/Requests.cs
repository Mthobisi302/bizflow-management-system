namespace SmallBusiness.Api.DTOs;

public record RegisterRequest(string FullName, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record CustomerRequest(string Name, string Email, string Phone, string Address);
public record ProductRequest(string Name, string SKU, decimal UnitPrice, int QuantityInStock, int ReorderLevel);
public record SaleLineRequest(int ProductId, int Quantity);
public record SaleRequest(int CustomerId, List<SaleLineRequest> Items);
public record ExpenseRequest(string Description, string Category, decimal Amount, DateTime ExpenseDate);
