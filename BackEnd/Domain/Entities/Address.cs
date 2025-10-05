using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("address")]
    public class Address
    {
        [Key]
        [Column("address_id")]
        public int AddressId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("recipient_name")]
        public string RecipientName { get; set; }

        [Column("phone")]
        public string Phone { get; set; }

        [Column("street")]
        public string Street { get; set; }

        [Column("ward")]
        public string Ward { get; set; }

        [Column("district")]
        public string District { get; set; }

        [Column("province")]
        public string Province { get; set; }

        [Column("is_default")]
        public bool IsDefault { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; }
    }
}
