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
    public class ReviewImageConfiguration : IEntityTypeConfiguration<ReviewImage>
    {
        public void Configure(EntityTypeBuilder<ReviewImage> entity)
        {
            entity.ToTable("Review_Image");

            entity.HasKey(e => e.ImageId);

            entity.Property(e => e.ImageId).HasColumnName("image_id");
            entity.Property(e => e.ReviewId).HasColumnName("review_id");
            entity.Property(e => e.ImageUrl).HasColumnName("image_url");

            // Relationship: Review_Image -> Review (many images per review)
            //entity.HasOne(ri => ri.Review)
            //      .WithMany(r => r.Images)
            //      .HasForeignKey(ri => ri.ReviewId)
            //      .HasConstraintName("FK_ReviewImage_Review")
            //      .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
