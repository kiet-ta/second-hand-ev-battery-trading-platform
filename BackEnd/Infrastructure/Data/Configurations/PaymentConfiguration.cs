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
            //entity.ToTable("Payment");

            //entity.HasKey(e => e.PaymentId);

            //entity.Property(e => e.PaymentId).HasColumnName("payment_id");
            //entity.Property(e => e.OrderId).HasColumnName("order_id");
            //entity.Property(e => e.BuyerId).HasColumnName("user_id");
            //entity.Property(e => e.SellerId).HasColumnName("seller_id");
            //entity.Property(e => e.Method).HasColumnName("method");
            //entity.Property(e => e.Status).HasColumnName("status");
            //entity.Property(e => e.PaidAt).HasColumnName("paid_at");
            //entity.Property(e => e.UpdatedAt).HasColumnName("update_at");

            entity.HasKey(e => e.PaymentId).HasName("PK__Payment__ED1FC9EAA8679B03");

            entity.ToTable("Payment");

            entity.HasIndex(e => e.OrderCode, "UQ__Payment__99D12D3F05355D24").IsUnique();

            entity.Property(e => e.PaymentId).HasColumnName("payment_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Currency)
                .HasMaxLength(10)
                .HasDefaultValue("VND")
                .HasColumnName("currency");
            entity.Property(e => e.ExpiredAt)
                .HasColumnType("datetime")
                .HasColumnName("expired_at");
            entity.Property(e => e.Method)
                .HasMaxLength(50)
                .HasColumnName("method");
            entity.Property(e => e.OrderCode).HasColumnName("order_code");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.TotalAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("total_amount");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            //entity.HasOne(d => d.User).WithMany(p => p.Payments)
            //    .HasForeignKey(d => d.UserId)
            //    .OnDelete(DeleteBehavior.ClientSetNull)
            //    .HasConstraintName("FK__Payment__user_id__66603565");

            // Relationship: Payment -> User
            //entity.HasOne(p => p.User)
            //      .WithMany(u => u.Payments)
            //      .HasForeignKey(p => p.UserId)
            //      .HasConstraintName("FK_Payment_User");
        }
    }
}
