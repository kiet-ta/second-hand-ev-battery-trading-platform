namespace Application.DTOs
{
    public class BiddingDto
    {
        public int BidId { get; set; }
        public int UserId { get; set; }
        public decimal BidAmount { get; set; }
        public DateTime BidTime { get; set; }
    }
}