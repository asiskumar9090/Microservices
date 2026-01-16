namespace TripService.DTOs
{
    public class TripDto
    {
        public Guid TripID { get; set; }
        public Guid VehicleID { get; set; }
        public Guid DriverID { get; set; }
        public string StartLocation { get; set; } = string.Empty;
        public string EndLocation { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public double DistanceTraveled { get; set; }
        public string Status { get; set; } = string.Empty;
        public double AverageSpeed { get; set; }
        public double MaxSpeed { get; set; }
        public double FuelConsumed { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateTripDto
    {
        public Guid VehicleID { get; set; }
        public Guid DriverID { get; set; }
        public string StartLocation { get; set; } = string.Empty;
        public string EndLocation { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
    }

    public class EndTripDto
    {
        public DateTime EndTime { get; set; }
        public double DistanceTraveled { get; set; }
        public double AverageSpeed { get; set; }
        public double MaxSpeed { get; set; }
        public double FuelConsumed { get; set; }
    }
}
