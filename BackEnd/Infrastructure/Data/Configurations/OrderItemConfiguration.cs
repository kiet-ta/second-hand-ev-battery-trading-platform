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
            //entity.HasOne<OrderItem>(oi => oi.Order)
            //      .WithMany(o => o.OrderItems)
            //      .HasForeignKey(oi => oi.OrderId)
            //      .HasConstraintName("FK_OrderItem_Order")
            //      .OnDelete(DeleteBehavior.Cascade);

            // Relationship: Order_Item -> Item
            //entity.HasOne(oi => oi.Item)
            //      .WithMany(i => i.OrderItems)
            //      .HasForeignKey(oi => oi.ItemId)
            //      .HasConstraintName("FK_OrderItem_Item");

            entity.HasOne<Item>()
                .WithMany()
                .HasForeignKey(d => d.ItemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_Ite__item___5EBF139D");

            entity.HasOne<Order>()  // target type
              .WithMany()       // không có collection trong Order
              .HasForeignKey(e => e.OrderId)
              .OnDelete(DeleteBehavior.ClientSetNull)
              .HasConstraintName("FK_OrderItem_Order");
        }
    }
}
