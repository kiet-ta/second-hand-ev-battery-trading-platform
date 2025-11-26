using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.GhnDtos
{
    public class GhnFeeResponse
    {
        public int Code { get; set; }
        public string Message { get; set; } = null!;
        public GhnFeeData Data { get; set; } = null!;
    }
}
