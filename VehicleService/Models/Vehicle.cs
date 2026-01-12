using System.ComponentModel.DataAnnotations;

namespace VehicleService.Models
{
    public class Vehicle
    {
        [Key]
        public Guid VehicleID { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(20)]
        public string LicensePlate { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Model { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Active"; // Active, Inactive, Maintenance

        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string LastKnownLocation { get; set; } = string.Empty;

        public double CurrentSpeed { get; set; }
        public double FuelLevel { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
