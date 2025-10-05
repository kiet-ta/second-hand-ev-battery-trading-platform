using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("payment_detail")]
    public class PaymentDetail
    {
        [Key]
        [Column("payment_detail_id")]
        public int PaymentDetailId { get; set; }

        [Column("payment_id")]
        public int PaymentId { get; set; }

        [Column("order_id")]
        public int? OrderId { get; set; }

        [Column("item_id")]
        public int? ItemId { get; set; }

        [Column("amount")]
        public decimal Amount { get; set; }
    }
}
