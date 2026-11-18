using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmallBusiness.Api.Data;

namespace SmallBusiness.Api.Controllers;

[ApiController, Authorize, Route("api/[controller]")]
public class DashboardController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1);
        var sales = await db.Sales.Where(x => x.UserId == UserId).ToListAsync();
        var expenses = await db.Expenses.Where(x => x.UserId == UserId).ToListAsync();
        return Ok(new {
            totalSales = sales.Sum(x => x.Total),
            monthlySales = sales.Where(x => x.SaleDate >= monthStart).Sum(x => x.Total),
            monthlyExpenses = expenses.Where(x => x.ExpenseDate >= monthStart).Sum(x => x.Amount),
            customerCount = await db.Customers.CountAsync(x => x.UserId == UserId),
            productCount = await db.Products.CountAsync(x => x.UserId == UserId),
            lowStockCount = await db.Products.CountAsync(x => x.UserId == UserId && x.QuantityInStock <= x.ReorderLevel),
            recentSales = sales.OrderByDescending(x => x.SaleDate).Take(5)
        });
    }
}
