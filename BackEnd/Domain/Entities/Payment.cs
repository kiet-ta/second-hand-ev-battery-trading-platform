using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("payment")]
    public class Payment
    {
        [Key]
        [Column("payment_id")]
        public int PaymentId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("order_code")]
        public long OrderCode { get; set; }

        [Column("total_amount")]
        public decimal TotalAmount { get; set; }

        [Column("currency")]
        public string Currency { get; set; }

        [Column("method")]
        public string Method { get; set; }

        [Column("status")]
        public string Status { get; set; }

        [Column("expired_at")]
        public DateTime? ExpiredAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
