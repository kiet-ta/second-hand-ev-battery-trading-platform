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
    public class NewsConfiguration : IEntityTypeConfiguration<News>
    {
        public void Configure(EntityTypeBuilder<News> entity)
        {
            entity.HasKey(e => e.NewsId).HasName("PK__blogs__2975AA280A34B096");

            entity.ToTable("news");

            entity.Property(e => e.NewsId).HasColumnName("news_id");
            entity.Property(e => e.AuthorId).HasColumnName("author_id");
            entity.Property(e => e.Category)
                .HasMaxLength(100)
                .HasColumnName("category");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.PublishDate).HasColumnName("publish_date");
            entity.Property(e => e.Summary).HasColumnName("summary");
            entity.Property(e => e.Tags)
                .HasMaxLength(255)
                .HasColumnName("tags");
            entity.Property(e => e.ThumbnailUrl)
                .HasMaxLength(255)
                .HasColumnName("thumbnail_url");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("pending")
                .HasColumnName("status");

            entity.HasOne<User>().WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__blogs__user_id__00200768");
        }
    }
}
