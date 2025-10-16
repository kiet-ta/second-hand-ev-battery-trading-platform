using Application.DTOs.ItemDtos;
using Application.DTOs.ItemDtos.BatteryDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UserDtos
{
    public class UserItemDetailDto
    {
        public UserDto Seller { get; set; } = null!;
        public ItemDto Item { get; set; } = null!;
        public EVDetailDto? EVDetail { get; set; }
        public BatteryDetailDto? BatteryDetail { get; set; }
    }
}
