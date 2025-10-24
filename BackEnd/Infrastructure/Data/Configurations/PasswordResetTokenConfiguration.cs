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
    public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
    {
        public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
        {
            builder.ToTable("password_reset_tokens");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(p => p.UserId)
                   .HasColumnName("user_id")
                   .IsRequired();

            builder.Property(p => p.OtpCode)
                   .HasColumnName("otp_code")
                   .HasMaxLength(10)
                   .IsRequired();

            builder.Property(p => p.ExpirationTime)
                   .HasColumnName("expiration_time")
                   .IsRequired();

            builder.Property(p => p.IsUsed)
                   .HasColumnName("is_used")
                   .HasDefaultValue(false);

            builder.Property(p => p.CreatedAt)
                   .HasColumnName("created_at")
                   .HasDefaultValueSql("GETDATE()");

            builder.HasOne<User>()
                   .WithMany()
                   .HasForeignKey(p => p.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
