using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class WalletTransactionConfiguration : IEntityTypeConfiguration<WalletTransaction>
{
    public void Configure(EntityTypeBuilder<WalletTransaction> entity)
    {
        entity.HasKey(e => e.TransactionId).HasName("PK__wallet_t__85C600AF322D4ED1");

        entity.ToTable("wallet_transactions");

        entity.Property(e => e.TransactionId).HasColumnName("transaction_id");
        entity.Property(e => e.Amount)
            .HasColumnType("decimal(18, 2)")
            .HasColumnName("amount");
        entity.Property(e => e.CreatedAt)
            .HasDefaultValueSql("(getdate())")
            .HasColumnType("datetime")
            .HasColumnName("created_at");
        entity.Property(e => e.RefId).HasColumnName("ref_id");
        entity.Property(e => e.Type)
            .HasMaxLength(20)
            .HasColumnName("type");
        entity.Property(e => e.WalletId).HasColumnName("wallet_id");

        entity.HasOne<Wallet>().WithMany()
            .HasForeignKey(d => d.WalletId)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("FK__wallet_tr__walle__1AD3FDA4");
    }
}