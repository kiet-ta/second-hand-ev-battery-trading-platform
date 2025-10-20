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
    public class ComplaintConfiguration : IEntityTypeConfiguration<Complaint>
    {
        public void Configure(EntityTypeBuilder<Complaint> builder)
        {
            builder.ToTable("complaints");

            // ===== Primary Key =====
            builder.HasKey(c => c.ComplaintId);
            builder.Property(c => c.ComplaintId)
                   .HasColumnName("complaint_id");

            // ===== Foreign Keys (database-first style, no navigation) =====
            builder.Property(c => c.OrderId)
                   .HasColumnName("order_id");

            builder.Property(c => c.BuyerId)
                   .HasColumnName("buyer_id")
                   .IsRequired();

            builder.Property(c => c.SellerId)
                   .HasColumnName("seller_id")
                   .IsRequired();

            // ===== Columns =====
            builder.Property(c => c.Reason)
                   .HasColumnName("reason")
                   .HasMaxLength(255)
                   .IsRequired();

            builder.Property(c => c.Description)
                   .HasColumnName("description");

            builder.Property(c => c.Status)
                   .HasColumnName("status")
                   .HasMaxLength(20)
                   .HasDefaultValue("pending")
                   .IsRequired();

            builder.Property(c => c.SeverityLevel)
                   .HasColumnName("severity_level")
                   .HasMaxLength(20)
                   .HasDefaultValue("medium")
                   .IsRequired();

            builder.Property(c => c.CreatedAt)
                   .HasColumnName("created_at")
                   .HasDefaultValueSql("GETDATE()");

            builder.Property(c => c.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasDefaultValueSql("GETDATE()");
        }
    }
}
