using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class WalletConfiguration : IEntityTypeConfiguration<Wallet>
{
    public void Configure(EntityTypeBuilder<Wallet> entity)
    {
        entity.HasKey(e => e.WalletId).HasName("PK__wallets__0EE6F041F0C57219");

        entity.ToTable("wallets");

        entity.HasIndex(e => e.UserId, "UQ__wallets__B9BE370EDA87C2F7").IsUnique();

        entity.Property(e => e.WalletId).HasColumnName("wallet_id");
        entity.Property(e => e.Balance)
            .HasColumnType("decimal(18, 2)")
            .HasColumnName("balance");
        entity.Property(e => e.Currency)
            .HasMaxLength(10)
            .HasDefaultValue("vnd")
            .HasColumnName("currency");
        entity.Property(e => e.Status)
            .HasMaxLength(20)
            .HasDefaultValue("active")
            .HasColumnName("status");
        entity.Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())")
            .HasColumnType("datetime")
            .HasColumnName("updated_at");
        entity.Property(e => e.UserId).HasColumnName("user_id");

        entity.HasOne<User>().WithOne()
            .HasForeignKey<Wallet>(d => d.UserId)
            .HasConstraintName("FK__wallets__user_id__160F4887");
    }
}