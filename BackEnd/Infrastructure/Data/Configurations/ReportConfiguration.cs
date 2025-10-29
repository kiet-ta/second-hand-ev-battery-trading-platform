using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class ReportConfiguration : IEntityTypeConfiguration<Report>
    {
        public void Configure(EntityTypeBuilder<Report> entity)
        {
            entity.ToTable("reports");

            entity.HasKey(e => e.Id)
                .HasName("PK__reports__report_id");

            entity.Property(e => e.Id)
                .HasColumnName("report_id");

            entity.Property(e => e.UserId)
                .IsRequired()
                .HasColumnName("user_id");

            entity.Property(e => e.AssigneeId)
                .HasColumnName("assignee_id");

            entity.Property(e => e.SenderId)
                .IsRequired()
                .HasColumnName("sender_id");

            entity.Property(e => e.Type)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnName("type");

            entity.Property(e => e.Reason)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnName("reason");

            entity.Property(e => e.Detail)
                .HasColumnType("nvarchar(max)")
                .HasColumnName("detail");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("createAt")
                .HasColumnType("datetime")
                .HasDefaultValueSql("GETDATE()");

            entity.Property(e => e.BanAt)
                .HasColumnName("banAt")
                .HasColumnType("datetime");

            entity.Property(e => e.Duration)
                .HasColumnName("duration");

            entity.Property(e => e.UnbanAt)
                .HasColumnName("unbanAt")
                .HasColumnType("datetime");

            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnName("status")
                .HasDefaultValue("pending");

            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_reports_user_id_44952D46");

            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.AssigneeId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_reports_assignee_id_4589517F");

            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.SenderId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_reports_sender_id_467D75B8");
        }
    }
}
