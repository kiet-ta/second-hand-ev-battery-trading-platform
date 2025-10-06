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
    public class ItemImageConfiguration : IEntityTypeConfiguration<ItemImage>
    {
        public void Configure(EntityTypeBuilder<ItemImage> entity)
        {
            entity.ToTable("Item_Image");

            entity.HasKey(e => e.ImageId);

            entity.Property(e => e.ImageId).HasColumnName("image_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.ImageUrl).HasColumnName("image_url");

            // Relationship: Item_Image many -> Item one
            //entity.HasOne(i => i.Item)
            //      .WithMany(it => it.Images)
            //      .HasForeignKey(i => i.ItemId)
            //      .HasConstraintName("FK_ItemImage_Item")
            //      .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
