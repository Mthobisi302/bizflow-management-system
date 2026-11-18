using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmallBusiness.Api.Data;
using SmallBusiness.Api.DTOs;
using SmallBusiness.Api.Models;

namespace SmallBusiness.Api.Controllers;

[ApiController, Authorize, Route("api/[controller]")]
public class ProductsController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public Task<List<Product>> Get() => db.Products.Where(x => x.UserId == UserId).OrderBy(x => x.Name).ToListAsync();

    [HttpPost]
    public async Task<IActionResult> Create(ProductRequest request)
    {
        if (request.UnitPrice < 0 || request.QuantityInStock < 0) return BadRequest("Price and stock cannot be negative.");
        var item = new Product { UserId = UserId, Name = request.Name, SKU = request.SKU,
            UnitPrice = request.UnitPrice, QuantityInStock = request.QuantityInStock, ReorderLevel = request.ReorderLevel };
        db.Products.Add(item); await db.SaveChangesAsync(); return Ok(item);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ProductRequest request)
    {
        var item = await db.Products.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (item is null) return NotFound();
        if (request.UnitPrice < 0 || request.QuantityInStock < 0) return BadRequest("Price and stock cannot be negative.");
        item.Name = request.Name; item.SKU = request.SKU; item.UnitPrice = request.UnitPrice;
        item.QuantityInStock = request.QuantityInStock; item.ReorderLevel = request.ReorderLevel;
        await db.SaveChangesAsync(); return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await db.Products.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (item is null) return NotFound();
        db.Products.Remove(item); await db.SaveChangesAsync(); return NoContent();
    }
}
