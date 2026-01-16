using DriverService.Models;

namespace DriverService.Repositories
{
    public interface IDriverRepository
    {
        Task<IEnumerable<Driver>> GetAllDriversAsync();
        Task<Driver?> GetDriverByIdAsync(string id);
        Task<Driver?> GetDriverByDriverIdAsync(Guid driverId);
        Task<Driver?> GetDriverByLicenseNumberAsync(string licenseNumber);
        Task<IEnumerable<Driver>> GetDriversByStatusAsync(string status);
        Task<Driver> CreateDriverAsync(Driver driver);
        Task<bool> UpdateDriverAsync(string id, Driver driver);
        Task<bool> DeleteDriverAsync(string id);
        Task<bool> DriverExistsAsync(string id);
    }
}
