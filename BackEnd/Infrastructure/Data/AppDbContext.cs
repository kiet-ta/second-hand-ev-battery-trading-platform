using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
    }
    //protected override void OnModelCreating(ModelBuilder modelBuilder)
    //    {
    //        // Constraint Role
    //        modelBuilder.Entity<User>()
    //            .Property(u => u.Role)
    //            .HasDefaultValue("Buyer");

    //        // Constraint KYC
    //        modelBuilder.Entity<User>()
    //            .Property(u => u.KycStatus)
    //            .HasDefaultValue("not_submitted");

    //        // Constraint Account Status
    //        modelBuilder.Entity<User>()
    //            .Property(u => u.AccountStatus)
    //            .HasDefaultValue("active");

    //        // Soft Delete default
    //        modelBuilder.Entity<User>()
    //            .Property(u => u.IsDeleted)
    //            .HasDefaultValue(false);

    //        // CreatedAt default
    //        modelBuilder.Entity<User>()
    //            .Property(u => u.CreatedAt)
    //            .HasDefaultValueSql("GETDATE()");

    //        // UpdatedAt default
    //        modelBuilder.Entity<User>()
    //            .Property(u => u.UpdatedAt)
    //            .HasDefaultValueSql("GETDATE()");
    //    }
}
