using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("item")]
    public class Item
    {
        [Key]
        [Column("item_id")]
        public int ItemId { get; set; }

        [Column("updated_by")] 
        public int? UpdatedBy { get; set; }

        [Column("item_type")]
        public string ItemType { get; set; }

        [Column("category_id")]
        public int? CategoryId { get; set; }

        [Column("title")]
        public string Title { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("price")]
        public decimal? Price { get; set; }

        [Column("quantity")]
        public int? Quantity { get; set; }

        [Column("status")]
        public string Status { get; set; }

        [Column("created_at")]
        public DateOnly CreatedAt { get; set; }

        [Column("updated_at")]
        public DateOnly UpdatedAt { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; }
    }
}
