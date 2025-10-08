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
            entity.ToTable("items");

            entity.HasKey(e => e.ItemId);

            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.ItemType).HasColumnName("item_type").HasMaxLength(20);//.IsRequired();
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200);//.IsRequired();
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Price).HasColumnName("price").HasColumnType("decimal(18,2)");
            entity.Property(e => e.Quantity).HasColumnName("quantity").HasDefaultValue(1);
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");

            entity.HasOne<Category>()              //Relationship: Item -> Category (many items belong to one category)
                   .WithMany()
                   .HasForeignKey(i => i.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict);

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

            entity.HasMany(i => i.Reviews)
                  .WithOne(r => r.Item)
                  .HasForeignKey(r => r.ItemId)
                  .OnDelete(DeleteBehavior.Cascade);


        }
    }
}
