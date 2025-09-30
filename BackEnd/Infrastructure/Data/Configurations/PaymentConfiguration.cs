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
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> entity)
        {
            entity.ToTable("Payment");

            entity.HasKey(e => e.PaymentId);

            entity.Property(e => e.PaymentId).HasColumnName("payment_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.BuyerId).HasColumnName("buyer_id");
            entity.Property(e => e.SellerId).HasColumnName("seller_id");
            entity.Property(e => e.Method).HasColumnName("method");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.PaidAt).HasColumnName("paid_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("update_at");

            // Relationship: Payment -> User
            //entity.HasOne(p => p.User)
            //      .WithMany(u => u.Payments)
            //      .HasForeignKey(p => p.UserId)
            //      .HasConstraintName("FK_Payment_User");
        }
    }
}
