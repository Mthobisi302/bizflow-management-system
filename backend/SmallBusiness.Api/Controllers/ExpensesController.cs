using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmallBusiness.Api.Data;
using SmallBusiness.Api.DTOs;
using SmallBusiness.Api.Models;

namespace SmallBusiness.Api.Controllers;

[ApiController, Authorize, Route("api/[controller]")]
public class ExpensesController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public Task<List<Expense>> Get() => db.Expenses.Where(x => x.UserId == UserId).OrderByDescending(x => x.ExpenseDate).ToListAsync();

    [HttpPost]
    public async Task<IActionResult> Create(ExpenseRequest request)
    {
        if (request.Amount <= 0) return BadRequest("Expense amount must be greater than zero.");
        var expense = new Expense { UserId = UserId, Description = request.Description,
            Category = request.Category, Amount = request.Amount, ExpenseDate = request.ExpenseDate };
        db.Expenses.Add(expense); await db.SaveChangesAsync(); return Ok(expense);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await db.Expenses.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (item is null) return NotFound();
        db.Expenses.Remove(item); await db.SaveChangesAsync(); return NoContent();
    }
}
