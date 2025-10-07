using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class WalletTransactionConfiguration : IEntityTypeConfiguration<WalletTransaction>
{
    public void Configure(EntityTypeBuilder<WalletTransaction> entity)
    {
        entity.ToTable("Wallet_Transaction");
        entity.HasKey(e => e.TransactionId);

        entity.Property(e => e.TransactionId).HasColumnName("transaction_id");
        entity.Property(e => e.WalletId).HasColumnName("wallet_id");
        entity.Property(e => e.Amount).HasColumnName("amount");
        entity.Property(e => e.Type).HasColumnName("type");
        entity.Property(e => e.RefId).HasColumnName("ref_id");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
    }
}