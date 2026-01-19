using System.ComponentModel.DataAnnotations;

namespace AlertService.Models
{
    public class NotificationMessage
    {
        [Key]
        public int Id { get; set; }
        
        public string Event { get; set; } = string.Empty;
        
        public string Source { get; set; } = string.Empty; // "Kafka" or "RabbitMQ"
        
        public string Message { get; set; } = string.Empty;
        
        public string Payload { get; set; } = string.Empty; // JSON payload
        
        public DateTime ReceivedAt { get; set; }
        
        public DateTime? ProcessedAt { get; set; }
        
        public string Status { get; set; } = "Received"; // Received, Processed, Failed
    }
}
