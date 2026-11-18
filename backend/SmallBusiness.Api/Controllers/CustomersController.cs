using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmallBusiness.Api.Data;
using SmallBusiness.Api.DTOs;
using SmallBusiness.Api.Models;

namespace SmallBusiness.Api.Controllers;

[ApiController, Authorize, Route("api/[controller]")]
public class CustomersController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public Task<List<Customer>> Get() => db.Customers.Where(x => x.UserId == UserId).OrderBy(x => x.Name).ToListAsync();

    [HttpPost]
    public async Task<IActionResult> Create(CustomerRequest request)
    {
        var item = new Customer { UserId = UserId, Name = request.Name, Email = request.Email,
            Phone = request.Phone, Address = request.Address };
        db.Customers.Add(item); await db.SaveChangesAsync(); return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CustomerRequest request)
    {
        var item = await db.Customers.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (item is null) return NotFound();
        item.Name = request.Name; item.Email = request.Email; item.Phone = request.Phone; item.Address = request.Address;
        await db.SaveChangesAsync(); return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await db.Customers.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (item is null) return NotFound();
        db.Customers.Remove(item); await db.SaveChangesAsync(); return NoContent();
    }
}
