using System;

namespace Application.DTOs
{
    public class CreateAddressDTO
    {
        // hello world
        public int UserId { get; set; }
        public string RecipientName { get; set; }
        public string Phone { get; set; }
        public string Street { get; set; }
        public string Ward { get; set; }
        public string District { get; set; }
        public string Province { get; set; }
        public bool IsDefault { get; set; }
    }
}
