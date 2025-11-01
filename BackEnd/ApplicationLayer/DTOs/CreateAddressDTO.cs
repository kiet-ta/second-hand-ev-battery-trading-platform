using System;

namespace Application.DTOs
{
    public class CreateAddressDTO
    {
        public string RecipientName { get; set; }
        public string Phone { get; set; }
        public string Street { get; set; }
        public string Ward { get; set; }
        public string District { get; set; }
        public string Province { get; set; }
        public int? WardCode { get; set; }
        public int? DistrictCode { get; set; }
        public int? ProvinceCode { get; set; }
        public bool IsDefault { get; set; }
    }
}
