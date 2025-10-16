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
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("notifications");

            builder.HasKey(n => n.Id);

            builder.Property(n => n.NotiType)
                .HasColumnName("noti_type")
                .IsRequired()
                .HasMaxLength(10);

            builder.Property(n => n.SenderRole)
                .HasColumnName("sender_role")
                .HasMaxLength(10);

            builder.Property(n => n.Title)
                .HasColumnName("title")
                .HasMaxLength(255);

            builder.Property(n => n.Message)
                .HasColumnName("message");

            builder.Property(n => n.IsRead)
                .HasColumnName("is_read")
                .HasDefaultValue(false);

            builder.Property(n => n.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("GETDATE()");

            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(n => n.SenderId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(n => n.ReceiverId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
