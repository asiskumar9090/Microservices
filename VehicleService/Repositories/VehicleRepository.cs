using Microsoft.EntityFrameworkCore;
using VehicleService.Data;
using VehicleService.Models;

namespace VehicleService.Repositories
{
    public class VehicleRepository : IVehicleRepository
    {
        private readonly VehicleDbContext _context;

        public VehicleRepository(VehicleDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Vehicle>> GetAllVehiclesAsync()
        {
            return await _context.Vehicles.ToListAsync();
        }

        public async Task<Vehicle?> GetVehicleByIdAsync(Guid id)
        {
            return await _context.Vehicles.FindAsync(id);
        }

        public async Task<Vehicle?> GetVehicleByLicensePlateAsync(string licensePlate)
        {
            return await _context.Vehicles
                .FirstOrDefaultAsync(v => v.LicensePlate == licensePlate);
        }

        public async Task<Vehicle> CreateVehicleAsync(Vehicle vehicle)
        {
            vehicle.VehicleID = Guid.NewGuid();
            vehicle.LastUpdated = DateTime.UtcNow;
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();
            return vehicle;
        }

        public async Task<Vehicle?> UpdateVehicleAsync(Guid id, Vehicle vehicle)
        {
            var existingVehicle = await _context.Vehicles.FindAsync(id);
            if (existingVehicle == null)
                return null;

            existingVehicle.LicensePlate = vehicle.LicensePlate;
            existingVehicle.Model = vehicle.Model;
            existingVehicle.Status = vehicle.Status;
            existingVehicle.Latitude = vehicle.Latitude;
            existingVehicle.Longitude = vehicle.Longitude;
            existingVehicle.LastKnownLocation = vehicle.LastKnownLocation;
            existingVehicle.CurrentSpeed = vehicle.CurrentSpeed;
            existingVehicle.FuelLevel = vehicle.FuelLevel;
            existingVehicle.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingVehicle;
        }

        public async Task<bool> DeleteVehicleAsync(Guid id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
                return false;

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> VehicleExistsAsync(Guid id)
        {
            return await _context.Vehicles.AnyAsync(v => v.VehicleID == id);
        }
    }
}
