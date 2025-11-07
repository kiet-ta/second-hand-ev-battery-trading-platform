using Domain.Common.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ItemDtos.BatteryDto
{
    public class CreateBatteryDetailDto
    {
        public int? CategoryId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public int Quantity { get; set; } = 1;
        public string Status { get; set; } = ItemStatus.Active_ItemStatus.ToString();
        public int? UpdatedBy { get; set; }

        public string? Brand { get; set; }
        public int? Capacity { get; set; }
        public decimal? Voltage { get; set; }
        public int? ChargeCycles { get; set; }
    }
}
