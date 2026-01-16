using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace DriverService.Models
{
    public class Driver
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("driverId")]
        public Guid DriverID { get; set; } = Guid.NewGuid();

        [BsonElement("name")]
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [BsonElement("licenseNumber")]
        [Required]
        [StringLength(50)]
        public string LicenseNumber { get; set; } = string.Empty;

        [BsonElement("assignedVehicleId")]
        public Guid? AssignedVehicleID { get; set; }

        [BsonElement("status")]
        [StringLength(20)]
        public string Status { get; set; } = "Active"; // Active, Suspended

        [BsonElement("phoneNumber")]
        [StringLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [BsonElement("email")]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [BsonElement("dateOfBirth")]
        public DateTime DateOfBirth { get; set; }

        [BsonElement("hireDate")]
        public DateTime HireDate { get; set; } = DateTime.UtcNow;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
