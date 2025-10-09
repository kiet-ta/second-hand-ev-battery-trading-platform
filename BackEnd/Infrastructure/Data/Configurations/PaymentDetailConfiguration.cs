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
    public class PaymentDetailConfiguration : IEntityTypeConfiguration<PaymentDetail>
    {
        public void Configure(EntityTypeBuilder<PaymentDetail> entity)
        {
            entity.HasKey(e => e.PaymentDetailId).HasName("PK__payment___C66E6E36A8828EC8");

            entity.ToTable("payment_details");

            entity.Property(e => e.PaymentDetailId).HasColumnName("payment_detail_id");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PaymentId).HasColumnName("payment_id");

            entity.HasOne<Item>().WithMany()
                .HasForeignKey(d => d.ItemId)
                .HasConstraintName("FK__payment_d__item___1F98B2C1");

            entity.HasOne<Order>().WithMany()
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__payment_d__order__1EA48E88");

            entity.HasOne<Payment>().WithMany()
                .HasForeignKey(d => d.PaymentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__payment_d__payme__1DB06A4F");
        }
    }
}
