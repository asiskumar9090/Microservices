using MongoDB.Driver;
using DriverService.Data;
using DriverService.Models;

namespace DriverService.Repositories
{
    public class DriverRepository : IDriverRepository
    {
        private readonly MongoDbContext _context;
        private readonly ILogger<DriverRepository> _logger;

        public DriverRepository(MongoDbContext context, ILogger<DriverRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        private IMongoCollection<Driver> GetDriversCollection()
        {
            if (!_context.IsConnected)
            {
                throw new InvalidOperationException("MongoDB is not connected. Please ensure MongoDB is running on localhost:27017");
            }
            return _context.Drivers;
        }

        public async Task<IEnumerable<Driver>> GetAllDriversAsync()
        {
            var drivers = GetDriversCollection();
            return await drivers.Find(_ => true).ToListAsync();
        }

        public async Task<Driver?> GetDriverByIdAsync(string id)
        {
            var drivers = GetDriversCollection();
            return await drivers.Find(d => d.Id == id).FirstOrDefaultAsync();
        }

        public async Task<Driver?> GetDriverByDriverIdAsync(Guid driverId)
        {
            var drivers = GetDriversCollection();
            return await drivers.Find(d => d.DriverID == driverId).FirstOrDefaultAsync();
        }

        public async Task<Driver?> GetDriverByLicenseNumberAsync(string licenseNumber)
        {
            var drivers = GetDriversCollection();
            return await drivers.Find(d => d.LicenseNumber == licenseNumber).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Driver>> GetDriversByStatusAsync(string status)
        {
            var drivers = GetDriversCollection();
            return await drivers.Find(d => d.Status == status).ToListAsync();
        }

        public async Task<Driver> CreateDriverAsync(Driver driver)
        {
            var drivers = GetDriversCollection();
            driver.DriverID = Guid.NewGuid();
            driver.CreatedAt = DateTime.UtcNow;
            driver.UpdatedAt = DateTime.UtcNow;
            await drivers.InsertOneAsync(driver);
            return driver;
        }

        public async Task<bool> UpdateDriverAsync(string id, Driver driver)
        {
            var drivers = GetDriversCollection();
            driver.UpdatedAt = DateTime.UtcNow;
            var result = await drivers.ReplaceOneAsync(d => d.Id == id, driver);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteDriverAsync(string id)
        {
            var drivers = GetDriversCollection();
            var result = await drivers.DeleteOneAsync(d => d.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<bool> DriverExistsAsync(string id)
        {
            var drivers = GetDriversCollection();
            var count = await drivers.CountDocumentsAsync(d => d.Id == id);
            return count > 0;
        }
    }
}
