using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    [Table("Address")]
    public class Address
    {
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



