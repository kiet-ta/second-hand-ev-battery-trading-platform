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
        public string? WardCode { get; set; }
        public string? DistrictCode { get; set; }
        public string? ProvinceCode { get; set; }
        public bool IsDefault { get; set; }
    }
}
