using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.GhnDtos
{
    public class GhnFeeData
    {
        public int Cod_failed_fee { get; set; }
        public int Cod_fee { get; set; }
        public int Coupon_value { get; set; }
        public int Deliver_remote_areas_fee { get; set; }
        public int Document_return { get; set; }
        public int Double_check { get; set; }
        public int Insurance_fee { get; set; }
        public int Pick_remote_areas_fee { get; set; }
        public int Pick_station_fee { get; set; }
        public int R2s_fee { get; set; }
        public int Return_again { get; set; }
        public int Service_fee { get; set; }
        public int Total { get; set; }
    }
}
