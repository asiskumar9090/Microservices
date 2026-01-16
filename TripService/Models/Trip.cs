using System.ComponentModel.DataAnnotations;

namespace TripService.Models
{
    public class Trip
    {
        [Key]
        public Guid TripID { get; set; } = Guid.NewGuid();

        [Required]
        public Guid VehicleID { get; set; }

        [Required]
        public Guid DriverID { get; set; }

        [Required]
        [StringLength(200)]
        public string StartLocation { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string EndLocation { get; set; } = string.Empty;

        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        public double DistanceTraveled { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "InProgress"; // InProgress, Completed, Cancelled

        public double AverageSpeed { get; set; }
        public double MaxSpeed { get; set; }
        public double FuelConsumed { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
