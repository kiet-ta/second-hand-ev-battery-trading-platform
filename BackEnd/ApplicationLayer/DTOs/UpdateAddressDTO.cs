using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class UpdateAddressDTO
    {
        public string RecipientName { get; set; }
        public string Phone { get; set; }
        public string Street { get; set; }
        public string Ward { get; set; }
        public string District { get; set; }
        public string Province { get; set; }
        public string? WardCode { get; set; }
        public int? DistrictCode { get; set; }
        public int? ProvinceCode { get; set; }
        public bool IsDefault { get; set; }
    }
}
