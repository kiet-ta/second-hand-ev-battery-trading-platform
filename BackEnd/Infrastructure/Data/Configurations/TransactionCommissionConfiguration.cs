using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class TransactionCommissionConfiguration : IEntityTypeConfiguration<TransactionCommission>
{
    public void Configure(EntityTypeBuilder<TransactionCommission> builder)
    {
        builder.ToTable("transaction_commission");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.AppliedValue).HasColumnType("decimal(18,2)");
    }
}