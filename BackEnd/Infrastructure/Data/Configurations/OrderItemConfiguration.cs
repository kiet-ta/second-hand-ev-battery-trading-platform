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
            entity.HasKey(e => e.OrderItemId).HasName("PK__order_it__3764B6BC9779F382");

            entity.ToTable("order_items");

            entity.Property(e => e.OrderItemId).HasColumnName("order_item_id");
            entity.Property(e => e.BuyerId).HasColumnName("buyer_id");
            entity.Property(e => e.IsDeleted)
                .HasDefaultValue(false)
                .HasColumnName("is_deleted");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("price");
            entity.Property(e => e.Quantity)
                .HasDefaultValue(1)
                .HasColumnName("quantity");

            //entity.HasOne(d => d.Buyer).WithMany(p => p.OrderItems)
            //    .HasForeignKey(d => d.BuyerId)
            //    .OnDelete(DeleteBehavior.ClientSetNull)
            //    .HasConstraintName("FK__order_ite__buyer__60A75C0F");

            entity.HasOne<Item>().WithMany()
                .HasForeignKey(d => d.ItemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__order_ite__item___5FB337D6");

            entity.HasOne<Order>().WithMany()
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__order_ite__is_de__5EBF139D");
        }
    }
}
