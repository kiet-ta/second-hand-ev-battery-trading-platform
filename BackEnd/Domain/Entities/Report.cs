namespace Domain.Entities
{
    public class Report
    {
        public int Id { get; set; }             
        public int UserId { get; set; }      
        public int? AssigneeId { get; set; }    
        public int SenderId { get; set; }    
        public string Type { get; set; }       
        public string Reason { get; set; }     
        public string? Detail { get; set; }    
        public DateTime? CreatedAt { get; set; } 
        public DateTime? BanAt { get; set; }   
        public int? Duration { get; set; }      
        public DateTime? UnbanAt { get; set; }  
        public string Status { get; set; }       
    }
}
