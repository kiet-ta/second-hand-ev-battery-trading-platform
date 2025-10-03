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
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> entity)
        {
            entity.ToTable("Order_Item");

            entity.HasKey(e => e.OrderItemId);

            entity.Property(e => e.OrderItemId).HasColumnName("order_item_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.Price).HasColumnName("price").HasColumnType("decimal(18,2)");

            // Relationship: Order_Item -> Orders
            //entity.HasOne(oi => oi.Order)
            //      .WithMany(o => o.OrderItems)
            //      .HasForeignKey(oi => oi.OrderId)
            //      .HasConstraintName("FK_OrderItem_Order")
            //      .OnDelete(DeleteBehavior.Cascade);

            // Relationship: Order_Item -> Item
            //entity.HasOne(oi => oi.Item)
            //      .WithMany(i => i.OrderItems)
            //      .HasForeignKey(oi => oi.ItemId)
            //      .HasConstraintName("FK_OrderItem_Item");
        }
    }
}
