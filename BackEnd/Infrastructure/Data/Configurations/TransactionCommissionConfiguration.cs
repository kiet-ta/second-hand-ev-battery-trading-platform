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
    public class TransactionCommissionConfiguration : IEntityTypeConfiguration<TransactionCommission>
    {
        public void Configure(EntityTypeBuilder<TransactionCommission> entity)
        {
            entity.HasKey(e => e.Id).HasName("PK__transact__3213E83F3D3CBD37");

            entity.ToTable("transaction_commissions");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AppliedValue)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("applied_value");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.RuleId).HasColumnName("rule_id");
            entity.Property(e => e.TransactionId).HasColumnName("transaction_id");

            //entity.HasOne(d => d.Rule).WithMany(p => p.TransactionCommissions)
            //    .HasForeignKey(d => d.RuleId)
            //    .OnDelete(DeleteBehavior.ClientSetNull)
            //    .HasConstraintName("FK__transacti__rule___2BFE89A6");

            //entity.HasOne(d => d.Transaction).WithMany(p => p.TransactionCommissions)
            //    .HasForeignKey(d => d.TransactionId)
            //    .OnDelete(DeleteBehavior.ClientSetNull)
            //    .HasConstraintName("FK__transacti__trans__2CF2ADDF");
        }
    }
}
