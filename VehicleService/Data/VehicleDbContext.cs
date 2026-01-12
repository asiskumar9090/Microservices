using Microsoft.EntityFrameworkCore;
using VehicleService.Models;

namespace VehicleService.Data
{
    public class VehicleDbContext : DbContext
    {
        public VehicleDbContext(DbContextOptions<VehicleDbContext> options) : base(options)
        {
        }

        public DbSet<Vehicle> Vehicles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Vehicle>(entity =>
            {
                entity.HasKey(v => v.VehicleID);
                entity.HasIndex(v => v.LicensePlate).IsUnique();
                entity.Property(v => v.Status).HasDefaultValue("Active");
            });

            // Seed data
            modelBuilder.Entity<Vehicle>().HasData(
                new Vehicle
                {
                    VehicleID = Guid.NewGuid(),
                    LicensePlate = "ABC-1234",
                    Model = "Ford Transit",
                    Status = "Active",
                    Latitude = 40.7128,
                    Longitude = -74.0060,
                    LastKnownLocation = "New York, NY",
                    CurrentSpeed = 45.5,
                    FuelLevel = 75.0,
                    LastUpdated = DateTime.UtcNow
                },
                new Vehicle
                {
                    VehicleID = Guid.NewGuid(),
                    LicensePlate = "XYZ-5678",
                    Model = "Mercedes Sprinter",
                    Status = "Active",
                    Latitude = 34.0522,
                    Longitude = -118.2437,
                    LastKnownLocation = "Los Angeles, CA",
                    CurrentSpeed = 60.0,
                    FuelLevel = 50.0,
                    LastUpdated = DateTime.UtcNow
                }
            );
        }
    }
}
