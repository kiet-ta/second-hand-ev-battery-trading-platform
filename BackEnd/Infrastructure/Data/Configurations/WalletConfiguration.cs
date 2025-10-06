using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class WalletConfiguration : IEntityTypeConfiguration<Wallet>
{
    public void Configure(EntityTypeBuilder<Wallet> entity)
    {
        entity.ToTable("Wallet");
        entity.HasKey(e => e.WalletId);

        entity.Property(e => e.WalletId).HasColumnName("wallet_id");
        entity.Property(e => e.UserId).HasColumnName("user_id");
        entity.Property(e => e.Balance).HasColumnName("balance");
        entity.Property(e => e.Currency).HasColumnName("currency");
        entity.Property(e => e.Status).HasColumnName("status");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
    }
}