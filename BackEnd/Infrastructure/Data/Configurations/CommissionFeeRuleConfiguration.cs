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
    public class CommissionFeeRuleConfiguration : IEntityTypeConfiguration<CommissionFeeRule>
    {
        public void Configure(EntityTypeBuilder<CommissionFeeRule> entity) 
        {
            entity.HasKey(e => e.RuleId).HasName("PK__commissi__E92A9296DB5544C2");

            entity.ToTable("commission_fee_rules");

            entity.HasIndex(e => e.FeeCode, "UQ__commissi__5362C8BC5E30C1C3").IsUnique();

            entity.Property(e => e.RuleId).HasColumnName("rule_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.EffectiveFrom)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("effective_from");
            entity.Property(e => e.EffectiveTo)
                .HasColumnType("datetime")
                .HasColumnName("effective_to");
            entity.Property(e => e.FeeCode)
                .HasMaxLength(50)
                .HasColumnName("fee_code");
            entity.Property(e => e.FeeName)
                .HasMaxLength(100)
                .HasColumnName("fee_name");
            entity.Property(e => e.FeeType)
                .HasMaxLength(20)
                .HasColumnName("fee_type");
            entity.Property(e => e.FeeValue)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("fee_value");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.TargetRole)
                .HasMaxLength(20)
                .HasDefaultValue("seller")
                .HasColumnName("target_role");
        }
    }
}
