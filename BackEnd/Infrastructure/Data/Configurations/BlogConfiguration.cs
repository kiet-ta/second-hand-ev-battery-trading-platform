using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class BlogConfiguration : IEntityTypeConfiguration<Blog>
{
    public void Configure(EntityTypeBuilder<Blog> entity)
    {
        entity.ToTable("blogs");

        entity.HasKey(e => e.BlogId);

        entity.Property(e => e.BlogId).HasColumnName("blog_id");
        entity.Property(e => e.UserId).HasColumnName("user_id");
        entity.Property(e => e.Title).HasColumnName("title");
        entity.Property(e => e.PublishDate).HasColumnName("publish_date");
        entity.Property(e => e.Category).HasColumnName("category");
        entity.Property(e => e.Summary).HasColumnName("summary");
        entity.Property(e => e.AuthorId).HasColumnName("author_id");
        entity.Property(e => e.ThumbnailUrl).HasColumnName("thumbnail_url");
        entity.Property(e => e.Content).HasColumnName("content");
        entity.Property(e => e.Tags).HasColumnName("tags");
    }
}