using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> entity)
        { 
            entity.HasKey(e => e.Id).HasName("PK__notifications__3213E83F");

            entity.ToTable("notifications");

            entity.Property(e => e.Id).HasColumnName("id");

            entity.Property(e => e.NotiType)
                .HasMaxLength(10)
                .IsRequired()
                .HasColumnName("noti_type");

            entity.Property(e => e.SenderId)
                .HasColumnName("sender_id");

            entity.Property(e => e.SenderRole)
                .HasMaxLength(10)
                .HasColumnName("sender_role");

            entity.Property(e => e.ReceiverId)
                .IsRequired()
                .HasColumnName("receiver_id");

            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");

            entity.Property(e => e.Message)
                .HasColumnName("message");

            entity.Property(e => e.IsRead)
                .HasDefaultValue(false)
                .HasColumnName("is_read");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("created_at");

          
            entity.HasOne<User>() 
                .WithMany()
                .HasForeignKey(e => e.SenderId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK__notifications__sender_id");

            entity.HasOne<User>() 
                .WithMany()
                .HasForeignKey(e => e.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK__notifications__receiver_id");
        }
    }
}
