using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("item_image")]
    public class ItemImage
    {
        [Key]
        [Column("image_id")]
        public int ImageId { get; set; }

        [Column("item_id")]
        public int ItemId { get; set; }

        [Column("image_url")]
        public string ImageUrl { get; set; }
    }
}
