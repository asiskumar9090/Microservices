using VehicleService.Models;

namespace VehicleService.Repositories
{
    public interface IVehicleRepository
    {
        Task<IEnumerable<Vehicle>> GetAllVehiclesAsync();
        Task<Vehicle?> GetVehicleByIdAsync(Guid id);
        Task<Vehicle?> GetVehicleByLicensePlateAsync(string licensePlate);
        Task<Vehicle> CreateVehicleAsync(Vehicle vehicle);
        Task<Vehicle?> UpdateVehicleAsync(Guid id, Vehicle vehicle);
        Task<bool> DeleteVehicleAsync(Guid id);
        Task<bool> VehicleExistsAsync(Guid id);
    }
}
