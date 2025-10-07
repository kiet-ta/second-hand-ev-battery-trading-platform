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
            entity.HasKey(e => e.PaymentDetailId).HasName("PK__Payment___C66E6E36E9E2A3A2");

            entity.ToTable("Payment_Detail");

            entity.Property(e => e.PaymentDetailId).HasColumnName("payment_detail_id");
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)").HasColumnName("amount");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PaymentId).HasColumnName("payment_id");

            entity.HasOne<Item>().WithMany()
                .HasForeignKey(d => d.ItemId)
                .HasConstraintName("FK__Payment_D__item___1AD3FDA4");

            entity.HasOne<Order>().WithMany()
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__Payment_D__order__19DFD96B");

            entity.HasOne<Payment>().WithMany()
                .HasForeignKey(d => d.PaymentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payment_D__payme__18EBB532");
        }
    }
}
