namespace Application.DTOs
{
    public class CreateAuctionRequest
    {
        public int ItemId { get; set; }
        public decimal StartingPrice { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}