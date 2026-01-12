namespace VehicleService.DTOs
{
    public class VehicleDto
    {
        public Guid VehicleID { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string LastKnownLocation { get; set; } = string.Empty;
        public double CurrentSpeed { get; set; }
        public double FuelLevel { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class CreateVehicleDto
    {
        public string LicensePlate { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string LastKnownLocation { get; set; } = string.Empty;
        public double CurrentSpeed { get; set; }
        public double FuelLevel { get; set; }
    }

    public class UpdateVehicleDto
    {
        public string? LicensePlate { get; set; }
        public string? Model { get; set; }
        public string? Status { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? LastKnownLocation { get; set; }
        public double? CurrentSpeed { get; set; }
        public double? FuelLevel { get; set; }
    }

    public class VehicleLocationUpdateDto
    {
        public Guid VehicleID { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Location { get; set; } = string.Empty;
        public double Speed { get; set; }
        public double FuelLevel { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
