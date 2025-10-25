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
    public class ItemConfiguration : IEntityTypeConfiguration<Item>
    {
        public void Configure(EntityTypeBuilder<Item> entity)
        {
            entity.HasKey(e => e.ItemId).HasName("PK__items__52020FDDC6EF3406");

            entity.ToTable("items");

            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IsDeleted)
                .HasDefaultValue(false)
                .HasColumnName("is_deleted");
            entity.Property(e => e.ItemType)
                .HasMaxLength(20)
                .HasColumnName("item_type");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("price");
            entity.Property(e => e.Quantity)
                .HasDefaultValue(1)
                .HasColumnName("quantity");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");
            entity.Property(e => e.Moderation)
                .HasDefaultValue("reject_tag")
                .HasColumnName("moderation");

            entity.HasOne<Category>().WithMany()
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK__items__category___3F466844");

            entity.HasOne<User>()                  // UpdatedBy → User, Relationship: Item updated_by -> Users (many items can be updated by one user)
                   .WithMany()
                   .HasForeignKey(i => i.UpdatedBy)
                   .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<EVDetail>()              // Item ↔ EVDetail (1-1)
                   .WithOne()
                   .HasForeignKey<EVDetail>(ev => ev.ItemId)
                   .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<BatteryDetail>()         // Item ↔ BatteryDetail (1-1)
                   .WithOne()
                   .HasForeignKey<BatteryDetail>(b => b.ItemId)
                   .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany<Review>()
                  .WithOne()
                  .HasForeignKey(r => r.ItemId)
                  .OnDelete(DeleteBehavior.Cascade);


        }
    }
}