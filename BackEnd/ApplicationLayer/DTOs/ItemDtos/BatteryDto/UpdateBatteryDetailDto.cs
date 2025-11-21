using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ItemDtos.BatteryDto
{
    public class UpdateBatteryDetailDto
    {
        public string? Brand { get; set; }
        public int? Capacity { get; set; }
        public decimal? Voltage { get; set; }
        public int? ChargeCycles { get; set; }
    }
}
