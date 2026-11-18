using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmallBusiness.Api.Data;

namespace SmallBusiness.Api.Controllers;

[ApiController, Authorize, Route("api/[controller]")]
public class InvoicesController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{saleId:int}")]
    public async Task<IActionResult> Get(int saleId)
    {
        var sale = await db.Sales.Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == saleId && x.UserId == UserId);
        if (sale is null) return NotFound();
        var customer = await db.Customers.FirstOrDefaultAsync(x => x.Id == sale.CustomerId && x.UserId == UserId);
        return Ok(new { sale.InvoiceNumber, sale.SaleDate, customer, sale.Items, sale.Total });
    }
}
