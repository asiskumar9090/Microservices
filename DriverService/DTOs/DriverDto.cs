namespace DriverService.DTOs
{
    public class DriverDto
    {
        public string? Id { get; set; }
        public Guid DriverID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public Guid? AssignedVehicleID { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public DateTime HireDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateDriverDto
    {
        public string Name { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public Guid? AssignedVehicleID { get; set; }
        public string Status { get; set; } = "Active";
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public DateTime? HireDate { get; set; }
    }

    public class UpdateDriverDto
    {
        public string? Name { get; set; }
        public string? LicenseNumber { get; set; }
        public Guid? AssignedVehicleID { get; set; }
        public string? Status { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }

    public class AssignVehicleDto
    {
        public Guid VehicleID { get; set; }
    }
}
