using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Configurations
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> entity)
        {
            entity.ToTable("Orders");

            entity.HasKey(e => e.OrderId);

            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.BuyerId).HasColumnName("buyer_id");
            entity.Property(e => e.AddressId).HasColumnName("address_id");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            // Relationship: Order -> Buyer (User) many orders belong to one buyer
            //entity.HasOne(o => o.Buyer)
            //      .WithMany(u => u.Orders)
            //      .HasForeignKey(o => o.BuyerId)
            //      .HasConstraintName("FK_Order_Buyer");

            // Relationship: Order -> Address
            //entity.HasOne(o => o.Address)
            //      .WithMany(a => a.Orders)
            //      .HasForeignKey(o => o.AddressId)
            //      .HasConstraintName("FK_Order_Address");

        }
    }
}
