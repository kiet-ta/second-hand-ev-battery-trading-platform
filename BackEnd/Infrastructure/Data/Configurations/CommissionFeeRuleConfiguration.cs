using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class CommissionFeeRuleConfiguration : IEntityTypeConfiguration<CommissionFeeRule>
{
    public void Configure(EntityTypeBuilder<CommissionFeeRule> builder)
    {
        builder.ToTable("commission_fee_rule");
        builder.HasKey(r => r.RuleId);
        builder.Property(r => r.FeeCode).IsRequired().HasMaxLength(50);
        builder.Property(r => r.FeeName).IsRequired().HasMaxLength(100);
        builder.Property(r => r.FeeType).IsRequired().HasMaxLength(20);
        builder.Property(r => r.FeeValue).HasColumnType("decimal(10,2)");
    }
}