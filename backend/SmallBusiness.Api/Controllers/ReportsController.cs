using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmallBusiness.Api.Data;

namespace SmallBusiness.Api.Controllers;

[ApiController, Authorize, Route("api/[controller]")]
public class ReportsController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("monthly-sales")]
    public async Task<IActionResult> MonthlySales([FromQuery] int? year)
    {
        var selectedYear = year ?? DateTime.UtcNow.Year;
        var sales = await db.Sales.Where(x => x.UserId == UserId && x.SaleDate.Year == selectedYear)
            .GroupBy(x => x.SaleDate.Month)
            .Select(g => new { month = g.Key, totalSales = g.Sum(x => x.Total), numberOfSales = g.Count() })
            .ToListAsync();
        var result = Enumerable.Range(1, 12).Select(month => new {
            month, monthName = new DateTime(selectedYear, month, 1).ToString("MMMM"),
            totalSales = sales.FirstOrDefault(x => x.month == month)?.totalSales ?? 0,
            numberOfSales = sales.FirstOrDefault(x => x.month == month)?.numberOfSales ?? 0
        });
        return Ok(result);
    }
}
