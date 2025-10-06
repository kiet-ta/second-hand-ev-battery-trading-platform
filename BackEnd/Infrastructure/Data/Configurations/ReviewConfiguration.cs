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
            entity.ToTable("Review");

            entity.HasKey(e => e.ReviewId);

            entity.Property(e => e.ReviewId).HasColumnName("review_id");
            entity.Property(e => e.ReviewerId).HasColumnName("reviewer_id");
            entity.Property(e => e.TargetUserId).HasColumnName("target_user_id");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            // Relationship: Review -> Reviewer (User)
            //entity.HasOne(r => r.Reviewer)
            //      .WithMany(u => u.ReviewsGiven)
            //      .HasForeignKey(r => r.ReviewerId)
            //      .HasConstraintName("FK_Review_Reviewer");

            // Relationship: Review -> TargetUser (User)
            //entity.HasOne(r => r.TargetUser)
            //      .WithMany(u => u.ReviewsReceived)
            //      .HasForeignKey(r => r.TargetUserId)
            //      .HasConstraintName("FK_Review_TargetUser");
        }
    }
}
