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
    public class ReviewConfiguration : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> entity)
        {
            entity.ToTable("reviews");

            entity.HasKey(e => e.ReviewId);

            entity.Property(e => e.ReviewId).HasColumnName("review_id");
            entity.Property(e => e.ReviewerId).HasColumnName("reviewer_id");
            entity.Property(e => e.TargetUserId).HasColumnName("target_user_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasMany(e => e.ReviewImages)
              .WithOne(img => img.Review)
              .HasForeignKey(img => img.ReviewId)
              .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Item)
                .WithMany(i => i.Reviews)
                .HasForeignKey(e => e.ItemId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.CreatedAt)
      .HasColumnName("created_at")
      .HasConversion(
          v => v.HasValue ? v.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
          v => v.HasValue ? DateOnly.FromDateTime(v.Value) : null
      )
      .HasDefaultValueSql("CAST(GETDATE() AS DATE)");

            entity.Property(e => e.UpdatedAt)
                  .HasColumnName("updated_at")
                  .HasConversion(
                      v => v.HasValue ? v.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
                      v => v.HasValue ? DateOnly.FromDateTime(v.Value) : null
                  )
                  .HasDefaultValueSql("CAST(GETDATE() AS DATE)");

        }
    }
}
