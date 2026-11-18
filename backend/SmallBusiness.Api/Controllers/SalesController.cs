using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmallBusiness.Api.Data;
using SmallBusiness.Api.DTOs;
using SmallBusiness.Api.Models;

namespace SmallBusiness.Api.Controllers;

[ApiController, Authorize, Route("api/[controller]")]
public class SalesController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public Task<List<Sale>> Get() => db.Sales.Include(x => x.Items).Where(x => x.UserId == UserId)
        .OrderByDescending(x => x.SaleDate).ToListAsync();

    [HttpPost]
    public async Task<IActionResult> Create(SaleRequest request)
    {
        if (request.Items.Count == 0) return BadRequest("Add at least one sale item.");
        if (!await db.Customers.AnyAsync(x => x.Id == request.CustomerId && x.UserId == UserId))
            return BadRequest("Customer not found.");

        await using var transaction = await db.Database.BeginTransactionAsync();
        var sale = new Sale { UserId = UserId, CustomerId = request.CustomerId,
            InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100,999)}" };

        foreach (var line in request.Items)
        {
            var product = await db.Products.FirstOrDefaultAsync(x => x.Id == line.ProductId && x.UserId == UserId);
            if (product is null) return BadRequest($"Product {line.ProductId} not found.");
            if (line.Quantity <= 0 || product.QuantityInStock < line.Quantity)
                return BadRequest($"Insufficient stock for {product.Name}.");
            product.QuantityInStock -= line.Quantity;
            sale.Items.Add(new SaleItem { ProductId = product.Id, ProductName = product.Name,
                Quantity = line.Quantity, UnitPrice = product.UnitPrice, LineTotal = product.UnitPrice * line.Quantity });
        }
        sale.Total = sale.Items.Sum(x => x.LineTotal);
        db.Sales.Add(sale);
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Ok(sale);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var sale = await db.Sales.Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (sale is null) return NotFound("Invoice/Sale not found.");

        await using var transaction = await db.Database.BeginTransactionAsync();

        // Automatically restore inventory stock for all items from the deleted invoice
        foreach (var item in sale.Items)
        {
            var product = await db.Products.FirstOrDefaultAsync(x => x.Id == item.ProductId && x.UserId == UserId);
            if (product != null)
            {
                product.QuantityInStock += item.Quantity;
            }
        }

        db.Sales.Remove(sale);
        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return NoContent();
    }
}
