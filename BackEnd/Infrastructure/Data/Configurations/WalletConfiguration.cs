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
    public class WalletConfiguration : IEntityTypeConfiguration<Wallet>
    {
        public void Configure(EntityTypeBuilder<Wallet> entity)
        {
            entity.HasKey(e => e.WalletId).HasName("PK__Wallet__0EE6F041A32C537B");

            entity.ToTable("Wallet");

            entity.HasIndex(e => e.UserId, "UQ__Wallet__B9BE370EE0137BF7").IsUnique();

            entity.Property(e => e.WalletId).HasColumnName("wallet_id");
            entity.Property(e => e.Balance)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("balance");
            entity.Property(e => e.Currency)
                .HasMaxLength(10)
                .HasDefaultValue("VND")
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
                .HasConstraintName("FK__Wallet__user_id__114A936A");
        }
    }
}
