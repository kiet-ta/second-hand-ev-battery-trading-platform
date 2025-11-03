using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class CommissionFeeRuleConfiguration : IEntityTypeConfiguration<CommissionFeeRule>
{
    public void Configure(EntityTypeBuilder<CommissionFeeRule> builder)
    {
        // Table
        builder.ToTable("commission_fee_rules");

        // Primary Key
        builder.HasKey(e => e.RuleId)
               .HasName("PK__commission_fee_rules__rule_id");

        // Columns
        builder.Property(e => e.RuleId)
               .HasColumnName("rule_id");

        builder.Property(e => e.FeeCode)
               .HasColumnName("fee_code")
               .HasMaxLength(50)
               .IsRequired();

        builder.HasIndex(e => e.FeeCode)
               .IsUnique();

        builder.Property(e => e.FeeName)
               .HasColumnName("fee_name")
               .HasMaxLength(100)
               .IsRequired();

        builder.Property(e => e.TargetRole)
               .HasColumnName("target_role")
               .HasMaxLength(20)
               .HasDefaultValue("seller");

        builder.Property(e => e.FeeType)
               .HasColumnName("fee_type")
               .HasMaxLength(20)
               .IsRequired();

        builder.Property(e => e.FeeValue)
               .HasColumnName("fee_value")
               .HasColumnType("decimal(10,2)")
               .IsRequired();

        builder.Property(e => e.EffectiveFrom)
               .HasColumnName("effective_from")
               .HasDefaultValueSql("GETDATE()");

        builder.Property(e => e.EffectiveTo)
               .HasColumnName("effective_to");

        builder.Property(e => e.IsActive)
               .HasColumnName("is_active")
               .HasDefaultValue(true);

        builder.Property(e => e.CreatedAt)
               .HasColumnName("created_at")
               .HasDefaultValueSql("GETDATE()");

        // Optional: Check constraints
        //builder.HasCheckConstraint("CK_CommissionFeeRule_TargetRole",
        //    "[target_role] IN ('buyer','seller','all')");

        //builder.HasCheckConstraint("CK_CommissionFeeRule_FeeType",
        //    "[fee_type] IN ('percentage','fixed')");
    }
}

