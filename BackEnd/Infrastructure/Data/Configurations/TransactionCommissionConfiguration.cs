using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class TransactionCommissionConfiguration : IEntityTypeConfiguration<TransactionCommission>
{
    public void Configure(EntityTypeBuilder<TransactionCommission> builder)
    {
        builder.ToTable("transaction_commissions");
        builder.HasKey(t => t.Id);
        builder.Property(e => e.WalletTransactionId)
        .HasColumnName("wallet_transaction_id");

        builder.Property(e => e.PaymentTransactionId)
        .HasColumnName("payment_transaction_id");

        builder.Property(e => e.RuleId)
               .HasColumnName("rule_id")
               .IsRequired();

        builder.Property(e => e.AppliedValue)
               .HasColumnName("applied_value")
               .HasColumnType("decimal(18,2)")
               .IsRequired();

        builder.Property(e => e.CreatedAt)
               .HasColumnName("created_at")
               .HasDefaultValueSql("GETDATE()");
    }
}
