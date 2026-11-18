using Microsoft.EntityFrameworkCore;
using SmallBusiness.Api.Models;

namespace SmallBusiness.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleItem> SaleItems => Set<SaleItem>();
    public DbSet<Expense> Expenses => Set<Expense>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<Product>().Property(x => x.UnitPrice).HasPrecision(18, 2);
        modelBuilder.Entity<Sale>().Property(x => x.Total).HasPrecision(18, 2);
        modelBuilder.Entity<SaleItem>().Property(x => x.UnitPrice).HasPrecision(18, 2);
        modelBuilder.Entity<SaleItem>().Property(x => x.LineTotal).HasPrecision(18, 2);
        modelBuilder.Entity<Expense>().Property(x => x.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<Sale>().HasMany(x => x.Items).WithOne().HasForeignKey(x => x.SaleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
