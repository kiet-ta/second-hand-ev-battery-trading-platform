using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("orders")]
    public class Order
    {
        [Key]
        [Column("order_id")]
        public int OrderId { get; set; }

        [Column("buyer_id")]
        public int BuyerId { get; set; }

        [Column("address_id")]
        public int AddressId { get; set; }

        [Column("status")]
        public string Status { get; set; }

        [Column("created_at")]
        public DateOnly CreatedAt { get; set; }

        [Column("updated_at")]
        public DateOnly? UpdatedAt { get; set; }
    }
}
