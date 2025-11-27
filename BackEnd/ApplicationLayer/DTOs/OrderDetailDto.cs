using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class OrderDetailDto
    {
        public OrderItem Order { get; set; }

        public int AddressId { get; set; }
        public decimal FeeValue { get; set; }

        public decimal ShippingPrice { get; set; }

        public string PaymentMethod { get; set; }
        public decimal TotalAmount { get; set; }

    }
}
